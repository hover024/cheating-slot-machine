import RollStrategyFactory, {
  LowBalanceStrategy,
  MediumBalanceStrategy,
  HighBalanceStrategy,
} from './rollStrategyFactory';

describe('RollStrategyFactory', () => {
  describe('get', () => {
    it('should return HighBalanceStrategy when balance is greater than 60', () => {
      const strategy = RollStrategyFactory.get(70);
      expect(strategy).toBeInstanceOf(HighBalanceStrategy);
    });

    it('should return MediumBalanceStrategy when balance is between 41 and 60', () => {
      const strategy = RollStrategyFactory.get(50);
      expect(strategy).toBeInstanceOf(MediumBalanceStrategy);
    });

    it('should return LowBalanceStrategy when balance is 40 or less', () => {
      const strategy = RollStrategyFactory.get(40);
      expect(strategy).toBeInstanceOf(LowBalanceStrategy);
    });
  });

  describe('LowBalanceStrategy', () => {
    it('should return a roll result without re-roll', () => {
      const strategy = new LowBalanceStrategy();
      const { rollResult, winCost } = strategy.roll();

      expect(rollResult).toHaveLength(3);
      expect(typeof winCost).toBe('number');
    });
  });

  describe('MediumBalanceStrategy', () => {
    it('should return a roll result and potentially re-roll', () => {
      const strategy = new MediumBalanceStrategy();
      const { rollResult, winCost } = strategy.roll();

      expect(rollResult).toHaveLength(3);
      expect(typeof winCost).toBe('number');
    });
  });

  describe('HighBalanceStrategy', () => {
    it('should return a roll result and potentially re-roll', () => {
      const strategy = new HighBalanceStrategy();
      const { rollResult, winCost } = strategy.roll();

      expect(rollResult).toHaveLength(3);
      expect(typeof winCost).toBe('number');
    });
  });
});
