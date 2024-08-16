import { costs, Fruit, fruits } from './const';

const getRandomFruit = () => {
  const idx = Math.floor(Math.random() * 4);
  return fruits[idx];
};

const computeRollResult = (result: Fruit[]): number => {
  const isSuccessfull = new Set(result).size === 1;

  if (!isSuccessfull) return 0;

  return costs[result[0]];
};

export { getRandomFruit, computeRollResult };
