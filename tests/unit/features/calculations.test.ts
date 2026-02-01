/**
 * Calculations Feature Tests
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateFormula,
  formatCalculatedValue,
  getCalculationDependencies,
  sortCalculationsByDependency,
  generateCalculationScript,
  type CalculationDefinition,
  type CalculationContext,
} from '../../../src/features/calculations.js';

describe('Calculations Feature', () => {
  describe('evaluateFormula', () => {
    it('evaluates simple addition', () => {
      const context: CalculationContext = { a: 10, b: 20 };
      const result = evaluateFormula('a + b', context);
      expect(result).toBe(30);
    });

    it('evaluates subtraction', () => {
      const context: CalculationContext = { total: 100, discount: 15 };
      const result = evaluateFormula('total - discount', context);
      expect(result).toBe(85);
    });

    it('evaluates multiplication', () => {
      const context: CalculationContext = { price: 50, quantity: 3 };
      const result = evaluateFormula('price * quantity', context);
      expect(result).toBe(150);
    });

    it('evaluates division', () => {
      const context: CalculationContext = { total: 100, items: 4 };
      const result = evaluateFormula('total / items', context);
      expect(result).toBe(25);
    });

    it('evaluates complex formula with parentheses', () => {
      const context: CalculationContext = { base: 100, tax: 10, discount: 5 };
      const result = evaluateFormula('(base + tax) - discount', context);
      expect(result).toBe(105);
    });

    it('handles undefined fields as zero', () => {
      const context: CalculationContext = { a: 10 };
      const result = evaluateFormula('a + b', context);
      expect(result).toBe(10);
    });

    it('handles empty string fields as zero', () => {
      const context: CalculationContext = { a: 10, b: '' };
      const result = evaluateFormula('a + b', context);
      expect(result).toBe(10);
    });

    it('handles boolean fields (true = 1, false = 0)', () => {
      const context: CalculationContext = { value: 100, active: true };
      const result = evaluateFormula('value * active', context);
      expect(result).toBe(100);
    });

    it('returns null for invalid formulas', () => {
      const context: CalculationContext = { a: 10 };
      // Formula with unbalanced parentheses
      const result = evaluateFormula('a + (b', context);
      expect(result).toBeNull();
    });

    it('handles numeric literals in formulas', () => {
      const context: CalculationContext = { price: 100 };
      const result = evaluateFormula('price * 1.1', context);
      expect(result).toBeCloseTo(110, 10);
    });
  });

  describe('formatCalculatedValue', () => {
    it('formats as number with default decimals', () => {
      const result = formatCalculatedValue(1234.567, 'number');
      expect(result).toBe('1,234.57');
    });

    it('formats as number with custom decimals', () => {
      const result = formatCalculatedValue(1234.567, 'number', 0);
      expect(result).toBe('1,235');
    });

    it('formats as currency', () => {
      const result = formatCalculatedValue(1234.5, 'currency');
      expect(result).toBe('$1,234.50');
    });

    it('formats as currency with custom decimals', () => {
      const result = formatCalculatedValue(1234.5678, 'currency', 3);
      expect(result).toBe('$1,234.568');
    });

    it('formats as percentage', () => {
      const result = formatCalculatedValue(75, 'percentage');
      expect(result).toBe('75.00%');
    });

    it('formats as text', () => {
      const result = formatCalculatedValue(1234.567, 'text');
      expect(result).toBe('1234.567');
    });
  });

  describe('getCalculationDependencies', () => {
    it('extracts field names from simple formula', () => {
      const deps = getCalculationDependencies('a + b');
      expect(deps).toContain('a');
      expect(deps).toContain('b');
    });

    it('extracts field names from complex formula', () => {
      const deps = getCalculationDependencies('(price * quantity) - discount');
      expect(deps).toContain('price');
      expect(deps).toContain('quantity');
      expect(deps).toContain('discount');
    });

    it('ignores operators and numbers', () => {
      const deps = getCalculationDependencies('value * 1.1 + 50');
      expect(deps).toEqual(['value']);
    });

    it('handles underscore in field names', () => {
      const deps = getCalculationDependencies('total_price + shipping_cost');
      expect(deps).toContain('total_price');
      expect(deps).toContain('shipping_cost');
    });
  });

  describe('sortCalculationsByDependency', () => {
    it('sorts independent calculations correctly', () => {
      const calcs: CalculationDefinition[] = [
        { name: 'a', formula: 'x + y' },
        { name: 'b', formula: 'p + q' },
      ];
      const sorted = sortCalculationsByDependency(calcs);
      expect(sorted.length).toBe(2);
    });

    it('sorts dependent calculations in correct order', () => {
      const calcs: CalculationDefinition[] = [
        { name: 'total', formula: 'subtotal + tax' },
        { name: 'subtotal', formula: 'price * quantity' },
        { name: 'tax', formula: 'subtotal * 0.1' },
      ];
      const sorted = sortCalculationsByDependency(calcs);

      const subtotalIndex = sorted.findIndex((c) => c.name === 'subtotal');
      const taxIndex = sorted.findIndex((c) => c.name === 'tax');
      const totalIndex = sorted.findIndex((c) => c.name === 'total');

      // subtotal should come before tax (since tax depends on subtotal)
      expect(subtotalIndex).toBeLessThan(taxIndex);
      // tax should come before total (since total depends on tax)
      expect(taxIndex).toBeLessThan(totalIndex);
    });

    it('handles circular dependencies gracefully', () => {
      const calcs: CalculationDefinition[] = [
        { name: 'a', formula: 'b + 1' },
        { name: 'b', formula: 'a + 1' },
      ];
      // Should not throw, even with circular dependency
      const sorted = sortCalculationsByDependency(calcs);
      expect(sorted.length).toBe(2);
    });
  });

  describe('generateCalculationScript', () => {
    it('returns empty string for no calculations', () => {
      const script = generateCalculationScript([]);
      expect(script).toBe('');
    });

    it('generates JavaScript for calculations', () => {
      const calcs: CalculationDefinition[] = [
        { name: 'total', formula: 'price * quantity', format: 'currency' },
      ];
      const script = generateCalculationScript(calcs);

      expect(script).toContain('calc_total');
      expect(script).toContain('addEventListener');
      expect(script).toContain('price');
      expect(script).toContain('quantity');
    });

    it('includes format function in generated script', () => {
      const calcs: CalculationDefinition[] = [
        { name: 'percent', formula: 'value', format: 'percentage', decimals: 1 },
      ];
      const script = generateCalculationScript(calcs);

      expect(script).toContain('percent');
      expect(script).toContain('Intl.NumberFormat');
    });
  });
});
