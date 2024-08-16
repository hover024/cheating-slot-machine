import styles from './cell.module.css';
import { ELEMENT_DISTINCT_AMOUNT, ELEMENT_HEIGHT, elemColumn } from './data';
import { fruitIconMapper, fruitPositionMapper, TFruitKey } from '../../data';
import { FC, RefObject, useEffect, useRef, useState } from 'react';
import '../../../../styles/globals.css';
import classNames from 'classnames';

interface ICell {
  className?: string;
  defaultPos: number;
  currentPos?: number;
  elemRef: RefObject<HTMLDivElement>;
  data: null | {
    rollResult: [TFruitKey, TFruitKey, TFruitKey];
    newBalance: number;
  };
  isSpinning: boolean;
}
const Cell: FC<ICell> = ({
  className,
  defaultPos,
  elemRef,
  data,
  isSpinning,
}) => {
  const [activeElemPos, setActiveElemPos] = useState(defaultPos ?? 1);
  const desiredSlot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elemRef.current) return;

    const intervalId = setInterval(() => {
      if (!elemRef.current) return;

      if (
        (elemRef.current.offsetTop / -ELEMENT_HEIGHT) %
          ELEMENT_DISTINCT_AMOUNT >=
        3.9
      ) {
        elemRef.current.style.transform = `translateY(${elemRef.current.offsetTop * -1 + 'px'})`;
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [elemRef]);

  useEffect(() => {
    if (!desiredSlot.current || !data?.rollResult[defaultPos]) return;

    desiredSlot.current.style.top =
      -ELEMENT_HEIGHT * fruitPositionMapper[data.rollResult[defaultPos]] -
      ELEMENT_HEIGHT * ELEMENT_DISTINCT_AMOUNT +
      'px';
  }, [data, defaultPos]);

  return (
    <div className={className}>
      {isSpinning ? (
        <div
          ref={elemRef}
          className={classNames(styles.fruitContainer, 'transition')}
          style={{ top: ELEMENT_HEIGHT * activeElemPos }}
        >
          {elemColumn.map((fruit, index) => (
            <div className={styles.fruit} key={index}>
              {fruitIconMapper[fruit]}
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={desiredSlot}
          className={classNames(styles.fruitContainer, styles.desiredSlot, {
            ['firstSlot']: defaultPos === 0,
            ['secondSlot']: defaultPos === 1,
            ['thirdSlot']: defaultPos === 2,
          })}
        >
          {elemColumn.map((fruit, index) => (
            <div className={styles.fruit} key={index}>
              {fruitIconMapper[fruit]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cell;
