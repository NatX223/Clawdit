import express from 'express';
const router = express.Router();
import { firebaseService } from '../services/firebaseService.js';
import { derivePath, getConfig, getSeedPhrase } from '../services/walletService.js';
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337';
import { formatUnits } from 'ethers';
import { loanDetail } from '../types/loanDetailsType.js';

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
        res.status(500).json({ error: 'Sending token failed' });  
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

export default router;