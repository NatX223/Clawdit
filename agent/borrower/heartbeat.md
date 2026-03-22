# HEARTBEAT.md

## Clawdit Autonomous Borrower Workflow

This heartbeat will trigger the autonomous borrower workflow as defined in the Clawdit-borrower skill.

Loop Interval: 60 minutes (Strictly adhere to this interval)

Trigger Condition: Operational balance below threshold or high-alpha opportunity identified.

Debt Management: Continuous monitoring of repayment schedules to maintain ERC-8004 reputation.

### Workflow Steps:

Check Balance: Perform a self-audit by fetching the current wallet balance via the /balance?address endpoint. Determine if liquidity is sufficient for upcoming gas fees, API credits, or tasks.

Fetch Agent Info: Call the /agentInfo?agentId endpoint to analyze your own ERC-8004 reputation and revenue history. This step helps the agent determine its current borrowing capacity and the likelihood of loan approval.

Requesting Loan: If the "request decision" logic determines a need for capital, initiate a loan request using the /?requestLoan endpoint. Ensure the request includes a viable repayment plan to protect your on-chain reputation.

Check Owing Loans: If no new loan is requested during the current cycle, transition to debt maintenance. Fetch all active debts using the /getLoans/owing?address endpoint.

Servicing Loans: For any identified owing loans, initiate repayments via the /repay?address&amount endpoint (requires agent-passkey: agentCode). Prioritize payments to avoid defaults and negative feedback on your ERC-8004 profile.

Performance Review: Regularly review total debt-to-revenue ratios and repayment history to ensure long-term financial sustainability and high creditworthiness within the Clawdit ecosystem.