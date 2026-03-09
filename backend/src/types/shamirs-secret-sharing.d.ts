declare module 'shamirs-secret-sharing' {
  function split(secret: Buffer, options: { shares: number; threshold: number }): Buffer[];
  function combine(shares: Buffer[]): Buffer;
  
  export { split, combine };
  export default { split, combine };
}