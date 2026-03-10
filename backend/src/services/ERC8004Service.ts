import { identityRegistryABI } from "../ABIs/identityABI";
import { reputationRegistryABI } from "../ABIs/reputationABI";
import { AgentProfile } from "../types/registrationTypes";

import { ethers } from "ethers";
import dotenv from 'dotenv';
import { addresses } from "../constants/Addresses";
dotenv.config();

async function getAgentRegistration(agentId: number) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER);
        const identityRegistry = new ethers.Contract(addresses.IDENTITY_REGISTRY, identityRegistryABI, provider);
        const agentURI = await identityRegistry.tokenURI(agentId);
        console.log(agentURI);
        
        const base64Data = agentURI.startsWith('data:application/json;base64,') 
        ? agentURI.split(',')[1] 
        : agentURI;
  
        const decodedString = Buffer.from(base64Data, 'base64').toString('utf-8');

        const parsedData = JSON.parse(decodedString) as AgentProfile;
        console.log(parsedData);
    } catch (error) {
        console.log(error);
    }
}

async function getAgentReputation(agentId: number) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER);
        const reputationRegistry = new ethers.Contract(addresses.REPUTATION_REGISTRY, reputationRegistryABI, provider);
        
        const clients = await reputationRegistry.getClients(agentId);
        console.log(clients);

    } catch (error) {
        console.log(error);
    }
}

getAgentReputation(2340);