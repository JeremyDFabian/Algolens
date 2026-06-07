import type { CostModel, StepCost } from '../visualizers';

type Counts = Required<StepCost>;

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
        {model.headline !== 'comparisons' && (
          <div><dt>Comparisons</dt><dd>{counts.comparisons}</dd></div>
        )}
        {model.headline !== 'swaps' && (
          <div><dt>Swaps</dt><dd>{counts.swaps}</dd></div>
        )}
        {model.headline !== 'writes' && (
          <div><dt>Writes</dt><dd>{counts.writes}</dd></div>
        )}
        {model.headline !== 'reads' && (
          <div><dt>Reads</dt><dd>{counts.reads}</dd></div>
        )}
      </dl>
    </section>
  );
}
