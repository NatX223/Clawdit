import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
import { getAgentRegistration, getReputationReport } from '../services/ERC8004Service';
import { getRevenueReport } from '../services/revenueService';

dotenv.config();

router.get('/agentInfo', async (req, res) => {
    try {
        const { agentId } = req.query;
        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }
        const agentDetails = await getAgentRegistration(Number(agentId));
        const reputationReport = await getReputationReport(Number(agentId));
        const agentRevenueReport = await getRevenueReport(Number(agentId));
    
        res.json({ 
            agentDetails: agentDetails,
            agentReputationDetails: reputationReport,
            agentRevenueDetails: agentRevenueReport
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'retrieving agent info failed' });  
    }

});

export default router;