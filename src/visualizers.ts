export type ItemState = 'idle' | 'active' | 'compare' | 'swap' | 'complete' | 'muted';

export type StepCost = {
  comparisons?: number;
  swaps?: number;
  reads?: number;
  writes?: number;
};

export type CostMetric = 'comparisons' | 'swaps' | 'reads' | 'writes';

export type CostModel = {
  headline: CostMetric;
  bound: (n: number) => number;
  boundLabel: string;
  n: number;
};

export type VisualItem = {
  id: string;
  value: number;
  state?: ItemState;
};

export type TreeNode = {
  id: string;
  value: number;
  parentId: string | null;
  side?: 'left' | 'right';
  state?: ItemState;
};

export type VisualStep = {
  title: string;
  operation: string;
  explanation: string;
  activeLine: number;
  items: VisualItem[];
  pointers?: Record<string, number | null>;
  links?: Array<[number, number]>;
  tree?: TreeNode[];
  cost?: StepCost;
};

const items = (values: number[], states: Record<number, ItemState> = {}): VisualItem[] => {
  const seen = new Map<number, number>();
  return values.map((value, index) => {
    // Ids are value-based so motion can track a value across steps; repeats get
    // an occurrence suffix so duplicate values still produce unique React keys.
    const occurrence = seen.get(value) ?? 0;
    seen.set(value, occurrence + 1);
    return {
      id: occurrence === 0 ? `${value}` : `${value}.${occurrence}`,
      value,
      state: states[index] ?? 'idle'
    };
  });
};

export const visualizerMeta = {
  array: {
    label: 'Array',
    operation: 'Read by index',
    complexity: 'O(1) time, O(1) space',
    pseudocode: ['values = [4, 9, 2, 8, 6]', 'index = 3', 'return values[index]'],
    costModel: { headline: 'reads' as CostMetric, bound: () => 1, boundLabel: 'O(1)', n: 5 }
  },
  stack: {
    label: 'Stack',
    operation: 'Push and pop',
    complexity: 'O(1) push, O(1) pop',
    pseudocode: ['stack.push(12)', 'stack.push(7)', 'stack.push(28)', 'stack.pop()'],
    // 3 pushes + 1 pop, each an O(1) write → ~4 writes for the whole demo.
    costModel: { headline: 'writes' as CostMetric, bound: () => 4, boundLabel: 'O(1)', n: 3 }
  },
  queue: {
    label: 'Queue',
    operation: 'Enqueue and dequeue',
    complexity: 'O(1) enqueue, O(1) dequeue',
    pseudocode: ['queue.enqueue(5)', 'queue.enqueue(18)', 'queue.enqueue(31)', 'queue.dequeue()'],
    // 3 enqueues + 1 dequeue, each an O(1) write → ~4 writes for the whole demo.
    costModel: { headline: 'writes' as CostMetric, bound: () => 4, boundLabel: 'O(1)', n: 3 }
  },
  linkedList: {
    label: 'Linked List',
    operation: 'Insert in middle',
    complexity: 'O(n) search, O(1) relink',
    pseudocode: ['prev = node(11)', 'new.next = prev.next', 'prev.next = new', 'list = 11 -> 24 -> 37 -> 50'],
    costModel: { headline: 'reads' as CostMetric, bound: (n: number) => n, boundLabel: 'O(n)', n: 3 }
  },
  tree: {
    label: 'Binary Tree',
    operation: 'BST insert',
    complexity: 'O(log n) average, O(n) worst',
    pseudocode: ['if value < node.value, go left', 'if value > node.value, go right', 'insert at empty child'],
    costModel: { headline: 'comparisons' as CostMetric, bound: (n: number) => Math.ceil(Math.log2(n + 1)), boundLabel: 'O(log n)', n: 4 }
  },
  bubbleSort: {
    label: 'Bubble Sort',
    operation: 'Compare adjacent values',
    complexity: 'O(n^2) time, O(1) space',
    pseudocode: ['for end from n-1 down to 1', 'compare a[i] and a[i+1]', 'if left > right, swap', 'mark end sorted'],
    costModel: { headline: 'comparisons' as CostMetric, bound: (n: number) => (n * (n - 1)) / 2, boundLabel: 'O(n²)', n: 4 }
  },
  insertionSort: {
    label: 'Insertion Sort',
    operation: 'Insert into sorted prefix',
    complexity: 'O(n^2) time, O(1) space',
    pseudocode: ['for i from 1 to n-1', 'key = a[i]', 'shift larger values right', 'place key', 'grow sorted prefix', 'array sorted'],
    costModel: { headline: 'comparisons' as CostMetric, bound: (n: number) => (n * (n - 1)) / 2, boundLabel: 'O(n²)', n: 4 }
  }
} as const;

