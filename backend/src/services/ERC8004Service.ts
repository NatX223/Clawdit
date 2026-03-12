import { identityRegistryABI } from "../ABIs/identityABI";
import { reputationRegistryABI } from "../ABIs/reputationABI";
import { AgentProfile } from "../types/registrationTypes";

import { ethers } from "ethers";
import dotenv from 'dotenv';
import { addresses } from "../constants/Addresses";
import { agentTags } from "../constants/agentTags";

dotenv.config();

export async function getAgentRegistration(agentId: number) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.PROVIDER);
        const identityRegistry = new ethers.Contract(addresses.IDENTITY_REGISTRY, identityRegistryABI, provider);
        
        const agentURI = await identityRegistry.tokenURI(agentId);
        console.log(`Fetched URI for Agent ${agentId}:`, agentURI);
        
        // 1. Handle Base64 Encoded JSON (On-Chain)
        if (agentURI.startsWith('data:application/json;base64,')) {
            const base64Data = agentURI.split(',')[1];
            const decodedString = Buffer.from(base64Data, 'base64').toString('utf-8');
            const parsedData = JSON.parse(decodedString) as AgentProfile;
            
            return parsedData;
        } 
        // 2. Handle IPFS URI (Off-Chain)
        else if (agentURI.startsWith('ipfs://')) {
            // Extract the CID and build the Pinata gateway URL
            const cid = agentURI.replace('ipfs://', '');
            const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
            
            console.log(`Fetching profile from IPFS: ${gatewayUrl}`);
            
            // Fetch the JSON file from the gateway
            const response = await fetch(gatewayUrl);
            
            if (!response.ok) {
                throw new Error(`IPFS fetch failed with HTTP status: ${response.status}`);
            }
            
            const parsedData = await response.json() as AgentProfile;
            return parsedData;
            
        } 
        else if (agentURI.startsWith('https://')) {            
            console.log(`Fetching profile using HTTPS: ${agentURI}`);
            
            // Fetch the JSON file from the URL
            const response = await fetch(agentURI);
            
            if (!response.ok) {
                throw new Error(`IPFS fetch failed with HTTP status: ${response.status}`);
            }
            
            const parsedData = await response.json() as AgentProfile;
            return parsedData;
            
        } 
        // 3. Handle unknown formats
        else {
            throw new Error(`Unsupported URI format returned: ${agentURI}`);
        }

    } catch (error) {
        console.error(`❌ Failed to fetch registration for agent ${agentId}:`, error);
    }
}

export async function getAgentClients(agentId: number) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.PROVIDER);
        const reputationRegistry = new ethers.Contract(addresses.REPUTATION_REGISTRY, reputationRegistryABI, provider);
        
        const clients = await reputationRegistry.getClients(agentId);
        return clients;
    } catch (error) {
        console.log(error);
    }
}

export async function getAgentWallet(agentId: number) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.PROVIDER);
        const identityRegistry = new ethers.Contract(addresses.IDENTITY_REGISTRY, identityRegistryABI, provider);

        const wallet = await identityRegistry.getAgentWallet(agentId);
        return wallet;
    } catch (error) {
        console.log(error);
    }
}

export async function getAgentReputation(agentId: number) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.PROVIDER);
        const reputationRegistry = new ethers.Contract(addresses.REPUTATION_REGISTRY, reputationRegistryABI, provider);

        const currentBlock = await provider.getBlockNumber();
        const blocksInTwoMonths = Math.floor(5184000 / 12);
        let targetStartBlock = currentBlock - blocksInTwoMonths;
        if (targetStartBlock < 0) targetStartBlock = 0;

        const filter = reputationRegistry.filters.NewFeedback(agentId);
        const CHUNK_SIZE = 10000; 
        let recentFeedbacks: any[] = [];
        let toBlock = currentBlock;

        while (toBlock >= targetStartBlock && recentFeedbacks.length < 50) {
            let fromBlock = toBlock - CHUNK_SIZE;
            if (fromBlock < targetStartBlock) fromBlock = targetStartBlock;

            const chunkEvents = await reputationRegistry.queryFilter(filter, fromBlock, toBlock);

            if (chunkEvents.length > 0) {
                const parsedChunk = chunkEvents.map((event: any) => {
                    const args = event.args;
                    const decimals = Number(args[4] || 0);

                    return {
                        clientAddress: args[1],
                        // Format the value based on decimals to avoid large BigInts or NaN
                        value: decimals > 0 
                            ? parseFloat(ethers.formatUnits(args[3], decimals)) 
                            : Number(args[3]),
                        tag1: args[6],
                        tag2: args[7]
                    };
                }).reverse(); 

                recentFeedbacks.push(...parsedChunk);
            }
            toBlock = fromBlock - 1; 
        }

        const finalFeedbacks = recentFeedbacks.slice(0, 50);
        
        console.log(`✅ Successfully extracted ${finalFeedbacks.length} feedbacks.`);
        return finalFeedbacks;

    } catch (error) {
        console.error("❌ Failed to fetch reputation events:", error);
        return [];
    }
}

