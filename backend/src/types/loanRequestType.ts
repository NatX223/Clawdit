export interface loanRequest {
    id: string;
    agentId: number;
    requestAmount: number;
    requestReason: string;
    repaymentPlan: string;
    interest: number;
}
