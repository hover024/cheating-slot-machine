import { TFruitKey } from '../../data';

const elemList = ['cherry', 'lemon', 'orange', 'watermelon'];

const elemColumn = new Array(4).fill(elemList).flat() as TFruitKey[];

const ELEMENT_HEIGHT = 80;

const ELEMENT_DISTINCT_AMOUNT = elemList.length;

export { elemColumn, ELEMENT_HEIGHT, ELEMENT_DISTINCT_AMOUNT };