export type TopicId = keyof typeof visualizerMeta;

export const createArrayAccessSteps = (): VisualStep[] => [
  {
    title: 'Start with fixed indexes',
    operation: 'read',
    explanation: 'An array stores values in consecutive positions, so each value has a numeric index.',
    activeLine: 1,
    items: items([4, 9, 2, 8, 6]),
    pointers: { index: null }
  },
  {
    title: 'Select index 3',
    operation: 'read',
    explanation: 'The lookup asks for index 3, so the visual pointer moves directly to that position.',
    activeLine: 2,
    items: items([4, 9, 2, 8, 6], { 3: 'compare' }),
    pointers: { index: 3 }
  },
  {
    title: 'Return the value',
    operation: 'read',
    explanation: 'No scanning is needed. The array returns the value stored at index 3.',
    activeLine: 3,
    items: items([4, 9, 2, 8, 6], { 3: 'active' }),
    pointers: { index: 3 },
    cost: { reads: 1 }
  }
];

export const createStackSteps = (): VisualStep[] => [
  {
    title: 'Start with an empty stack',
    operation: 'start',
    explanation: 'A stack adds and removes from the same end, called the top.',
    activeLine: 1,
    items: [],
    pointers: { top: null }
  },
  {
    title: 'Push 12',
    operation: 'push',
    explanation: 'The first pushed value becomes the bottom and the top at the same time.',
    activeLine: 1,
    items: items([12], { 0: 'active' }),
    pointers: { top: 0 },
    cost: { writes: 1 }
  },
  {
    title: 'Push 7',
    operation: 'push',
    explanation: 'A new value is placed above the old top.',
    activeLine: 2,
    items: items([12, 7], { 1: 'active' }),
    pointers: { top: 1 },
    cost: { writes: 1 }
  },
  {
    title: 'Push 28',
    operation: 'push',
    explanation: 'The most recent push is always easiest to remove.',
    activeLine: 3,
    items: items([12, 7, 28], { 2: 'active' }),
    pointers: { top: 2 },
    cost: { writes: 1 }
  },
  {
    title: 'Pop the top',
    operation: 'pop',
    explanation: 'Pop removes 28 first because stacks are last-in, first-out.',
    activeLine: 3,
    items: items([12, 7], { 1: 'active' }),
    pointers: { top: 1 },
    cost: { writes: 1 }
  }
];

export const createQueueSteps = (): VisualStep[] => [
  {
    title: 'Start with an empty queue',
    operation: 'start',
    explanation: 'A queue adds at the rear and removes from the front.',
    activeLine: 1,
    items: [],
    pointers: { front: null, rear: null }
  },
  {
    title: 'Enqueue 5',
    operation: 'enqueue',
    explanation: 'The first value is both the front and the rear.',
    activeLine: 1,
    items: items([5], { 0: 'active' }),
    pointers: { front: 0, rear: 0 },
    cost: { writes: 1 }
  },
  {
    title: 'Enqueue 18',
    operation: 'enqueue',
    explanation: 'New values join behind the current rear.',
    activeLine: 2,
    items: items([5, 18], { 1: 'active' }),
    pointers: { front: 0, rear: 1 },
    cost: { writes: 1 }
  },
  {
    title: 'Enqueue 31',
    operation: 'enqueue',
    explanation: 'The rear pointer follows the newest value.',
    activeLine: 3,
    items: items([5, 18, 31], { 2: 'active' }),
    pointers: { front: 0, rear: 2 },
    cost: { writes: 1 }
  },
  {
    title: 'Dequeue front',
    operation: 'dequeue',
    explanation: 'Dequeue removes 5 first because queues are first-in, first-out.',
    activeLine: 4,
    items: items([18, 31], { 0: 'active' }),
    pointers: { front: 0, rear: 1 },
    cost: { writes: 1 }
  }
];

