import { 
    WalletAccountEvmErc4337 
} from '@tetherto/wdk-wallet-evm-erc-4337';

import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
import crypto from 'crypto';
import { derivePath, getConfig, getSeedPhrase } from '../services/walletService.js';
import { firebaseService } from '../services/firebaseService.js';

dotenv.config();

router.post('/register', async (req, res) => {
    try {
        const seedPhrase = await getSeedPhrase();
        const config = getConfig();

        const code = crypto.randomBytes(12).toString('hex');
        const agentCode = `clawdit_live_${code}`;

        const path = derivePath(agentCode);

        const account = new WalletAccountEvmErc4337(seedPhrase!, path, config);

        const address = await account.getAddress();
        const details = { address: address }
        await firebaseService.createDocument('agents', details, address)
        res.json({address, agentCode});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'wallet creation and registration failed' });
    }
})

export default router;