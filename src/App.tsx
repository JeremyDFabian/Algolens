import { useEffect, useMemo, useState } from 'react';
import {
  TopicId,
  TreeNode,
  VisualItem,
  VisualStep,
  topics,
  visualizerMeta
} from './visualizers';
import { useTheme } from './theme';
import { ThemeToggle } from './components/ThemeToggle';
import { usePlayback } from './hooks/usePlayback';
import './styles.css';

const stateLabels: Record<string, string> = {
  idle: 'Idle',
  active: 'Active',
  compare: 'Compare',
  swap: 'Swap',
  complete: 'Complete',
  muted: 'Muted'
};

function App() {
  const { theme, toggle } = useTheme();
  const [topicId, setTopicId] = useState<TopicId>('stack');

  const activeTopic = useMemo(() => topics.find((topic) => topic.id === topicId) ?? topics[0], [topicId]);
  const steps = useMemo(() => activeTopic.createSteps(), [activeTopic]);
  const meta = visualizerMeta[topicId];
  const playback = usePlayback(steps.length);
  const currentStep = steps[playback.stepIndex];
  const progress = ((playback.stepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    playback.setStepIndex(0);
  }, [topicId]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">College CS lab</p>
          <h1>DSA Visualizer Lab</h1>
        </div>
        <div className="topbar-right">
          <div className="status-strip" aria-label="Current topic summary">
            <span>{meta.operation}</span>
            <strong>{topics.length} visual labs</strong>
          </div>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <section className="workspace" aria-label="Interactive visualizer">
        <nav className="topic-rail" aria-label="DSA topics">
          {topics.map((topic) => {
            const topicMeta = visualizerMeta[topic.id];
            return (
              <button
                key={topic.id}
                className={topic.id === topicId ? 'topic-button active' : 'topic-button'}
                type="button"
                onClick={() => setTopicId(topic.id)}
              >
                <span>{topicMeta.label}</span>
                <small>{topicMeta.operation}</small>
              </button>
            );
          })}
        </nav>

        <section className="stage-column">
          <div className="stage-header">
            <div>
              <p className="eyebrow">{meta.label}</p>
              <h2>{currentStep.title}</h2>
            </div>
            <span className="step-pill">
              Step {playback.stepIndex + 1} of {steps.length}
            </span>
          </div>

          <VisualizerStage step={currentStep} topicId={topicId} />

          <div className="timeline" aria-label="Visualization progress">
            <span style={{ width: `${progress}%` }} />
          </div>

          <ControlDeck
            isPlaying={playback.isPlaying}
            speed={playback.speed}
            canGoBack={playback.stepIndex > 0}
            canGoForward={playback.stepIndex < steps.length - 1}
            onPlayPause={playback.togglePlay}
            onPrevious={playback.previous}
            onNext={playback.next}
            onReset={playback.reset}
            onSpeedChange={playback.setSpeed}
          />
        </section>

        <aside className="learning-panel" aria-label="Learning details">
          <section className="explain-block">
            <p className="eyebrow">What changed</p>
            <h2>{currentStep.operation}</h2>
            <p>{currentStep.explanation}</p>
          </section>

          <section className="code-block">
            <div className="panel-heading">
              <p className="eyebrow">Pseudocode</p>
              <span>{meta.complexity}</span>
            </div>
            <ol>
              {meta.pseudocode.map((line, index) => (
                <li key={line} className={index + 1 === currentStep.activeLine ? 'active-line' : ''}>
                  <code>{line}</code>
                </li>
              ))}
            </ol>
          </section>

          <section className="legend" aria-label="State legend">
            {Object.entries(stateLabels)
              .filter(([state]) => state !== 'muted')
              .map(([state, label]) => (
                <span key={state}>
                  <i className={`dot ${state}`} />
                  {label}
                </span>
              ))}
          </section>
        </aside>
      </section>
    </main>
  );
}

type ControlDeckProps = {
  isPlaying: boolean;
  speed: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
};

function ControlDeck({
  isPlaying,
  speed,
  canGoBack,
  canGoForward,
  onPlayPause,
  onPrevious,
  onNext,
  onReset,
  onSpeedChange
}: ControlDeckProps) {
  return (
    <div className="control-deck">
      <div className="icon-controls">
        <button type="button" onClick={onPrevious} disabled={!canGoBack} title="Previous step" aria-label="Previous step">
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" onClick={onPlayPause} title={isPlaying ? 'Pause' : 'Play'} aria-label={isPlaying ? 'Pause' : 'Play'}>
          <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
        </button>
        <button type="button" onClick={onNext} disabled={!canGoForward} title="Next step" aria-label="Next step">
          <span aria-hidden="true">›</span>
        </button>
        <button type="button" onClick={onReset} title="Reset" aria-label="Reset">
          <span aria-hidden="true">↺</span>
        </button>
      </div>

      <label className="speed-control">
        <span>Speed</span>
        <input
          type="range"
          min="350"
          max="1400"
          step="50"
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        />
      </label>
    </div>
  );
}

function VisualizerStage({ step, topicId }: { step: VisualStep; topicId: TopicId }) {
  if (step.tree) {
    return <TreeStage nodes={step.tree} />;
  }

  if (topicId === 'linkedList') {
    return <LinkedListStage items={step.items} links={step.links ?? []} />;
  }

  if (topicId === 'stack') {
    return <StackStage items={step.items} pointers={step.pointers} />;
  }

  return <ArrayStage items={step.items} pointers={step.pointers} topicId={topicId} />;
}

function ArrayStage({
  items,
  pointers,
  topicId
}: {
  items: VisualItem[];
  pointers?: Record<string, number | null>;
  topicId: TopicId;
}) {
  const isQueue = topicId === 'queue';

  return (
    <div className={`visual-stage ${isQueue ? 'queue-mode' : ''}`}>
      <div className="array-row">
        {items.length === 0 ? <p className="empty-note">Structure is empty</p> : null}
        {items.map((visualItem, index) => (
          <div key={visualItem.id} className={`value-cell ${visualItem.state ?? 'idle'}`}>
            <span>{visualItem.value}</span>
            <small>{index}</small>
            {Object.entries(pointers ?? {}).map(([name, pointerIndex]) =>
              pointerIndex === index ? (
                <em key={name} className="pointer-tag">
                  {name}
                </em>
              ) : null
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StackStage({ items, pointers }: { items: VisualItem[]; pointers?: Record<string, number | null> }) {
  return (
    <div className="visual-stage stack-mode">
      <div className="stack-column">
        {items.length === 0 ? <p className="empty-note">Stack is empty</p> : null}
        {[...items].reverse().map((visualItem, reverseIndex) => {
          const originalIndex = items.length - reverseIndex - 1;
          return (
            <div key={visualItem.id} className={`stack-cell ${visualItem.state ?? 'idle'}`}>
              <span>{visualItem.value}</span>
              {pointers?.top === originalIndex ? <em className="pointer-tag">top</em> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LinkedListStage({ items, links }: { items: VisualItem[]; links: Array<[number, number]> }) {
  const linkedTargets = new Map(links.map(([from, to]) => [from, to]));

  return (
    <div className="visual-stage list-mode">
      <div className="list-row">
        {items.map((visualItem, index) => (
          <div className="list-pair" key={visualItem.id}>
            <div className={`node-cell ${visualItem.state ?? 'idle'}`}>
              <span>{visualItem.value}</span>
              <small>next</small>
            </div>
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

export default App;
