export function calculateMoney(amount: number) {
  const RATE_FOR_POOL = 0.2;
  const amountForPool = amount * RATE_FOR_POOL;
  return { amountForPool, amountForOwner: amount - amountForPool };
}
