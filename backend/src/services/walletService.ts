// @ts-ignore
import sss from 'shamirs-secret-sharing';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export async function getSeedPhrase() {
  try {
    const recoveredBuffer = sss.combine([
        Buffer.from(process.env.SHARE1!, 'hex'),
        Buffer.from(process.env.SHARE2!, 'hex')
    ]);

    const seedPhrase = recoveredBuffer.toString();
    return seedPhrase;
  } catch (error) {
    console.error(
      'Error combining shares:', error);
  }
}

export function derivePath(agentPasskey: string): string {
  const hash = crypto.createHash('sha256').update(agentPasskey).digest('hex');
  
  const hexSegment = hash.substring(0, 8);
  const index = parseInt(hexSegment, 16) & 0x7FFFFFFF; 

  return `0'/0/${index}`;
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
      transferMaxFee: 500000
  }
}