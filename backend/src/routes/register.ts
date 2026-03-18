import { 
    WalletAccountEvmErc4337 
} from '@tetherto/wdk-wallet-evm-erc-4337';

import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
import WDK from '@tetherto/wdk';
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { deriveShares, getConfig } from '../services/walletService.js';
import { firebaseService } from '../services/firebaseService.js';

dotenv.config();

router.post('/register', async (req, res) => {
    try {
        const seedPhrase = WDK.getRandomSeedPhrase();

        const wdkWithWallets = new WDK(seedPhrase)
        .registerWallet('ethereum', WalletManagerEvm, {
            provider: 'https://eth.drpc.org'
        });

        const accounts = {
            ethereum: await wdkWithWallets.getAccount('ethereum', 0)
        }

        for (const [chain, account] of Object.entries(accounts)) {
            const address = await account.getAddress()
            console.log(`   ${chain.toUpperCase()}: ${address}`)
        }

        const config = getConfig();

        const shares = deriveShares(seedPhrase);
        const agentCode = shares[1];

        const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

        const address = await account.getAddress();
        const details = { address: address, share: shares[0] }
        await firebaseService.createDocument('agents', details, address)
        res.json({address, agentCode});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'wallet creation and registration failed' });
    }
})

export default router;