import type { CostMetric, CostModel, StepCost } from '../visualizers';

type Counts = Required<StepCost>;

const METRICS: Array<[CostMetric, string]> = [
  ['comparisons', 'Comparisons'],
  ['swaps', 'Swaps'],
  ['writes', 'Writes'],
  ['reads', 'Reads']
];

export function CostMeter({ counts, model }: { counts: Counts; model: Readonly<CostModel> }) {
  const actual = counts[model.headline];
  const bound = model.bound(model.n);
  const ratio = bound > 0 ? Math.min(1, actual / bound) : 1;

  return (
    <section className="cost-meter" aria-label="Operation cost">
      <p className="label">{model.headline}</p>
      <p className="cost-headline">
        <strong>{actual}</strong>
        <span> / {bound}</span>
      </p>
      <div className="cost-bar">
        <span style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className="cost-pred">
        Actual vs <b>{model.boundLabel}</b> for n={model.n} → ~{bound}
      </p>
      <dl className="cost-breakdown">
        {METRICS.filter(([metric]) => metric !== model.headline).map(([metric, label]) => (
          <div key={metric}>
            <dt>{label}</dt>
            <dd>{counts[metric]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
