import { describe, expect, test } from 'vitest';
import {
  createArrayAccessSteps,
  createBubbleSortSteps,
  createInsertionSortSteps,
  createLinkedListInsertSteps,
  createQueueSteps,
  createStackSteps,
  createTreeInsertSteps
} from './visualizers';
import { sumCost } from './visualizers';
import { visualizerMeta } from './visualizers';

describe('visualizer step generators', () => {
  test('stack steps expose push and pop states with pseudocode focus', () => {
    const steps = createStackSteps();

    expect(steps[0].title).toBe('Start with an empty stack');
    expect(steps.some((step) => step.operation === 'push')).toBe(true);
    expect(steps.at(-1)?.items.map((item) => item.value)).toEqual([12, 7]);
    expect(steps.at(-1)?.activeLine).toBe(3);
  });

  test('queue steps preserve first-in-first-out order through dequeue', () => {
    const steps = createQueueSteps();
    const finalStep = steps.at(-1);

    expect(finalStep?.items.map((item) => item.value)).toEqual([18, 31]);
    expect(finalStep?.pointers.front).toBe(0);
    expect(finalStep?.pointers.rear).toBe(1);
  });

  test('array access steps highlight index lookup without changing values', () => {
    const steps = createArrayAccessSteps();

    expect(steps.at(-1)?.items.map((item) => item.value)).toEqual([4, 9, 2, 8, 6]);
    expect(steps.at(-1)?.items[3].state).toBe('active');
    expect(steps.at(-1)?.activeLine).toBe(3);
  });

  test('linked list insert steps connect a new node between neighbors', () => {
    const steps = createLinkedListInsertSteps();
    const finalStep = steps.at(-1);

    expect(finalStep?.items.map((item) => item.value)).toEqual([11, 24, 37, 50]);
    expect(finalStep?.links).toEqual([
      [0, 1],
      [1, 2],
      [2, 3]
    ]);
  });

  test('tree insert steps place values by binary search tree rules', () => {
    const steps = createTreeInsertSteps();
    const finalStep = steps.at(-1);

    expect(finalStep?.tree?.map((node) => [node.value, node.parentId])).toEqual([
      [40, null],
      [25, 'n40'],
      [60, 'n40'],
      [35, 'n25']
    ]);
  });

  test('bubble sort steps end with sorted values and completed markers', () => {
    const steps = createBubbleSortSteps([5, 1, 4, 2]);
    const finalStep = steps.at(-1);

    expect(finalStep?.items.map((item) => item.value)).toEqual([1, 2, 4, 5]);
    expect(finalStep?.items.every((item) => item.state === 'complete')).toBe(true);
  });

  test('insertion sort steps insert each key into the sorted prefix', () => {
    const steps = createInsertionSortSteps([9, 3, 7, 1]);
    const finalStep = steps.at(-1);

    expect(finalStep?.items.map((item) => item.value)).toEqual([1, 3, 7, 9]);
    expect(finalStep?.activeLine).toBe(6);
  });
});

describe('cost deltas', () => {
  test('bubble sort of [5,1,4,2] totals 6 comparisons and 4 swaps', () => {
    const steps = createBubbleSortSteps([5, 1, 4, 2]);
    const total = sumCost(steps, steps.length - 1);
    expect(total.comparisons).toBe(6);
    expect(total.swaps).toBe(4);
  });

  test('insertion sort of [9,3,7,1] totals 6 comparisons and 0 swaps', () => {
    const steps = createInsertionSortSteps([9, 3, 7, 1]);
    const total = sumCost(steps, steps.length - 1);
    expect(total.comparisons).toBe(6);
    expect(total.swaps).toBe(0);
  });

  test('sumCost is monotonic non-decreasing as the index grows', () => {
    const steps = createBubbleSortSteps([5, 1, 4, 2]);
    let prev = 0;
    for (let i = 0; i < steps.length; i += 1) {
      const c = sumCost(steps, i).comparisons;
      expect(c).toBeGreaterThanOrEqual(prev);
      prev = c;
    }
  });
});

describe('cost models', () => {
  test('bubble sort bound is n(n-1)/2 with an O(n^2) label', () => {
    const model = visualizerMeta.bubbleSort.costModel;
    expect(model.headline).toBe('comparisons');
    expect(model.boundLabel).toBe('O(n²)');
    expect(model.bound(4)).toBe(6);
  });

  test('array read is a constant-cost model', () => {
    const model = visualizerMeta.array.costModel;
    expect(model.boundLabel).toBe('O(1)');
    expect(model.bound(99)).toBe(1);
  });
});
