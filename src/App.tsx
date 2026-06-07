import { useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { TopicId, sumCost, topics, visualizerMeta } from './visualizers';
import { useTheme } from './theme';
import { ThemeToggle } from './components/ThemeToggle';
import { CostMeter } from './components/CostMeter';
import { VisualizerStage } from './components/stages/VisualizerStage';
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
  const counts = useMemo(() => sumCost(steps, playback.stepIndex), [steps, playback.stepIndex]);

  useEffect(() => {
    playback.setStepIndex(0);
  }, [topicId]);

  return (
    <MotionConfig reducedMotion="user">
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
          <CostMeter counts={counts} model={meta.costModel} />
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
    </MotionConfig>
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

export default App;
