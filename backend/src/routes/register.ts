import { 
    WalletAccountEvmErc4337 
} from '@tetherto/wdk-wallet-evm-erc-4337';

import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
import WDK from '@tetherto/wdk';
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { deriveShares, getConfig, getSeedPhrase } from '../services/walletService.js';
import { firebaseService } from '../services/firebaseService.js';
import { agentDoc } from '../types/agentDocType.js';
import { ethers } from 'ethers';

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
});

router.post('/registerERC8004', async (req, res) => {
    try {
        const { address } = req.query;
        const metadata = req.body;

        const doc = await firebaseService.getDocument<agentDoc>("agents", String(address));

        const agentPasskey = req.headers['agent-passkey'] as string;
        const seedPhrase = await getSeedPhrase(agentPasskey, String(doc?.share));
        const config = getConfig();

        const account = new WalletAccountEvmErc4337(seedPhrase!, "0'/0/0", config);

        const jsonString = JSON.stringify(metadata);

        const base64Data = Buffer.from(jsonString).toString('base64');

        const tokenURI = `data:application/json;base64,${base64Data}`;

        const agentIdentityAbi = [
            "function register(string memory agentURI) external returns (uint256 agentId)",
            "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)"
        ]

        const iface = new ethers.Interface(agentIdentityAbi);

        const regData = iface.encodeFunctionData("register", [
            tokenURI
        ]);

        const result = await account.sendTransaction({
            to: "0x8004A818BFB912233c491871b3d84c89A494BD9e", // the ERC-8004 identity registry contract
            value: 0n,
            data: regData
        });

        const receipt = await account.getTransactionReceipt(result.hash);

        if (!receipt) {
            res.status(500).json({ error: 'Sending registration transaction failed'});
        }

        const event = receipt?.logs
            .map((log) => {
                try {
                    return iface.parseLog(log);
                } catch (e) {
                    return null;
                }
            })
            .find((parsed) => parsed && parsed.name === "Registered");
    
        const agentId = event?.args.agentId;
        console.log(agentId);        

        res.send(201).json({ agentId: Number(agentId) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'error registering agent Identity' });
    }
})

export default router;