export const createLinkedListInsertSteps = (): VisualStep[] => [
  {
    title: 'Find the insertion point',
    operation: 'search',
    explanation: 'A linked list follows references until it reaches the node before the target position.',
    activeLine: 1,
    items: items([11, 37, 50], { 0: 'active' }),
    links: [
      [0, 1],
      [1, 2]
    ],
    cost: { reads: 1 }
  },
  {
    title: 'Point new node forward',
    operation: 'link',
    explanation: 'The new node points to the node that used to come after 11.',
    activeLine: 2,
    items: items([11, 24, 37, 50], { 1: 'active', 2: 'compare' }),
    links: [
      [0, 2],
      [1, 2],
      [2, 3]
    ],
    cost: { reads: 1, writes: 1 }
  },
  {
    title: 'Point previous node to new node',
    operation: 'link',
    explanation: 'Updating one reference inserts 24 into the chain.',
    activeLine: 3,
    items: items([11, 24, 37, 50], { 0: 'compare', 1: 'active' }),
    links: [
      [0, 1],
      [1, 2],
      [2, 3]
    ],
    cost: { writes: 1 }
  },
  {
    title: 'Insertion complete',
    operation: 'insert',
    explanation: 'The list order is now 11, 24, 37, 50.',
    activeLine: 4,
    items: items([11, 24, 37, 50], { 1: 'complete' }),
    links: [
      [0, 1],
      [1, 2],
      [2, 3]
    ]
  }
];

export const createTreeInsertSteps = (): VisualStep[] => [
  {
    title: 'Start at the root',
    operation: 'compare',
    explanation: 'Binary search tree insertion compares the new value against the current node.',
    activeLine: 1,
    items: [],
    tree: [{ id: 'n40', value: 40, parentId: null, state: 'active' }],
    cost: { comparisons: 1 }
  },
  {
    title: 'Insert smaller value left',
    operation: 'insert',
    explanation: '25 is less than 40, so it becomes the left child.',
    activeLine: 1,
    items: [],
    tree: [
      { id: 'n40', value: 40, parentId: null },
      { id: 'n25', value: 25, parentId: 'n40', side: 'left', state: 'active' }
    ],
    cost: { writes: 1 }
  },
  {
    title: 'Insert larger value right',
    operation: 'insert',
    explanation: '60 is greater than 40, so it becomes the right child.',
    activeLine: 2,
    items: [],
    tree: [
      { id: 'n40', value: 40, parentId: null },
      { id: 'n25', value: 25, parentId: 'n40', side: 'left' },
      { id: 'n60', value: 60, parentId: 'n40', side: 'right', state: 'active' }
    ],
    cost: { writes: 1 }
  },
  {
    title: 'Walk into the left subtree',
    operation: 'compare',
    explanation: "35 is less than 40, then greater than 25, so the search moves to 25's right child.",
    activeLine: 2,
    items: [],
    tree: [
      { id: 'n40', value: 40, parentId: null },
      { id: 'n25', value: 25, parentId: 'n40', side: 'left', state: 'compare' },
      { id: 'n60', value: 60, parentId: 'n40', side: 'right' }
    ],
    cost: { comparisons: 2 }
  },
  {
    title: 'Insert 35',
    operation: 'insert',
    explanation: 'The empty right child of 25 becomes the new node.',
    activeLine: 3,
    items: [],
    tree: [
      { id: 'n40', value: 40, parentId: null },
      { id: 'n25', value: 25, parentId: 'n40', side: 'left' },
      { id: 'n60', value: 60, parentId: 'n40', side: 'right' },
      { id: 'n35', value: 35, parentId: 'n25', side: 'right', state: 'active' }
    ],
    cost: { writes: 1 }
  }
];

