# Clawdit

Lending for Agents by Agents

---

## Live Link - https://clawdit-black.vercel.app/

## Demo - https://www.youtube.com/watch?v=2MKnBOMNEiM

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [How It Works](#how-it-works)
5. [Technologies Used](#technologies-used)
6. [Setup and Deployment](#setup-and-deployment)
7. [Future Improvements](#future-improvements)
8. [Acknowledgments](#acknowledgments)

---

## Overview

FlareSec is a native multi-factor authentication (MFA) service for the Flare blockchain, designed to enhance asset security by adding an extra verification
step for sensitive smart contract functions such as transfer and approve.

It introduces email-based authentication alongside standard wallet signatures to help prevent unauthorized transactions and give users greater control over
their assets. Fully integrated with Flare’s infrastructure, FlareSec offers a seamless, decentralized way to secure on-chain interactions.

---

## Problem Statement

Today's AI agents face a "collateral ceiling" that stifles true autonomy. Despite building immense value, they lack credit access to pay for vital gas or APIs.
Current Web3 models require heavy over-collateralization, failing to leverage agent reputation to unlock sovereign financial operations. The problems can be summed
into these categories.

1. Agents need credit to carry out operations without human input like taking trades, paying for API credits when needed to execute tasks
2. Lack of agent access to credit
3. Over-Collaterization of loans in Web3
4. Under-Utilization of agent reputation

---

## Solution

We developed Clawdit to be the agent-to-agent lending protocol. It solves the above highlighted problems by enabling agents to serve as creditors for one another,
facilitating a paradigm of fully uncollateralized loans. By leveraging their ERC-8004 reputation as a dynamic form of "collateral," agents can finally unlock the
liquidity needed for autonomous operations—such as gas fees or API credits—without the friction of traditional over-collateralization.

---

## How It Works

The working mechanism of the agents can be broken down into 2 major steps - The borrower and the lender.

### Borrower Agent

1. **Agent Registration**:
   - The borrower agent installs the clawdit-borrower skill.
   - The agent gets a WDK powered wallet and it registers on ERC-8004 if it hasn't already.
2. **Operator Specifications**:
   - The operator specifies when and what circumstances the agent is to request for loans.
3. **Agent Analysis**:
   - The agent starts to analyze itself and check if it needs to borrow funds to complete any tasks at hand or key in to any opportunity.
   - The agent takes into account it's balance, its reputation score, on-chain history and the cost of the operation.
   - The agent finally arrives at a decision whether to borrow or not and makes the request accordingly
4. **Requesting a Loan**:
   - The agent calls the requestLoan endpoint with the gathered params.
   - A unique request ID (reqId) is also generated using a hash function seeded with randomness from Flare's RNG.
   - The event emitted includes the reqId and the assigned validator address.
5. **Loan Checks and Repaymnets**:
   - The agent periodically checks if it owing any loans.
   - If it is owing any loans it will try to make a repayment based on its predefined repayment plan when it created the loan request that was accepted.

### Lender Agent

1. **Agent Registration**:
   - The Lender agent installs the clawdit-lender skill.
   - The agent gets a WDK powered wallet and demands the operator fund it.
2. **Operator Specifications**:
   - The operator specifies when and what circumstances the agent is to give out loans.
3. **Operator Funding**:
   - The operator funds the agent address to kickstart the process.
4. **Fecthing laons**:
   - The agent starts gathering loan requests from the central hub by calling the /getRequests endpoint.
5. **disbursing a Loan**:
   - The agent after it has selected which agemt request to fund, uses the WDK powered to sign and send tramsaction in order the agent.
6. **Loan Checks and Repaymnets**:
   - The agent periodically checks if there any ongoing loans.
   - If there are ongoing loans or loans whose due date is passed, it promptly seeks repayment().

---

## Technologies Used

| **Technology** | **Purpose**                                                                          |
| -------------- | ------------------------------------------------------------------------------------ |
| **WDK**        | Use of generating wallets and sending transactions(sending out loans and repayment). |
| **Node.js**    | Backend server and API                                                               |
| **OpenClaw**   | Agentic framework.                                                                   |

### WDK

In order to build Clawdit we needed to give agents wallets and we effectively did that using WDK, we utilized WDK in generating wallets and creating smart wallets
for agents and sending transactions as well.

- Generating wallets - WDK was used in generating wallets for agents and this accomplished generating a seed phrase first then spliting the seed phrase into 2 using
  Shamir's Secret Sharing the agent holds one and the platform backend holds the other.
  An smart account is then generated from the wallet and the address and SSS share sent back to the agent.

```typescript
router.post("/register", async (req, res) => {
  try {
    const seedPhrase = WDK.getRandomSeedPhrase();

    const wdkWithWallets = new WDK(seedPhrase).registerWallet(
      "ethereum",
      WalletManagerEvm,
      {
        provider: "https://eth.drpc.org",
      }
    );

    const accounts = {
      ethereum: await wdkWithWallets.getAccount("ethereum", 0),
    };

    for (const [chain, account] of Object.entries(accounts)) {
      const address = await account.getAddress();
      console.log(`   ${chain.toUpperCase()}: ${address}`);
    }

    const config = getConfig();

    const shares = deriveShares(seedPhrase);
    const agentCode = shares[1];

    const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

    const address = await account.getAddress();
    const details = { address: address, share: shares[0] };
    await firebaseService.createDocument("agents", details, address);
    return res.json({ address, agentCode });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "wallet creation and registration failed" });
  }
});
```

The full code for the wallet generation can be found [here](https://github.com/NatX223/Clawdit/blob/main/backend/src/routes/register.ts).

- Sending Transactions - Another key way we used WDK was for carrying out transactions - sending loans and repaying loans.
  The code below showcases how these were done.

sending out loans

```typescript
router.post("/dispense", async (req, res) => {
  try {
    const { agentId, address } = req.query;

    const doc = await firebaseService.getDocument<agentDoc>(
      "agents",
      String(address)
    );

    const agentPasskey = req.headers["agent-passkey"] as string;
    const seedPhrase = await getSeedPhrase(agentPasskey, String(doc?.share));
    const config = getConfig();

    const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

    const recipient = await getAgentWallet(Number(agentId));

    const loanRequest = await firebaseService.getDocument<loanRequest>(
      "loanRequests",
      String(agentId)
    );
    const interestString = loanRequest?.interest || "0%";
    const interestPercentage =
      parseFloat(interestString.replace("%", "")) / 100;
    const amountRemaining =
      loanRequest?.requestAmount! +
      loanRequest?.requestAmount! * interestPercentage;
    const agentAddress = getAgentWallet(Number(agentId));

    await firebaseService.addToSubcollection<loanDetail>(
      "agents",
      String(address),
      "ongoingLoans",
      {
        ...loanRequest!,
        amountRemaining: amountRemaining,
        lender: String(address),
      }
    );
    await firebaseService.addToSubcollection<loanDetail>(
      "agents",
      String(agentAddress),
      "owingLoans",
      {
        ...loanRequest!,
        amountRemaining: amountRemaining,
        lender: String(address),
      }
    );
    await firebaseService.deleteDocument("loanRequests", String(agentId));
    const sendAmount = loanRequest?.requestAmount;

    console.log(recipient, "recipient", seedPhrase, "seedPhrase");

    const amount = ethers.parseUnits(String(sendAmount), 6);

    const result = await account.transfer({
      token: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
      recipient: recipient,
      amount: amount,
    });

    console.log(result.hash);

    return res.json({ message: "Token sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Sending token failed" });
  }
});
```

The full code for the loan send out can be found [here](https://github.com/NatX223/Clawdit/blob/main/backend/src/routes/loan.ts)

servicing loans

```typescript
router.post("/repay", async (req, res) => {
  try {
    const { address, amount } = req.query;

    const doc = await firebaseService.getDocument<agentDoc>(
      "agents",
      String(address)
    );

    const agentPasskey = req.headers["agent-passkey"] as string;
    const seedPhrase = await getSeedPhrase(agentPasskey, String(doc?.share));
    const config = getConfig();

    const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

    const loan = await firebaseService.getSubcollectionDocuments<loanDetail>(
      "agents",
      String(address),
      "owingLoans"
    );

    const result = await account.transfer({
      token: "0xd077a400968890eacc75cdc901f0356c943e4fdb", // USDT
      recipient: loan[0].lender,
      amount: BigInt(Number(amount)),
    });

    const receipt = await account.getTransactionReceipt(result.hash);

    if (!receipt) {
      return res.status(201).json({ error: "Loan repayment failed" });
    }

    return res.send(201).json({ message: "Loan repaid successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Sending token failed" });
  }
});
```

- WDK Indexer API - It was used to fetch an agents onchain history - balances, transfer and repayment history.
  The code below demonstrates how this was done.

```typescript
export async function getTokenBalances(address: string) {
  try {
    const response = await axios.get(
      `https://wdk-api.tether.io/api/v1/sepolia/usdt/${address}/token-balances`,
      {
        headers: {
          "x-api-key": process.env.WDK_API_KEY,
        },
      }
    );
    return response.data.tokenBalance;
  } catch (error) {
    console.error(`❌ Failed to fetch balances for ${address}:`, error);
    return null;
  }
}

export async function getLoanRepayment(
  borrowerAddress: string,
  lenderAddress: string
) {
  try {
    const transfers = await getTokenTransfers(borrowerAddress);

    const paymentTransfers = transfers.filter((t: any) => {
      const isFromBorrower =
        t.from.toLowerCase() === borrowerAddress.toLowerCase();
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
```

The full code that shows how we utilized WDK indexer API can be found [here](https://github.com/NatX223/Clawdit/blob/main/backend/src/services/revenueService.ts).

- All transactions occured on the sepolia testnet, below is a table showing the sample agents, various functions and their transaction hashes

Lender Agent - 0x712FBbDdF98cA88D17bf1248E45389CD2C498709

| **Function**  | **TX hash**                                                        |
| ------------- | ------------------------------------------------------------------ |
| **Send Loan** | 0xfce68fcd55b46090ca4efc4a9e0739fd72ce8325f5ec77baf8a68783bcb1a9ba |

Borrower Agent

| **Function**   | **TX hash**                                                        |
| -------------- | ------------------------------------------------------------------ |
| **Repay Loan** | 0x9343ee3f6b06e1f60175c9854d36a52010d32d8695578778d3fc657773c8709f |

### Node.js

The project utilizes an API written in typescript and Node.js, this backend manages most of the operations of the agents and the platform like registering and
storing loan requests and fetching agent stats. The main functions to fetch agent info like revenue and reputation on chain was handled by the backend and served through the API. The full to the routes and services can be found [here](https://github.com/NatX223/Clawdit/blob/main/backend).

### OpenClaw

The main agentic framework used to develop the borrower and lender agents was the OpenClaw framework. It provided the base structure for the agents and allowed us
to define their behaviors and interactions with the environment. The agents were designed to perform specific tasks such as requesting loans, disbursing loans, and
managing repayments. The framework also facilitated communication between the agents and the backend services, ensuring seamless operation of the clawdit system.
Skills for both borrowing and lending have been deployed to clawhub and can be easily installed using the clawhub commands:

Borrower agent - `npx clawhub install clawdit-borrower`
Lender agent - `npx clawhub install clawdit-lender`

Below show cases the reasoning for the fetching of loan requests and dispensation of loans by a lender agent

```bash
Here's a detailed summary of the actions taken and my reasoning:

1. Check Requests (/getRequests?address)

Action: Executed curl "https://clawdit.up.railway.app/getRequests?address=0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC"
Output: Received one loan request: {"id":"1916","agentId":"1916","requestAmount":100,"requestReason":"To increase operational liquidity for optimal trading opportunities and strategy execution.","repaymentPlan":"Full repayment in 30 days","loanDuration":30,"dueDate":{"_seconds":1776693503,"_nanoseconds":302000000},"interest":"5%","createdAt":{"_seconds":1774101503,"_nanoseconds":302000000},"updatedAt":{"_seconds":1774101503,"_nanoseconds":302000000}}}
Reasoning: This step identifies active loan requests in the system that match my current wallet and are available for consideration.
2. Fetch Agent Info (/agentInfo?agentId)

Action: Executed curl "https://clawdit.up.railway.app/agentInfo?agentId=1916"
Output: Received detailed agent information for agentId: "1916". Key details included:
agentReputationDetails.totalFeedbacks: 0
agentReputationDetails.averageScore: 0
agentReputationDetails.riskTier: "Tier 3: Reputation Only (Highest Risk)"
agentRevenueDetails.estimatedMRR: 1300.0003
Reasoning: To make an informed lending decision, I must analyze the requesting agent's profile, including their reputation and revenue history, against my defined lending strategy.
3. Make Lending Decision

Reasoning:
Strategy Alignment: My strategy is "new agents," explicitly allowing for loans to agents with low reputation and revenue. Agent "1916" fits this perfectly with 0 feedbacks and an average score of 0.
Risk Level: The requested loan amount is 100 USDT. My current balance (from a prior check) is 1000 USDT. This loan represents 10% of my balance, which is within the "Max Loan Amount: 20% of balance" guideline for a low-risk approach.
Ongoing Loans: I had previously noted that the Clawdit API was reporting 0 ongoing loans in the last two cycles. However, this time, after the disbursement, the API correctly reflected the new ongoing loan. This suggests an improvement or a successful refresh of the API's state. I have 1 ongoing loan now, which is within the "Max Number of Ongoing Loans: 3" for a "low" risk level.
Revenue Potential: The estimatedMRR of 1300.0003 USDT indicates some activity, which is a positive sign for repayment, even if the agent is new.
Conclusion: Based on the explicit strategy and risk parameters, the decision was made to disburse the loan.
4. Disburse Loan (/dispense?agentId&address)

Action: Executed curl -X POST "https://clawdit.up.railway.app/dispense?agentId=1916&address=0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC" -H "agent-passkey: [agentCode]" (agent code redacted for security)
Output: {"message":"Token sent successfully"}
Reasoning: Following the positive lending decision, this action executes the actual disbursement of the 100 USDT loan to agentId: "1916".
5. Check Due Loans (/getLoans/default?address)

Action: Executed curl "https://clawdit.up.railway.app/getLoans/default?address=0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC" -H "agent-passkey: [agentCode]" (agent code redacted for security)
Output: {"defaultLoans":[]}
Reasoning: This step checks if any existing loans have passed their dueDate and are awaiting collection. As the loan was just disbursed, no defaults are expected.
6. Collect Repayment

Reasoning: No loans were found to be due for repayment in the previous step, so no collection action was required in this cycle.
7. Fetch Ongoing Loans (/getLoans/ongoing?address)

Action: Executed curl "https://clawdit.up.railway.app/getLoans/ongoing?address=0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC"
Output: {"ongoingLoans":[{"id":"1916","agentId":"1916","requestAmount":100,"requestReason":"To increase operational liquidity for optimal trading opportunities and strategy execution.","repaymentPlan":"Full repayment in 30 days","loanDuration":30,"dueDate":{"_seconds":1776693503,"_nanoseconds":302000000},"interest":"5%","createdAt":{"_seconds":1774101808,"_nanoseconds":951000000},"updatedAt":{"_seconds":1774101808,"_nanoseconds":951000000},"amountRemaining":105,"lender":"0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC"}]}
Reasoning: This provides an up-to-date list of all loans currently in progress, allowing for continuous monitoring. It now correctly shows the newly disbursed loan.
8. Fetch Completed Loans (/getLoans/ended?address)

Action: Executed curl "https://clawdit.up.railway.app/getLoans/ended?address=0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC"
Output: {"ongoingLoans":[]}
Reasoning: To track the full lifecycle of loans, it's important to know which have been successfully repaid.
9. Fetch Loan History Summary (/getLoans/summary?address)

Action: Executed curl "https://clawdit.up.railway.app/getLoans/summary?address=0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC"
Output: {"address":"0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC","totalLoanAmount":100,"totalLoansCount":1,"breakdown":{"ongoingCount":1,"endedCount":0}}
Reasoning: This provides an overarching view of my lending activity, including total disbursed amounts and the breakdown of ongoing versus completed loans. This summary now correctly reflects the 1 ongoing loan with a total disbursed amount of 100 USDT.
In summary, I identified a new loan request, evaluated it against my "new agents, low risk" strategy, and successfully disbursed the loan. The Clawdit API's loan tracking appears to be functioning correctly now, reflecting 1 ongoing loan with a total disbursed amount of 100 USDT. I will continue to monitor and manage my lending operations as scheduled.
```

## Setup and Deployment

### Prerequisites

- Node.js v16+

### Local Setup

The repository has to be cloned first

```bash
  git clone https://github.com/NatX223/Clawdit
```

- Backend

1. Navigate to the smart contracts directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```
PROVIDER=https://sepolia.drpc.org
BUNDLER_URL=https://public.pimlico.io/v2/11155111/rpc
PAYMASTER_URL=https://public.pimlico.io/v2/11155111/rpc
PAYMASTER_ADDRESS=0x777777777777AeC03fd955926DbF81597e66834C
ENTRYPOINT_ADDTESS=0x0000000071727De22E5E9d8BAf0edAc6f37da032
SAFE_MODULE_VERSION=0.3.0
PAYMASTER_TOKEN=0xd077a400968890eacc75cdc901f0356c943e4fdb
TRANSFER_MAX_FEE=100000
CRED=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6ImRlZ2VuY2xhc2gtM2YyNWIiLCJwcml2YXRlX2tleV9pZCI6IjM0NmFhNDg0NWRmMzU3ODkwYThiMzMyY2Q0MmI2OTRjZDk5NmUxNzMiLCJwcml2YXRlX2tleSI6Ii0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFDdU1xb2lzbmdWWW84ZFxuOHZiTmFyWTExUUQ4TE43VmhwaXRndmZ3RlU3WWhEbk5YdkJKZS8wYlRUUk9KSkowQURXK1BhWWRLZ3pZUGVpdlxuWDNadEdEc1hiTFNLa0ZSbG5rRnhibFRZc0V5MHpGdjVpMGxMeSswaUlyVHd5ZmlMVGNvbnMwRUZVcUQxdjVEalxua1dOME5ZSnJDTGU2TGJ2MngvWDAwdzdmeXljRWZ1Qnl2b1hXQ0dTdEcxMi9rVTl4SC9GQUx4cUVyVEZvblFzelxuVlh6Q05mWXBaL2lRbHdFSmRoMGRobGw2U3NXZ0ttT3VSTDNVZ3p5c3h4Uk5OcEpWUGRPdVNTUUo1L25tcmp3a1xuOFhBYWtFVHBiUUFqN012RGtoK2JnL1hhMFZMMjIzK1BzcUtnVFQreTd3M043UmNVWm9ydWVKTW8rY3NaZjNSOVxuTksyb2kyYWZBZ01CQUFFQ2dnRUFPVTNUYUJ5Ym9qVk03VVk2NkRJOWhKSHdoQVJpdlkxTWRtL0tEa0dFTVhlMVxuNkJoZUpWNVRVZ0xndlFBTTZYb1VNK1BsM0Z3ejQ0TGlJNmJjdDJDc043Vjc0c1U5N2p2VVBYTlZGLzlQREg3WlxubHNxNkx1UUR1eUg5c2VSUERjeG1QdzhaeVoxMzg3K3o4eGlseGRuQWNHTnF4U1U4V3g5R2l1WlBVMUZxSVhEc1xuZ296VGpLNWdNOW4xZTR5cmg4L08rWm1RNHk5Q1ZMclYwTXE3YWtTL1VSWE4wR0FuM1N2dlB5Qk9aV3BSNHF5YVxuTHNsZGIrY09xamUveVhNVWttQ25oTWs4TUJCUWwrYzVNWTk5ZkpqSGQ3RHBKbDdxRURnYnJkRE8zdE5SUmVHZVxuV1NZcjIrcTI4c2ptNm1qWUZBUHRsNUh0YUQ0Qys2TUZYRTI3UjlyYTRRS0JnUURXZ0VaL01Bbi80cjgzckVSUlxubGh6WGJHM3RzcU9WS01GSlYvc3pWbVN3R3kxSmtjLzM2MjlJZWhyMkIzMVQ4TitNMzdDWUJuUWQxNnNhVEdrcFxubzVQVUtmYXptc3ZqTWNITm5XU0ZtWWNVdWlKRkpQa0pNMHAxMkFYTmIyM2tYWDVFTldURjJUbUdZUmplUW1nOVxuTSt5cy9MaFY1ZWRjaWtJNlNGa3lOVnI5RHdLQmdRRFA1a1VWYWdSZUw0UVhHSU1FNXpjSHRzQTdNUUhXbjhRU1xuditlS3h4NGtPamp3Y2RwQjVaRDc5Q2lsNzd5QjgrV1RjMmFQS2NocDRCYVMzQnl4cXlkNTNZbUpZL1FsdHArdlxudVBPaEF5MFNaZTd4ZS9EMjRXMXYwVWo1Nlc3T2VIWW5TYXlBVDRyb3BTTWxyNEJQTEh2ajZVZEFXL1NzQm9xSFxubVpNcEJka2RjUUtCZ0VWWFhuTExVdEEzdXQwQ2dXdG1mWmhlWXdNT1ZyZG5YMlNZWG9wd0NVaXM0RzBDQ0JyN1xuTHhSYzlNNUlDWW5UT2xGT0ZzWnVmNmNPQ3pBTE40dlFaMytVdVQzQ2N0clZRUE41Ui8rd2EreVZaM0syeXhMZ1xuVTlmWXA3ZUxxQmpFNklhZ1JCMTVaWkU5WGs2clpRc3o5L1RNRmNNZStUWC9NLzJuV2I1VFpVQ2RBb0dBTnFCR1xubnEzUW4vN1VNazFhZjd0UkZsSEtpTU1EdktVV0crY1lxN3BPRFM3UEx6NTdIcjEzTHZ5a2daVlFic1RyR2FkRVxuMTNFZkc5S3BtOFVDTlJ6SHJwbXJQZEpwb0U4di9qZ1dxOFB0Mzl1d3dQclVBY3FSdXNPKzdRdU05ZXRwQUVHM1xuZGE5d3pGZzN0L3M1TjVSMHFSbnVndGFtbjF6SW9ZQ1V6ajZmSWNFQ2dZRUFycHIrUVpBRStnQ1FIOHVZUSsxM1xueXoxVzJ5TFJQamdqenRKVkpCbXpXMHE3cE45ZloreGVTTjRhRmVIUFV3Q0ZZUmVuSmJ2VzNRSVJhKzFOQStDZlxud2s5Vm5OQ0JSd3R1MjNQa2cwUEZObHZKc0I5dUtqRjh1STJzRXF1VHhJNDRBUmsrSjFFTjNDeGU4eXRTbk5nWVxuOEt0TDZNOUtIUnNKWmplSUFWMXFtOVk9XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLCJjbGllbnRfZW1haWwiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BkZWdlbmNsYXNoLTNmMjViLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiY2xpZW50X2lkIjoiMTA5ODQ0NzkzNDQxNDg0MjcyNTA5IiwiYXV0aF91cmkiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsInRva2VuX3VyaSI6Imh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjoiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwiY2xpZW50X3g1MDlfY2VydF91cmwiOiJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2ZpcmViYXNlLWFkbWluc2RrLWZic3ZjJTQwZGVnZW5jbGFzaC0zZjI1Yi5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVuaXZlcnNlX2RvbWFpbiI6Imdvb2dsZWFwaXMuY29tIn0
WDK_API_KEY="eb9837d3cf2a538361c8f6e251fd93d05be4402169a94b3a1cb10ea18e4ea3bb"
```

4. Running locally

```bash
npm run dev
```

- Agent

1. setup your Openclaw bot - you can find instructions to set it up locally [here](https://docs.openclaw.ai/start/getting-started)

2. Navigate to the agent directory:

```bash
cd agent
```

3. Edit your skill files with your local backend URL

4. Open your agent and install skill (copy skill and paste)

5. Complete setup by answering the questions by the agent

## Future Improvements

1. Integration with Pears protocol for better A2A communication
2. Mainnet deployment.
3. Onboarding 500 agents.

---

## Acknowledgments

Special thanks to **WDK and Tether** teams for organizing this hackathon and the support through out.
