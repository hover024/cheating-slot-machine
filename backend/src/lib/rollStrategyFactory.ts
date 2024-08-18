import { computeRollResult, getRandomFruit } from '../utils';

interface IRollStrategy {
  roll(): { rollResult: string[]; winCost: number };
}

class BaseCheatingStrategy implements IRollStrategy {
  private chanceToCheat: number;

  constructor(chanceToCheat: number) {
    this.chanceToCheat = chanceToCheat;
  }

  roll(): { rollResult: string[]; winCost: number } {
    let rollResult = new Array(3).fill(null).map(() => getRandomFruit());
    let winCost = computeRollResult(rollResult);

    const shouldRollAgain = Math.random() * 100 <= this.chanceToCheat;

    if (shouldRollAgain) {
      rollResult = new Array(3).fill(null).map(() => getRandomFruit());
      winCost = computeRollResult(rollResult);
    }

    return { rollResult, winCost };
  }
}

export class HighBalanceStrategy extends BaseCheatingStrategy {
  constructor() {
    super(60);
  }
}

export class MediumBalanceStrategy extends BaseCheatingStrategy {
  constructor() {
    super(30);
  }
}

export class LowBalanceStrategy extends BaseCheatingStrategy {
  constructor() {
    super(0);
  }
}

export default class RollStrategyFactory {
  static get(balance: number): IRollStrategy {
    if (balance > 60) {
      return new HighBalanceStrategy();
    } else if (balance > 40 && balance <= 60) {
      return new MediumBalanceStrategy();
    } else {
      return new LowBalanceStrategy();
    }
  }
}
