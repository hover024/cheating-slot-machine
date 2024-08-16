import styles from './main.module.css';
import Cell from './components/cell';
import { ISpinResponse, spin } from '../../lib/spin';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cashOutRequest } from '../../lib/cash-out';
import AllocationModal from '../../components/allocation-modal';
import { IAccount } from '../../lib/get-account';
import calculatePos from './helpers';
import { errorMapper } from './data';

interface IMain {
  account: IAccount;
}

const Main: FC<IMain> = ({ account }) => {
  const firstElem = useRef<HTMLDivElement>(null);
  const secondElem = useRef<HTMLDivElement>(null);
  const thirdElem = useRef<HTMLDivElement>(null);
  const cashOutButton = useRef<HTMLButtonElement>(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const [canSpin, setCanSpin] = useState(true);
  const [data, setData] = useState<ISpinResponse | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const queryClient = useQueryClient();

  const cashOutMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { data } = await cashOutRequest(accountId);

      return data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['getAccounts', account.id] });
    },
    onError: (error) => {
      // @ts-ignore
      if (error!.response!.data.error === errorMapper.noActiveSession) {
        setShouldShowModal(true);
      }
    },
  });

  const spinMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { data } = await spin(accountId);
      return data;
    },
    onSuccess: (data) => {
      setData(data);
      setIsSpinning(false);
    },
    onError: (error) => {
      // @ts-ignore
      if (error!.response!.data.error === errorMapper.noActiveSession) {
        setShouldShowModal(true);
      }

      // @ts-ignore
      if (error!.response!.data.error === errorMapper.insufficientBalance) {
        cashOutMutation.mutate(account.id);
        setShouldShowModal(true);
      }

      setCanSpin(false);
      setIsSpinning(true);
    },
  });

  const handleTransitionEnd = useCallback(() => {
    setCanSpin(true);
    queryClient.refetchQueries({ queryKey: ['getAccounts', account.id] });

    setTimeout(() => setIsSpinning(true), 500);
  }, [account.id, queryClient]);

  const stopSlots = async () => {
    if (!isSpinning) {
      setIsSpinning(true);
      setTimeout(() => {
        spinMutation.mutate(account.id);
      }, 1000);
    } else {
      spinMutation.mutate(account.id);
    }

    setCanSpin(false);
  };

  useEffect(() => {
    const lastSlot = document.querySelector('.thirdSlot');

    if (!lastSlot) return;

    lastSlot.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      lastSlot.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [data, handleTransitionEnd]);

  const disableButton = () => {
    cashOutButton.current!.disabled = true;
  };

  const moveButton = () => {
    const { newTop, newLeft } = calculatePos(position, cashOutButton);

    cashOutButton.current!.style.top = `${newTop}px`;
    cashOutButton.current!.style.left = `${newLeft}px`;

    setPosition({ top: newTop, left: newLeft });
  };

  const cashOut = () => {
    cashOutMutation.mutate(account.id);
  };

  const rollButtonState = () => {
    const randomNumber = Math.random();

    if (randomNumber <= 0.5) {
      moveButton();
    } else if (randomNumber > 0.5 && randomNumber <= 0.9) {
      disableButton();
    }
  };

  const clearDisabled = () => {
    cashOutButton.current!.disabled = false;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          ref={cashOutButton}
          className={styles.cashOut}
          onMouseEnter={rollButtonState}
          onMouseLeave={clearDisabled}
          onClick={cashOut}
        >
          Cash out
        </button>
        <div
          className={styles.credits}
        >{`Session Balance: ${account.sessionBalance}`}</div>
        <div
          className={styles.credits}
        >{`Account Balance: ${account.accountBalance ?? ''}`}</div>
      </div>
      <div className={styles.slotDisplay}>
        <Cell
          elemRef={firstElem}
          className={styles.firstEl}
          defaultPos={0}
          data={data}
          isSpinning={isSpinning}
        />
        <Cell
          elemRef={secondElem}
          className={styles.secondEl}
          defaultPos={1}
          data={data}
          isSpinning={isSpinning}
        />
        <Cell
          elemRef={thirdElem}
          className={styles.thirdEl}
          defaultPos={2}
          data={data}
          isSpinning={isSpinning}
        />
      </div>
      <button disabled={!canSpin} className={styles.spin} onClick={stopSlots}>
        Spin
      </button>
      {shouldShowModal && (
        <AllocationModal
          onAllocated={() => setCanSpin(true)}
          accountId={account.id}
          accountBalance={account.accountBalance}
          closeModal={() => setShouldShowModal(false)}
        />
      )}
    </div>
  );
};

export default Main;
