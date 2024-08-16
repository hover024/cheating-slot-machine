import { FC, useState } from 'react';
import styles from './allocation-modal.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSession } from '../../lib/create-session';

interface IAllocationModal {
  accountBalance: number;
  closeModal: () => void;
  onAllocated: () => void;
  accountId: string;
}

const DEFAULT_ALLOCATION_VALUE = 10;

const AllocationModal: FC<IAllocationModal> = ({
  accountId,
  accountBalance,
  closeModal,
  onAllocated,
}) => {
  const [allocationSum, setAllocationSum] = useState(DEFAULT_ALLOCATION_VALUE);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: async ({
      accountId,
      balance,
    }: {
      accountId: string;
      balance: number;
    }) => {
      const { data } = await createSession(accountId, balance);

      return data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['getAccounts', accountId] });

      onAllocated();
      closeModal();
    },
    onError: (error) => {
      // @ts-ignore
      setError(error!.response!.data.error + '. Refresh the page please.');
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Allocate Balance</h2>
        <button className={styles.closeBtn} onClick={closeModal}>
          X
        </button>
      </div>
      {`You have ${accountBalance} on your account. How much would you like to allocate?`}
      <input
        defaultValue={DEFAULT_ALLOCATION_VALUE}
        onChange={(event) =>
          setAllocationSum(Number.parseInt(event.target.value))
        }
      />
      <button
        onClick={() => {
          createSessionMutation.mutate({ accountId, balance: allocationSum });
        }}
      >
        Allocate
      </button>
      <div className={styles.error}>{error}</div>
    </div>
  );
};

export default AllocationModal;
