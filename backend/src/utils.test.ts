import { getRandomFruit, computeRollResult } from './utils';
import { Fruit } from './const';

describe('Utils Functions', () => {
  describe('getRandomFruit', () => {
    it('should return fruits with approximately uniform distribution', () => {
      const iterations = 100000;
      const results: { [key in Fruit]: number } = {
        cherry: 0,
        lemon: 0,
        orange: 0,
        watermelon: 0,
      };

      for (let i = 0; i < iterations; i++) {
        const fruit = getRandomFruit();
        results[fruit]++;
      }

      const expectedCount = iterations / 4;
      const tolerance = expectedCount * 0.05;

      for (const fruit in results) {
        expect(results[fruit as Fruit]).toBeGreaterThanOrEqual(
          expectedCount - tolerance
        );
        expect(results[fruit as Fruit]).toBeLessThanOrEqual(
          expectedCount + tolerance
        );
      }
    });
  });

  describe('computeRollResult', () => {
    it('should return 0 if all elements in result array are not the same', () => {
      const result = computeRollResult(['cherry', 'lemon', 'orange']);
      expect(result).toBe(0);
    });

    it('should return the correct cost if all elements in result array are the same', () => {
      const cherryResult = computeRollResult(['cherry', 'cherry', 'cherry']);
      expect(cherryResult).toBe(10);

      const lemonResult = computeRollResult(['lemon', 'lemon', 'lemon']);
      expect(lemonResult).toBe(20);

      const orangeResult = computeRollResult(['orange', 'orange', 'orange']);
      expect(orangeResult).toBe(30);

      const watermelonResult = computeRollResult([
        'watermelon',
        'watermelon',
        'watermelon',
      ]);
      expect(watermelonResult).toBe(40);
    });
  });
});
