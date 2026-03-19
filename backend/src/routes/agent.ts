import express from 'express';
const router = express.Router();
import { firebaseService } from '../services/firebaseService.js';
import { getConfig, getSeedPhrase } from '../services/walletService.js';
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337';
import { loanDetail } from '../types/loanDetailsType.js';
import { getAgentWallet, getFeedbackData } from '../services/ERC8004Service.js';
import { getLoanRepayment, getTokenBalances } from '../services/revenueService.js';
import { CollectionReference } from 'firebase-admin/firestore';
import { agentDoc } from '../types/agentDocType.js';

router.get('/balance', async (req, res) => {
    try {
        const { address } = req.query;
        
        const balanceData = await getTokenBalances(String(address));

        const tokenBalance = Number(balanceData.amount);

        return res.json({ tokenBalance });
        
    } catch (error) {
        console.error("Balance Fetch Error:", error);
        return res.status(500).json({ error: 'Fetching balance failed' });  
    }
});

router.get('/getLoans/ongoing', async (req, res) => {
    try {
        const { address } = req.query;

        const ongoingLoans = await firebaseService.getSubcollectionDocuments<loanDetail>('agents', String(address), 'ongoingLoans');

        res.json({ ongoingLoans });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error fetching loans' });
    }
});

router.get('/getLoans/default', async (req, res) => {
    try {
        const { address } = req.query;

        const doc = await firebaseService.getDocument<agentDoc>("agents", String(address));

        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase(agentPasskey, String(doc?.share));
        const config = getConfig();

        const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

        const now = new Date();
        const ongoingLoans = await firebaseService.getSubcollectionDocuments<loanDetail>('agents', String(address), 'ongoingLoans', (ref: CollectionReference) => ref.where('dueDate', '<', now));

        // Fetch all borrower addresses in parallel
        const agentIds = ongoingLoans.map(loan => loan.agentId);
        const agentAddresses = await Promise.all(
            agentIds.map(async (agentId) => {
                const agentAddress = await getAgentWallet(agentId);
                return { agentId, address: agentAddress };
            })
        );

        // Process all loans and perform the settlement logic
        const updatedLoansPromises = ongoingLoans.map(async (loan) => {
            const borrowerData = agentAddresses.find(a => a.agentId === loan.agentId);
            if (!borrowerData) return loan;

            const borrowerAddress = borrowerData.address;
            const agentId = borrowerData.agentId;

            const totalRepayment = await getLoanRepayment(borrowerAddress, String(address));

            const remainingAmount = loan.requestAmount - totalRepayment;

            if (remainingAmount <= 0) {
                const completedLoan = { ...loan, amountRemaining: 0 };

                await firebaseService.addToSubcollection(
                    'agents', 
                    String(address), 
                    'endedLoans', 
                    completedLoan
                );

                await firebaseService.deleteSubcollectionDocument(
                    'agents', 
                    String(address), 
                    'ongoingLoans', 
                    loan.id
                );

                const feedbackData = await getFeedbackData(agentId, 100);
                await account.sendTransaction({
                    to: "0x8004B663056A597Dffe9eCcC1965A193B7388713", // ERC8004 reputation registry contract
                    value: 0n,
                    data: feedbackData
                });

                return null;
                
            } else if (remainingAmount !== loan.amountRemaining) {
                await firebaseService.updateSubcollectionDocument(
                    'agents',
                    String(address),
                    'ongoingLoans',
                    loan.id,
                    { amountRemaining: remainingAmount }
                );

                const feedbackData = await getFeedbackData(agentId, 0);
                await account.sendTransaction({
                    to: "0x8004B663056A597Dffe9eCcC1965A193B7388713", // ERC8004 reputation registry contract
                    value: 0n,
                    data: feedbackData
                });

                return { ...loan, amountRemaining: remainingAmount };
            }

            return loan;
        });

        // Wait for all Firebase operations to finish
        const processedLoans = await Promise.all(updatedLoansPromises);

        // Filter out the null values (which are the fully paid loans we moved)
        const defaultLonas = processedLoans.filter(loan => loan !== null);

        res.json({ defaultLoans: defaultLonas });
    } catch (error) {
        console.error("Error in settlement loop:", error);
        res.status(500).json({ error: 'Error fetching and settling loans' });
    }
});

router.get('/getLoans/ended', async (req, res) => {
    try {
        const { address } = req.query;

        const ongoingLoans = await firebaseService.getSubcollectionDocuments<loanDetail>('agents', String(address), 'endedLoans');

        res.json({ ongoingLoans });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error fetching loans' });
    }
});

router.get('/getLoans/summary', async (req, res) => {
    try {
        const { address } = req.query;

        const [ongoingLoans, endedLoans] = await Promise.all([
            firebaseService.getSubcollectionDocuments<loanDetail>('agents', String(address), 'ongoingLoans'),
            firebaseService.getSubcollectionDocuments<loanDetail>('agents', String(address), 'endedLoans')
        ]);

        const allLoans = [...ongoingLoans, ...endedLoans];

        const totalLoanAmount = allLoans.reduce((sum, loan) => sum + (loan.requestAmount || 0), 0);
        const totalLoansCount = allLoans.length;

        res.json({
            address,
            totalLoanAmount,
            totalLoansCount,
            breakdown: {
                ongoingCount: ongoingLoans.length,
                endedCount: endedLoans.length
            }
        });
    } catch (error) {
        console.error("Summary Fetch Error:", error);
        res.status(500).json({ error: 'Error fetching loan summary' });
    }
});

export default router;