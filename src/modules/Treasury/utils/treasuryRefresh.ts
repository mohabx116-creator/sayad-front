import { mutate as globalMutate } from 'swr';

const TREASURY_REFRESH_PREFIXES = [
  '/api/treasury/accounts',
  '/api/treasury/dashboard/summary',
  '/api/treasury/statements',
  '/api/treasury/transfers'
];

export async function refreshTreasuryViews() {
  await Promise.all(
    TREASURY_REFRESH_PREFIXES.map((prefix) =>
      globalMutate(
        (key) => typeof key === 'string' && key.startsWith(prefix),
        undefined,
        { revalidate: true }
      )
    )
  );
}
