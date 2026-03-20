export interface loanDetail {
    id: string;
    agentId: number;
    requestAmount: number;
    requestReason: string;
    repaymentPlan: string;
    loanDuration: number;
    dueDate: Date;
    interest: string;
    amountRemaining: number;
}