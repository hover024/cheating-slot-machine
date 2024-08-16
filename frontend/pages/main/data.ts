const fruitIconMapper = {
  cherry: 'C',
  lemon: 'L',
  orange: 'O',
  watermelon: 'W',
};

const fruitPositionMapper = {
  cherry: 3,
  lemon: 0,
  orange: 1,
  watermelon: 2,
};

const errorMapper = {
  noActiveSession: 'No active session',
  insufficientBalance: 'Insufficient balance',
};

export type TFruitKey = keyof typeof fruitPositionMapper;

export { fruitPositionMapper, fruitIconMapper, errorMapper };