export const createBubbleSortSteps = (input = [5, 1, 4, 2]): VisualStep[] => {
  const values = [...input];
  const steps: VisualStep[] = [
    {
      title: 'Start bubble sort',
      operation: 'start',
      explanation: 'Bubble sort repeatedly compares adjacent values and moves larger values to the right.',
      activeLine: 1,
      items: items(values)
    }
  ];

  for (let end = values.length - 1; end > 0; end -= 1) {
    for (let index = 0; index < end; index += 1) {
      steps.push({
        title: `Compare index ${index} and ${index + 1}`,
        operation: 'compare',
        explanation: `Compare ${values[index]} with ${values[index + 1]}.`,
        activeLine: 2,
        items: items(values, { [index]: 'compare', [index + 1]: 'compare' }),
        cost: { comparisons: 1 }
      });

      if (values[index] > values[index + 1]) {
        [values[index], values[index + 1]] = [values[index + 1], values[index]];
        steps.push({
          title: 'Swap adjacent values',
          operation: 'swap',
          explanation: 'The left value is larger, so the pair swaps positions.',
          activeLine: 3,
          items: items(values, { [index]: 'swap', [index + 1]: 'swap' }),
          cost: { swaps: 1, writes: 2 }
        });
      }
    }

    steps.push({
      title: `Position ${end} is sorted`,
      operation: 'complete',
      explanation: 'The largest unsorted value has bubbled into its final position.',
      activeLine: 4,
      items: items(values, { [end]: 'complete' })
    });
  }

  steps.push({
    title: 'Array sorted',
    operation: 'complete',
    explanation: 'All passes are complete, so every value is in ascending order.',
    activeLine: 4,
    items: items(values, Object.fromEntries(values.map((_, index) => [index, 'complete'])))
  });

  return steps;
};

export const createInsertionSortSteps = (input = [9, 3, 7, 1]): VisualStep[] => {
  const values = [...input];
  const steps: VisualStep[] = [
    {
      title: 'Start insertion sort',
      operation: 'start',
      explanation: 'Insertion sort treats the left side as sorted and inserts each next value into place.',
      activeLine: 1,
      items: items(values, { 0: 'complete' })
    }
  ];

  for (let index = 1; index < values.length; index += 1) {
    const key = values[index];
    let scan = index - 1;

    steps.push({
      title: `Pick key ${key}`,
      operation: 'pick',
      explanation: `${key} is the next value to insert into the sorted prefix.`,
      activeLine: 2,
      items: items(values, { [index]: 'active' }),
      cost: { reads: 1 }
    });

    while (scan >= 0 && values[scan] > key) {
      values[scan + 1] = values[scan];
      steps.push({
        title: `Shift ${values[scan]} right`,
        operation: 'shift',
        explanation: `${values[scan]} is larger than ${key}, so it shifts one position right.`,
        activeLine: 3,
        items: items(values, { [scan]: 'compare', [scan + 1]: 'swap' }),
        cost: { comparisons: 1, writes: 1 }
      });
      scan -= 1;
    }

    values[scan + 1] = key;
    steps.push({
      title: `Place ${key}`,
      operation: 'insert',
      explanation: `${key} lands after all smaller values in the sorted prefix.`,
      activeLine: 4,
      items: items(values, { [scan + 1]: 'active' }),
      cost: { comparisons: scan >= 0 ? 1 : 0, writes: 1 }
    });

    steps.push({
      title: 'Sorted prefix grows',
      operation: 'complete',
      explanation: 'The sorted region now includes one more value.',
      activeLine: 5,
      items: items(values, Object.fromEntries(values.map((_, itemIndex) => [itemIndex, itemIndex <= index ? 'complete' : 'idle'])))
    });
  }

  steps.push({
    title: 'Array sorted',
    operation: 'complete',
    explanation: 'Every key has been inserted into the sorted prefix.',
    activeLine: 6,
    items: items(values, Object.fromEntries(values.map((_, index) => [index, 'complete'])))
  });

  return steps;
};

export const activeIndices = (step: VisualStep): number[] =>
  step.items.flatMap((item, index) =>
    item.state === 'active' || item.state === 'compare' || item.state === 'swap' ? [index] : []
  );

export const sumCost = (steps: VisualStep[], upToIndex: number): Required<StepCost> => {
  const total = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };
  for (let i = 0; i <= upToIndex && i < steps.length; i += 1) {
    const c = steps[i].cost;
    if (!c) continue;
    total.comparisons += c.comparisons ?? 0;
    total.swaps += c.swaps ?? 0;
    total.reads += c.reads ?? 0;
    total.writes += c.writes ?? 0;
  }
  return total;
};

export const topics: Array<{
  id: TopicId;
  createSteps: () => VisualStep[];
}> = [
  { id: 'array', createSteps: createArrayAccessSteps },
  { id: 'stack', createSteps: createStackSteps },
  { id: 'queue', createSteps: createQueueSteps },
  { id: 'linkedList', createSteps: createLinkedListInsertSteps },
  { id: 'tree', createSteps: createTreeInsertSteps },
  { id: 'bubbleSort', createSteps: () => createBubbleSortSteps() },
  { id: 'insertionSort', createSteps: () => createInsertionSortSteps() }
];
