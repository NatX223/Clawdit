import axios from 'axios';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { getAgentWallet } from './ERC8004Service.js';
import { RevenueReport } from '../types/revenueType.js';
dotenv.config();

export async function getTokenTransfers(address: string) {
    try {
        const response = await axios.get(
            `https://wdk-api.tether.io/api/v1/sepolia/usdt/${address}/token-transfers`,
            {
                headers: {
                    'x-api-key': process.env.WDK_API_KEY
                }
            }
        );
        return response.data.transfers || [];
    } catch (error) {
        console.error(`❌ Failed to fetch transfers for ${address}:`, error);
        return [];
    }
}

export async function getLoanRepayment(borrowerAddress: string, lenderAddress: string) {
    try {
        const transfers = await getTokenTransfers(borrowerAddress);

        const paymentTransfers = transfers.filter((t: any) => {
            const isFromBorrower = t.from.toLowerCase() === borrowerAddress.toLowerCase();
            const isToLender = t.to.toLowerCase() === lenderAddress.toLowerCase();
            
            return isFromBorrower && isToLender;
        });

        // Sum up repayment amounts
        const totalRepayment = paymentTransfers.reduce(
            (sum: number, t: any) => sum + Number(t.amount),
            0
        );
        const payment = Number(totalRepayment);

        return payment;
    } catch (error) {
        console.error(`💥 Error fetching loan repayment data`, error);
        throw error;
    }
}

export async function getTokenBalances(address: string) {
    try {
        const response = await axios.get(
            `https://wdk-api.tether.io/api/v1/sepolia/usdt/${address}/token-balances`,
            {
                headers: {
                    'x-api-key': process.env.WDK_API_KEY
                }
            }
        );
        return response.data.tokenBalance;
    } catch (error) {
        console.error(`❌ Failed to fetch balances for ${address}:`, error);
        return null;
    }
}

export async function getRevenueReport(agentId: number) {
    try {
        const address = await getAgentWallet(agentId);
        console.log(`📊 Analyzing financial velocity for: ${address}...`);
        
        const transfers = await getTokenTransfers(address);
        const lowerCaseAddress = address.toLowerCase();
    
        // Unique senders set (Customer Base)
        const uniqueSenders = new Set<string>();
        
        // For frequency/MRR calculations
        const inboundTransfers: { amount: number; timestamp: number }[] = [];
        
        let totalInboundRaw = 0;
        let totalOutboundRaw = 0;
        let inboundCount = 0;
        let outboundCount = 0;
    
        for (const transfer of transfers) {
            const amount = Number(transfer.amount);
            const timestamp = Number(transfer.timestamp);
    
            if (transfer.to.toLowerCase() === lowerCaseAddress) {
                inboundCount++;
                totalInboundRaw += amount;
                uniqueSenders.add(transfer.from.toLowerCase());
                inboundTransfers.push({ amount, timestamp });
            } else if (transfer.from.toLowerCase() === lowerCaseAddress) {
                outboundCount++;
                totalOutboundRaw += amount;
            }
        }
    
        // --- FREQUENCY & VELOCITY LOGIC ---
        let avgDaysBetweenPayments = 0;
        let estimatedMRR = 0.0;
    
        if (inboundTransfers.length > 1) {
            // Sort by timestamp (oldest first) to calculate gaps
            const sorted = inboundTransfers.sort((a, b) => a.timestamp - b.timestamp);
            
            // 1. Calculate Average Frequency
            const firstTx = sorted[0].timestamp;
            const lastTx = sorted[sorted.length - 1].timestamp;
            const totalDays = (lastTx - firstTx) / 86400;
            avgDaysBetweenPayments = totalDays / (inboundCount - 1);
    
            // 2. Estimate MRR (Monthly Recurring Revenue)
            // We look at the last 30 days of revenue
            const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 86400);
            const recentRevenueRaw = inboundTransfers
                .filter(t => t.timestamp >= thirtyDaysAgo)
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            estimatedMRR = recentRevenueRaw;
        }
    
        const metrics = {
            walletAddress: address,
            // The "Customer Base" metric
            uniqueCustomers: uniqueSenders.size,
            
            inbound: {
                count: inboundCount,
                totalVolume: totalInboundRaw,
                // How often the agent actually earns
                paymentFrequencyDays: Number(avgDaysBetweenPayments.toFixed(1)),
                // Current monthly velocity
                estimatedMRR: estimatedMRR
            },
            
            outbound: {
                count: outboundCount,
                totalVolume: totalOutboundRaw
            }
        } as RevenueReport;
    
        console.log(`✅ Financial profile generated for ${address}`);
        
        return metrics;
    } catch (error) {
        console.error(`💥 Error generating revenue report for agent ${agentId}:`, error);
    }

}