export async function getReputationReport(agentId: number) {
    try {
        console.log(`🔍 Starting Risk Analysis for Agent ${agentId}...`);

        // 1. Fetch all data concurrently for speed
        const [profile, reputation, clients] = await Promise.all([
            getAgentRegistration(agentId),
            getAgentReputation(agentId),
            getAgentClients(agentId)
        ]);

        if (!profile) throw new Error("Agent profile not found.");

        // ==========================================
        // METRIC 1: Reputation Density & Sybil Risk
        // ==========================================
        const totalFeedbacks = reputation.length;
        let averageScore = 0;
        let sybilRisk = "LOW";
        let topClientConcentration = 0;

        if (totalFeedbacks > 0) {
            // Calculate Average Score
            const totalScore = reputation.reduce((acc, curr) => acc + curr.value, 0);
            averageScore = totalScore / totalFeedbacks;

            // Sybil Resistance: Count feedback per client
            const clientCounts: Record<string, number> = {};
            reputation.forEach(f => {
                clientCounts[f.clientAddress] = (clientCounts[f.clientAddress] || 0) + 1;
            });

            const topClientCount = Math.max(...Object.values(clientCounts));
            topClientConcentration = topClientCount / totalFeedbacks;

            if (topClientConcentration >= 0.8) sybilRisk = "HIGH (Possible Self-Sybil)";
            else if (topClientConcentration >= 0.5) sybilRisk = "MEDIUM";
        }

        // ==========================================
        // METRIC 2: Technical Utility & Revenue Potential
        // ==========================================
        // Gather all claimed skills and capabilities
        const claimedSkills = new Set([
            ...(profile.oasf_skills || []),
            ...(profile.endpoints?.flatMap(e => e.capabilities || []) || [])
        ].map(s => s.toLowerCase()));

        // Check if feedbacks match claimed skills
        let verifiedSkillsCount = 0;
        const feedbackTags = reputation.flatMap(f => [f.tag1.toLowerCase(), f.tag2.toLowerCase()]);
        
        claimedSkills.forEach(skill => {
            if (feedbackTags.includes(skill)) verifiedSkillsCount++;
        });

        const utilityScore = claimedSkills.size > 0 
            ? (verifiedSkillsCount / claimedSkills.size) * 100 
            : 0;

        // ==========================================
        // METRIC 3: Liveliness and Stability
        // ==========================================
        // const currentTime = Math.floor(Date.now() / 1000);
        // const daysSinceLastActivity = (currentTime - lastActivity) / 86400;
        // const agentAgeDays = (currentTime - createdAt) / 86400;
        
        // let livelinessStatus = "ACTIVE";
        // if (daysSinceLastActivity > 30) livelinessStatus = "STALE (High Risk)";
        // else if (daysSinceLastActivity > 14) livelinessStatus = "IDLE (Warning)";

        // ==========================================
        // METRIC 4: Attestation Hierarchy
        // ==========================================
        const trusts = (profile.supportedTrust || []).map(t => t.toLowerCase());
        let trustTier = "Tier 3: Reputation Only (Highest Risk)";
        
        if (trusts.some(t => t.includes("tee") || t.includes("enclave"))) {
            trustTier = "Tier 2: TEE-Attestation (Lowest Risk)";
        } else if (trusts.some(t => t.includes("crypto") || t.includes("stake"))) {
            trustTier = "Tier 1: Cryptoeconomic (Medium Risk)";
        }

        // ==========================================
        // FINAL REPORT GENERATION
        // ==========================================
        const riskReport = {
            agentId,
            name: profile.name,
            reputationDensity: {
                totalFeedbacks,
                averageScore: averageScore.toFixed(2),
                uniqueClients: clients?.length || 0,
                sybilRisk,
                topClientConcentration: `${(topClientConcentration * 100).toFixed(1)}%`
            },
            technicalUtility: {
                claimedSkills: Array.from(claimedSkills),
                verifiedSkillsPercentage: `${utilityScore.toFixed(1)}%`,
                revenuePotential: utilityScore > 50 ? "HIGH" : "LOW"
            },
            // liveliness: {
            //     agentAgeDays: agentAgeDays.toFixed(1),
            //     daysSinceLastActivity: daysSinceLastActivity.toFixed(1),
            //     status: livelinessStatus
            // },
            trustModel: {
                declaredTrusts: profile.supportedTrust,
                riskTier: trustTier
            }
        };

        console.log("✅ Risk Analysis Complete:\n", JSON.stringify(riskReport, null, 2));
        // return riskReport;
        console.log(riskReport);
        

    } catch (error) {
        console.error(`❌ Failed to analyze agent ${agentId}:`, error);
        throw error;
    }
}