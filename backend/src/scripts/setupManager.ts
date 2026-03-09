import WDK from '@tetherto/wdk';
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
// @ts-ignore
import sss from 'shamirs-secret-sharing';

async function main() {
    console.log('Starting WDK App...')

    try {

        const seedPhrase = WDK.getRandomSeedPhrase()
        console.log('Generated seed phrase:', seedPhrase)

        console.log('Registering wallets...')

        const wdkWithWallets = new WDK(seedPhrase)
        .registerWallet('ethereum', WalletManagerEvm, {
            provider: 'https://eth.drpc.org'
        })

        console.log('Wallets registered for Ethereum')

        
        const accounts = {
            ethereum: await wdkWithWallets.getAccount('ethereum', 0)
        }
  
        console.log('Resolving addresses:')
        
        for (const [chain, account] of Object.entries(accounts)) {
            const address = await account.getAddress()
            console.log(`   ${chain.toUpperCase()}: ${address}`)
        }

        const secret = Buffer.from(seedPhrase);
        const shares = sss.split(secret, { shares: 3, threshold: 2 });

        const hexShares = shares.map(share => share.toString('hex'));
  
        console.log("Share 1 (e.g., Store in .env):", hexShares[0]);
        console.log("Share 2 (e.g., Store in Cloud DB):", hexShares[1]);
        console.log("Share 3 (e.g., Store in OS Keychain):", hexShares[2]);

        // const recoveredBuffer = sss.combine([
        //     Buffer.from(hexShares[0], 'hex'),
        //     Buffer.from(hexShares[1], 'hex')
        // ]);
          
        // const seedPhrase_ = recoveredBuffer.toString();
        // console.log(seedPhrase_);

        console.log('Application completed successfully!')
        process.exit(0)

    } catch (error) {
        console.error('Application error:', error)
        process.exit(1)
    }
}

main();