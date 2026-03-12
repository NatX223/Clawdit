export interface RevenueReport {
    walletAddress: string;
    uniqueCustomers: number;
    inbound: {
        count: number;
        totalVolume: number;
        paymentFrequencyDays: number;
        estimatedMRR: number;
    },
    outbound: {
        count: number;
        totalVolume: number;
    }
};