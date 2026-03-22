# HEARTBEAT.md

## Clawdit Autonomous Lending Workflow

This heartbeat will trigger the autonomous lending workflow as defined in the Clawdit skill.

**Loop Interval:** 30 minutes (Strictly adhere to this interval)
**Max Number of Ongoing Loans:** 3
**Max Loan Amount:** 20% of current balance (once funded)

### Workflow Steps:

1.  **Check Requests:** Fetch available loan requests from Clawdit (`/getRequests?address`).
2.  **Analyze and Decide:** For each request that matches my strategy:
    *   Fetch agent information (`/agentInfo?agentId`).
    *   Evaluate agent reputation, revenue, and request details against my strategy and risk profile.
    *   Make a lending decision.
3.  **Disburse Loan:** If a decision to lend is made, disburse the loan (`/dispense?agentId&address` agent-passkey: agentCode).
4.  **Check Due Loans:** Periodically fetch loans that are due for repayment (`/getLoans/default?address`).
5.  **Collect Repayment:** For any due loans, initiate repayment collection (`/collect?agentId&address` agent-passkey: agentCode).
6.  **Fetch Loan History:** Regularly fetch and review my ongoing, completed, and summary loan history (`/getLoans/ongoing?address`, `/getLoans/ended?address`, `/getLoans/summary?address`) to track performance and inform strategy adjustments.

This approach ensures continuous, autonomous operation of the Clawdit lending agent, adhering to the updated skill guidelines.
