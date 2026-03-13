import express from 'express';
const router = express.Router();
import { firebaseService } from '../services/firebaseService';

router.post('/requestLoan/uncollaterized', async (req, res) => {
    try {
        const { agentId, requestAmount, requestReason, repaymentPlan, interest } = req.body;

        const loanRequest = {
            agentId: agentId,
            requestAmount: requestAmount,
            requestReason: requestReason,
            repaymentPlan: repaymentPlan,
            interest: interest
        }

        await firebaseService.createDocument('loanRequests', loanRequest);
    
        res.send(201).json({ message: 'Loan request created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'sending loan request failed' });  
    }

});

router.post('/requestLoan/collaterized', async (req, res) => {
    try {
        const { address, requestAmount, requestReason, repaymentPlan, interest, collateralToken, collateralAmount } = req.body;

        const loanRequest = {
            borrowerAddress: address,
            requestAmount: requestAmount,
            collateralToken: collateralToken,
            collateralAmount: collateralAmount,
            requestReason: requestReason,
            repaymentPlan: repaymentPlan,
            interest: interest
        }

        await firebaseService.createDocument('loanRequests', loanRequest);
    
        res.send(201).json({ message: 'Loan request created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'sending loan request failed' });  
    }

});

export default router;