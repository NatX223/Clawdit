import express from 'express';
const router = express.Router();
import { firebaseService } from '../services/firebaseService.js';
import { CollectionReference } from 'firebase-admin/firestore';
import { getTokenBalances } from '../services/revenueService.js';

router.post('/requestLoan', async (req, res) => {
    try {
        const { agentId, requestAmount, requestReason, repaymentPlan, loanDuration, interest } = req.body;

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + loanDuration);
        const requestAmount_ = Number(requestAmount) * Math.pow(10, 6);

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
        const { address } = req.query;
        const balance = await getTokenBalances(String(address));

        const loanRequests = await firebaseService.getDocumentsPaginated(
            'loanRequests',
            10,
            (ref: CollectionReference) => ref.where('requestAmount', '<', Number(balance))
        );
        res.json(loanRequests.documents);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Fetching loan requests failed' });
    }
});

export default router;