import express from 'express';
const router = express.Router();
import { firebaseService } from '../services/firebaseService';
import { derivePath, getConfig, getSeedPhrase } from '../services/walletService';
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337/types';
import { CollectionReference } from 'firebase-admin/firestore';

router.post('/requestLoan', async (req, res) => {
    try {
        const { agentId, requestAmount, requestReason, repaymentPlan, loanDuration, interest } = req.body;

        const requestAmount_ = Number(requestAmount) * Math.pow(10, 6);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + loanDuration);

        const loanRequest = {
            agentId: agentId,
            requestAmount: requestAmount_,
            requestReason: requestReason,
            repaymentPlan: repaymentPlan,
            loanDuration: loanDuration,
            dueDate: dueDate,
            interest: interest
        }

        await firebaseService.createDocument('loanRequests', loanRequest, agentId);

        res.send(201).json({ message: 'Loan request created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'sending loan request failed' });
    }

});

router.get('/getRequests', async (req, res) => {
    try {
        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase();
        const config = getConfig();

        const path = derivePath(agentPasskey);
        const account = new WalletAccountEvmErc4337(seedPhrase!, path, config);

        const balance = account.getTokenBalance("0xd077a400968890eacc75cdc901f0356c943e4fdb");

        const loanRequests = await firebaseService.getDocumentsPaginated(
            'loanRequests',
            10,
            (ref: CollectionReference) => ref.where('type', '==', 'uncollaterized').where('requestAmount', '<', balance)
        );
        res.json(loanRequests.documents);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Fetching loan requests failed' });
    }
});

export default router;