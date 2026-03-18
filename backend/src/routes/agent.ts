import express from 'express';
const router = express.Router();
import { firebaseService } from '../services/firebaseService.js';
import { derivePath, getConfig, getSeedPhrase } from '../services/walletService.js';
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337';
import { formatUnits } from 'ethers';
import { loanDetail } from '../types/loanDetailsType.js';
import { getAgentWallet, getFeedbackData } from '../services/ERC8004Service.js';
import { getLoanRepayment } from '../services/revenueService.js';
import { CollectionReference } from 'firebase-admin/firestore';

router.get('/balance', async (req, res) => {
    try {
        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase();
        const config = getConfig();

        const path = derivePath(agentPasskey);
        const account = new WalletAccountEvmErc4337(seedPhrase!, path, config);

        const balance = await account.getTokenBalance("0xd077a400968890eacc75cdc901f0356c943e4fdb");

        const tokenBalnceString = formatUnits(balance, 6); 

        const tokenBalnce = Number(tokenBalnceString);

        res.json({ tokenBalnce });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Fetching balance failed' });  
    }
});

router.get('/getLoans/ongoing', async (req, res) => {
    try {
        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase();
        const config = getConfig();

        const path = derivePath(agentPasskey);
        const account = new WalletAccountEvmErc4337(seedPhrase!, path, config);
        const address = await account.getAddress();

        const ongoingLoans = await firebaseService.getSubcollectionDocuments<loanDetail>('agents', address, 'ongoingLoans');

        res.json({ ongoingLoans });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error fetching loans' });
    }
});

router.get('/getLoans/default', async (req, res) => {
    try {
        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase();
        const config = getConfig();

        const path = derivePath(agentPasskey);
        const account = new WalletAccountEvmErc4337(seedPhrase!, path, config);
        const address = await account.getAddress(); // This is the Lender's address

        const now = new Date();
        const ongoingLoans = await firebaseService.getSubcollectionDocuments<loanDetail>('agents', address, 'ongoingLoans', (ref: CollectionReference) => ref.where('dueDate', '<', now));

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

            const totalRepayment = await getLoanRepayment(borrowerAddress, address);

            const remainingAmount = loan.requestAmount - totalRepayment;

            if (remainingAmount <= 0) {
                const completedLoan = { ...loan, amountRemaining: 0 };

                await firebaseService.addToSubcollection(
                    'agents', 
                    address, 
                    'endedLoans', 
                    completedLoan
                );

                await firebaseService.deleteSubcollectionDocument(
                    'agents', 
                    address, 
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
                    address,
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
        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase();
        const config = getConfig();

        const path = derivePath(agentPasskey);
        const account = new WalletAccountEvmErc4337(seedPhrase!, path, config);
        const address = await account.getAddress();

        const ongoingLoans = await firebaseService.getSubcollectionDocuments<loanDetail>('agents', address, 'endedLoans');

        res.json({ ongoingLoans });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error fetching loans' });
    }
});

router.get('/getLoans/summary', async (req, res) => {
    try {
        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase();
        const config = getConfig();

        const path = derivePath(agentPasskey);
        const account = new WalletAccountEvmErc4337(seedPhrase!, path, config);
        const address = await account.getAddress();

        const [ongoingLoans, endedLoans] = await Promise.all([
            firebaseService.getSubcollectionDocuments<loanDetail>('agents', address, 'ongoingLoans'),
            firebaseService.getSubcollectionDocuments<loanDetail>('agents', address, 'endedLoans')
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