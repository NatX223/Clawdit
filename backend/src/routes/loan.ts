import express from 'express';
const router = express.Router();
import { firebaseService } from '../services/firebaseService.js';
import { getConfig, getSeedPhrase } from '../services/walletService.js';
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337';
import { getAgentWallet, getFeedbackData } from '../services/ERC8004Service.js';
import { loanRequest } from '../types/loanRequestType.js';
import { loanDetail } from '../types/loanDetailsType.js';
import { CollectionReference } from 'firebase-admin/firestore';
import { ethers } from 'ethers';
import { agentDoc } from '../types/agentDocType.js';

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
        
        // await firebaseService.addToSubcollection<loanDetail>('agents', String(address), 'ongoingLoans', {...loanRequest!, amountRemaining: loanRequest?.requestAmount!});
        const sendAmount = loanRequest?.requestAmount;

        console.log(recipient, "request");

        await account.transfer({
            token: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
            recipient: recipient,
            amount: BigInt(sendAmount!)
        });
    
        res.send(201).json({ message: 'Token sent successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Sending token failed' });  
    }

});

router.post('/collect', async (req, res) => {
    try {
        const { agentId, address } = req.query;

        const borrowerAddress = await getAgentWallet(Number(agentId));

        const doc = await firebaseService.getDocument<agentDoc>("agents", String(address));

        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase(agentPasskey, String(doc?.share));
        const config = getConfig();

        const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

        const now = new Date();

        const loan = await firebaseService.getSubcollectionDocuments<loanDetail>('agents', String(address), 'ongoingLoans', (ref: CollectionReference) => ref.where('agentId', '==', agentId).where('dueDate', '<', now));
        const repaymentAmount = loan[0].requestAmount;

        const erc20Abi = [
            "function transferFrom(address from, address to, uint256 amount)"
        ];

        const iface = new ethers.Interface(erc20Abi);

        const transferData = iface.encodeFunctionData("transferFrom", [
            borrowerAddress,
            String(address),
            BigInt(repaymentAmount)
        ]);

        const result = await account.sendTransaction({
            to: "0xd077a400968890eacc75cdc901f0356c943e4fdb", // USDT
            value: 0n,
            data: transferData
        });

        const receipt = await account.getTransactionReceipt(result.hash);

        if (!receipt) {
            const feedbackData = await getFeedbackData(Number(agentId), 0);
            await account.sendTransaction({
                to: "0x8004B663056A597Dffe9eCcC1965A193B7388713", // ERC8004 reputation registry contract
                value: 0n,
                data: feedbackData
            });

            res.status(201).json({ error: 'Collecting payment failed, approval not enough or balance not enough'});
        }

        const feedbackData = await getFeedbackData(Number(agentId), 50);
        await account.sendTransaction({
            to: "0x8004B663056A597Dffe9eCcC1965A193B7388713", // ERC8004 reputation registry contract
            value: 0n,
            data: feedbackData
        });

        await firebaseService.deleteSubcollectionDocument('agents', String(address), 'ongoingLoans', loan[0].id);
        await firebaseService.addToSubcollection('agents', String(address), 'endedLoans', {...loan, amountRemaining: 0});

        res.send(201).json({ message: 'Loan repaid successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Sending token failed' });  
    }

});

export default router;