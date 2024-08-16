export type Fruit = 'cherry' | 'lemon' | 'orange' | 'watermelon';

const fruits: Fruit[] = ['cherry', 'lemon', 'orange', 'watermelon'];

const costs: { [key in Fruit]: number } = {
  cherry: 10,
  lemon: 20,
  orange: 30,
  watermelon: 40,
};

export { fruits, costs };
