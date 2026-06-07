import { motion } from 'framer-motion';
import { TopicId, TreeNode, VisualItem, VisualStep, activeIndices } from '../../visualizers';
import { Playhead } from '../Playhead';

const SPRING = { type: 'spring', stiffness: 320, damping: 30 } as const;

export function VisualizerStage({ step, topicId }: { step: VisualStep; topicId: TopicId }) {
  const frame = activeIndices(step)[0] ?? -1;

  if (step.tree) {
    return <TreeStage nodes={step.tree} />;
  }
  if (topicId === 'linkedList') {
    return <LinkedListStage items={step.items} links={step.links ?? []} frame={frame} />;
  }
  if (topicId === 'stack') {
    return <StackStage items={step.items} pointers={step.pointers} frame={frame} />;
  }
  return <ArrayStage items={step.items} pointers={step.pointers} topicId={topicId} frame={frame} />;
}

function ArrayStage({
  items,
  pointers,
  topicId,
  frame
}: {
  items: VisualItem[];
  pointers?: Record<string, number | null>;
  topicId: TopicId;
  frame: number;
}) {
  const isQueue = topicId === 'queue';

  return (
    <div className={`visual-stage ${isQueue ? 'queue-mode' : ''}`}>
      <div className="array-row">
        {items.length === 0 ? <p className="empty-note">Structure is empty</p> : null}
        {items.map((visualItem, index) => (
          <motion.div
            key={visualItem.id}
            layout
            transition={SPRING}
            className={`value-cell ${visualItem.state ?? 'idle'}`}
          >
            {index === frame ? <Playhead /> : null}
            <span>{visualItem.value}</span>
            <small>{index}</small>
            {Object.entries(pointers ?? {}).map(([name, pointerIndex]) =>
              pointerIndex === index ? (
                <em key={name} className="pointer-tag">
                  {name}
                </em>
              ) : null
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StackStage({
  items,
  pointers,
  frame
}: {
  items: VisualItem[];
  pointers?: Record<string, number | null>;
  frame: number;
}) {
  return (
    <div className="visual-stage stack-mode">
      <div className="stack-column">
        {items.length === 0 ? <p className="empty-note">Stack is empty</p> : null}
        {[...items].reverse().map((visualItem, reverseIndex) => {
          const originalIndex = items.length - reverseIndex - 1;
          return (
            <motion.div
              key={visualItem.id}
              layout
              transition={SPRING}
              className={`stack-cell ${visualItem.state ?? 'idle'}`}
            >
              {originalIndex === frame ? <Playhead /> : null}
              <span>{visualItem.value}</span>
              {pointers?.top === originalIndex ? <em className="pointer-tag">top</em> : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function LinkedListStage({
  items,
  links,
  frame
}: {
  items: VisualItem[];
  links: Array<[number, number]>;
  frame: number;
}) {
  const linkedTargets = new Map(links.map(([from, to]) => [from, to]));

  return (
    <div className="visual-stage list-mode">
      <div className="list-row">
        {items.map((visualItem, index) => (
          <div className="list-pair" key={visualItem.id}>
            <motion.div
              layout
              transition={SPRING}
              className={`node-cell ${visualItem.state ?? 'idle'}`}
            >
              {index === frame ? <Playhead /> : null}
              <span>{visualItem.value}</span>
              <small>next</small>
            </motion.div>
            {linkedTargets.has(index) ? <span className="link-arrow">→</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function TreeStage({ nodes }: { nodes: TreeNode[] }) {
  const root = nodes.find((node) => node.parentId === null);
  const left = nodes.find((node) => node.parentId === root?.id && node.side === 'left');
  const right = nodes.find((node) => node.parentId === root?.id && node.side === 'right');
  const leftRight = nodes.find((node) => node.parentId === left?.id && node.side === 'right');

  return (
    <div className="visual-stage tree-mode">
      <div className="tree-grid">
        <TreeBubble node={root} className="root" />
        <TreeBubble node={left} className="left" />
        <TreeBubble node={right} className="right" />
        <TreeBubble node={leftRight} className="left-right" />
      </div>
    </div>
  );
}

function TreeBubble({ node, className }: { node?: TreeNode; className: string }) {
  if (!node) {
    return <div className={`tree-bubble ghost ${className}`} />;
  }

  return (
    <div className={`tree-bubble ${node.state ?? 'idle'} ${className}`}>
      <span>{node.value}</span>
    </div>
  );
}
