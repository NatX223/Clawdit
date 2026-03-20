import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
import { getAgentRegistration, getReputationReport } from '../services/ERC8004Service.js';
import { getRevenueReport } from '../services/revenueService.js';

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
    
        return res.json({ 
            agentDetails: agentDetails,
            agentReputationDetails: reputationReport,
            agentRevenueDetails: agentRevenueReport
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'retrieving agent info failed' });  
    }

});

export default router;