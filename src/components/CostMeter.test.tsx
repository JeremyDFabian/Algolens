import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { CostMeter } from './CostMeter';
import { visualizerMeta } from '../visualizers';

describe('CostMeter', () => {
  test('shows the headline metric over its Big-O bound', () => {
    render(
      <CostMeter
        counts={{ comparisons: 7, swaps: 3, reads: 0, writes: 6 }}
        model={visualizerMeta.bubbleSort.costModel}
      />
    );
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText(/\/\s*6/)).toBeInTheDocument(); // bound(4) = 6
    expect(screen.getByText(/O\(n²\)/)).toBeInTheDocument();
  });

  test('renders O(1) topics without dividing by zero', () => {
    render(
      <CostMeter
        counts={{ comparisons: 0, swaps: 0, reads: 1, writes: 0 }}
        model={visualizerMeta.array.costModel}
      />
    );
    expect(screen.getByText(/O\(1\)/)).toBeInTheDocument();
  });
});
