import express from 'express';
const router = express.Router();
import { firebaseService } from '../services/firebaseService';
import { derivePath, getConfig, getSeedPhrase } from '../services/walletService';
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337';
import { getAgentWallet } from '../services/ERC8004Service';
import { loanRequest } from '../types/loanRequestType';
import { loanDetail } from '../types/loanDetailsType';

router.post('/dispense', async (req, res) => {
    try {
        const { agentId } = req.body;

        const recipient = await getAgentWallet(agentId);
        const agentPasskey = req.headers['agent-passkey'] as string;

        const seedPhrase = await getSeedPhrase();
        const config = getConfig();

        const path = derivePath(agentPasskey);
        const account = new WalletAccountEvmErc4337(seedPhrase!, path, config);
        const address = await account.getAddress();

        const loanRequest = await firebaseService.getDocument<loanRequest>('loanRequests', agentId);
        await firebaseService.addToSubcollection<loanDetail>('agents', address, 'ongoingLoans', {...loanRequest!, amountRemaining: loanRequest?.requestAmount!});
        const sendAmount = loanRequest?.requestAmount;

        await account.transfer({
            token: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
            recipient: recipient,
            amount: sendAmount!
        });
    
        res.send(201).json({ message: 'Token sent successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Sending token failed' });  
    }

});

export default router;