// @ts-ignore
import sss from 'shamirs-secret-sharing';
import dotenv from 'dotenv';

dotenv.config();

export async function getSeedPhrase(share0: string, share1: string) {
  try {
    const recoveredBuffer = sss.combine([
        Buffer.from(share0, 'hex'),
        Buffer.from(share1, 'hex')
    ]);

    const seedPhrase = recoveredBuffer.toString();
    return seedPhrase;
  } catch (error) {
    console.error(
      'Error combining shares:', error);
  }
}

export function deriveShares(seedPhrase: string): string[] {
  const secret = Buffer.from(seedPhrase);
  const shares = sss.split(secret, { shares: 3, threshold: 2 });

  const hexShares = shares.map(share => share.toString('hex'));

  hexShares.pop();

  return hexShares;
}

export function getConfig() {
  return {
      chainId: 11155111, // sepolia testnet
      provider: process.env.PROVIDER!,
      bundlerUrl: process.env.BUNDLER_URL!,
      paymasterUrl: process.env.PAYMASTER_URL!,
      paymasterAddress: process.env.PAYMASTER_ADDRESS!,
      entryPointAddress: process.env.ENTRYPOINT_ADDTESS!,
      safeModulesVersion: process.env.SAFE_MODULE_VERSION!,
      paymasterToken: {
        address: process.env.PAYMASTER_TOKEN!
      },
      transferMaxFee: 1000000
  }
}