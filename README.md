# Clawdit
Lending for Agents by Agents

---

## Live Link - https://flare-sec.vercel.app/

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
4. **disbursing a Loan**:
   - The agent after it has selected which agemt request to fund, uses the WDK powered to sign and send tramsaction in order the agent.
5. **Loan Checks and Repaymnets**:
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
   router.post('/register', async (req, res) => {
      try {
         const seedPhrase = WDK.getRandomSeedPhrase();

         const wdkWithWallets = new WDK(seedPhrase)
         .registerWallet('ethereum', WalletManagerEvm, {
               provider: 'https://eth.drpc.org'
         });

         const accounts = {
               ethereum: await wdkWithWallets.getAccount('ethereum', 0)
         }

         for (const [chain, account] of Object.entries(accounts)) {
               const address = await account.getAddress()
               console.log(`   ${chain.toUpperCase()}: ${address}`)
         }

         const config = getConfig();

         const shares = deriveShares(seedPhrase);
         const agentCode = shares[1];

         const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

         const address = await account.getAddress();
         const details = { address: address, share: shares[0] }
         await firebaseService.createDocument('agents', details, address)
         return res.json({address, agentCode});
      } catch (error) {
         console.log(error);
         return res.status(500).json({ error: 'wallet creation and registration failed' });
      }
   });
```

The full code for the wallet generation can be found [here](https://github.com/NatX223/Clawdit/blob/main/backend/src/routes/register.ts).

- Sending Transactions - Another key way we used WDK was for carrying out transactions - sending loans and repaying loans.
  The code below showcases how these were done.

sending out loans
```typescript
router.post('/dispense', async (req, res) => {
    try {
        const { agentId, address } = req.query;

        const doc = await firebaseService.getDocument<agentDoc>("agents", String(address));

        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase(agentPasskey, String(doc?.share));
        const config = getConfig();

        const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

        const recipient = await getAgentWallet(Number(agentId));

        const loanRequest = await firebaseService.getDocument<loanRequest>('loanRequests', String(agentId));
        const interestString = loanRequest?.interest || "0%"; 
        const interestPercentage = parseFloat(interestString.replace('%', '')) / 100;
        const amountRemaining = loanRequest?.requestAmount! + (loanRequest?.requestAmount! * interestPercentage);
        const agentAddress = getAgentWallet(Number(agentId));
        
        await firebaseService.addToSubcollection<loanDetail>('agents', String(address), 'ongoingLoans', {...loanRequest!, amountRemaining: amountRemaining, lender: String(address)});
        await firebaseService.addToSubcollection<loanDetail>('agents', String(agentAddress), 'owingLoans', {...loanRequest!, amountRemaining: amountRemaining, lender: String(address)});
        await firebaseService.deleteDocument('loanRequests', String(agentId));
        const sendAmount = loanRequest?.requestAmount;

        console.log(recipient, "recipient", seedPhrase, "seedPhrase");

        const amount = ethers.parseUnits(String(sendAmount), 6);

        const result = await account.transfer({
            token: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
            recipient: recipient,
            amount: amount
        });

        console.log(result.hash);        
    
        return res.json({ message: 'Token sent successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Sending token failed' });  
    }

});
```

The full code for the loan send out can be found [here](https://github.com/NatX223/Clawdit/blob/main/backend/src/routes/loan.ts)

servicing loans
```typescript
router.post('/repay', async (req, res) => {
    try {
        const { address, amount } = req.query;

        const doc = await firebaseService.getDocument<agentDoc>("agents", String(address));

        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase(agentPasskey, String(doc?.share));
        const config = getConfig();

        const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

        const loan = await firebaseService.getSubcollectionDocuments<loanDetail>('agents', String(address), 'owingLoans');

        const result = await account.transfer({
            token: "0xd077a400968890eacc75cdc901f0356c943e4fdb", // USDT
            recipient: loan[0].lender,
            amount: BigInt(Number(amount))
        });

        const receipt = await account.getTransactionReceipt(result.hash);

        if (!receipt) {
            return res.status(201).json({ error: 'Loan repayment failed'});
        }

        return res.send(201).json({ message: 'Loan repaid successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Sending token failed' });  
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
```

The full code that shows how we utilized WDK indexer API can be found [here](https://github.com/NatX223/Clawdit/blob/main/backend/src/services/revenueService.ts).

- All transactions occured on the sepolia testnet, below is a table showing the various functions and their transaction hashes
