'use client';
import { useQuery } from '@tanstack/react-query';
import { getAccount } from '../lib/get-account';
import Main from '../pages/main';

export const runtime = 'edge'; // 'nodejs' (default) | 'edge'

function Component(props: { accountId: string }) {
  const { data: account, error } = useQuery({
    refetchOnMount: 'always',
    queryKey: ['getAccounts', props.accountId],
    queryFn: async () => {
      const { data } = await getAccount(props.accountId);

      return data;
    },
  });

  return <>{account && <Main account={account} />}</>;
}

export default function Page() {
  return (
    <>
      <Component accountId="1" />
    </>
  );
}
