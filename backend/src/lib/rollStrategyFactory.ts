import { computeRollResult, getRandomFruit } from "../utils";

interface RollStrategy {
  roll(): { rollResult: string[], winCost: number };
}

class HighBalanceStrategy implements RollStrategy {
  roll(): { rollResult: string[], winCost: number } {
    let rollResult = new Array(3).fill(null).map(() => getRandomFruit());
    let winCost = computeRollResult(rollResult);
    
    const chance = 60;
    const shouldRollAgain = Math.random() * 100 <= chance;

    if (shouldRollAgain) {
      rollResult = new Array(3).fill(null).map(() => getRandomFruit());
      winCost = computeRollResult(rollResult);
    }

    return { rollResult, winCost };
  }
}

class MediumBalanceStrategy implements RollStrategy {
  roll(): { rollResult: string[], winCost: number } {
    let rollResult = new Array(3).fill(null).map(() => getRandomFruit());
    let winCost = computeRollResult(rollResult);

    const chance = 30;
    const shouldRollAgain = Math.random() * 100 <= chance;

    if (shouldRollAgain) {
      rollResult = new Array(3).fill(null).map(() => getRandomFruit());
      winCost = computeRollResult(rollResult);
    }

    return { rollResult, winCost };
  }
}

class LowBalanceStrategy implements RollStrategy {
  roll(): { rollResult: string[], winCost: number } {
    const rollResult = new Array(3).fill(null).map(() => getRandomFruit());
    const winCost = computeRollResult(rollResult);

    return { rollResult, winCost };
  }
}

export default class RollStrategyFactory {
  static get(balance: number): RollStrategy {
    if (balance > 60) {
      return new HighBalanceStrategy();
    } else if (balance > 40 && balance <= 60) {
      return new MediumBalanceStrategy();
    } else {
      return new LowBalanceStrategy();
    }
  }
}

