export interface ReputationReport {
    agentId: number;
    name: string;
    reputationDensity: {
        totalFeedbacks: number;
        averageScore: number;
        uniqueClients: number;
        sybilRisk: string;
        topClientConcentration: string
    },
    technicalUtility: {
        claimedSkills: string[];
        verifiedSkillsPercentage: string
        revenuePotential: string
    },
    // liveliness: {
    //     agentAgeDays: agentAgeDays.toFixed(1),
    //     daysSinceLastActivity: daysSinceLastActivity.toFixed(1),
    //     status: livelinessStatus
    // },
    trustModel: {
        declaredTrusts: string[],
        riskTier: string
    }
}