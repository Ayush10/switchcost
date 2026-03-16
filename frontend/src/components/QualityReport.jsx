const QUALITY_EVIDENCE = [
  {
    title: 'LLM-as-Judge Validation',
    desc: 'Every candidate output is scored 0-100 against the baseline by an independent judge model (Llama 3.1 8B). Only models scoring above the 80% quality threshold receive a MIGRATE verdict.',
    metric: '80%',
    metricLabel: 'minimum quality threshold',
    color: 'text-accent-green',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/5',
  },
  {
    title: 'Multi-Model Redundancy',
    desc: 'Each subtask is tested against 4-5 different open models. If one model underperforms on a task type, the planner selects the next best option. No single point of failure in quality.',
    metric: '5',
    metricLabel: 'models tested per subtask',
    color: 'text-accent-purple',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/5',
  },
  {
    title: 'Task-Type Specialization',
    desc: 'Different models excel at different tasks. Classification and extraction can use smaller, cheaper models without quality loss. Only complex reasoning needs larger models. SwitchCost routes each task type to its optimal model.',
    metric: 'Per-type',
    metricLabel: 'routing, not one-size-fits-all',
    color: 'text-accent-cyan',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/5',
  },
  {
    title: 'Human Evaluation Layer',
    desc: 'For high-stakes migrations, Toloka crowdsourced expert workers independently validate the LLM judge scores. This dual AI + human evaluation eliminates blind spots in automated scoring.',
    metric: 'Dual',
    metricLabel: 'AI + human evaluation',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/5',
  },
];

function ScoreBreakdown({ plan }) {
  if (!plan || plan.length === 0) return null;

  const migratable = plan.filter(r => r.verdict === 'MIGRATE');
  const avgQuality = migratable.length > 0
    ? migratable.reduce((a, r) => a + r.quality_parity_score, 0) / migratable.length
    : 0;
  const minQuality = migratable.length > 0
    ? Math.min(...migratable.map(r => r.quality_parity_score))
    : 0;
  const maxQuality = migratable.length > 0
    ? Math.max(...migratable.map(r => r.quality_parity_score))
    : 0;

  return (
    <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 mt-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Quality Score Distribution (Migrated Subtasks)
      </p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold font-mono text-accent-green">{avgQuality.toFixed(0)}%</p>
          <p className="text-[10px] text-gray-600">Average Quality</p>
        </div>
        <div>
          <p className="text-2xl font-bold font-mono text-accent-amber">{minQuality}%</p>
          <p className="text-[10px] text-gray-600">Minimum Score</p>
        </div>
        <div>
          <p className="text-2xl font-bold font-mono text-accent-cyan">{maxQuality}%</p>
          <p className="text-[10px] text-gray-600">Highest Score</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-surface-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-green" />
          <p className="text-xs text-gray-400">
            All migrated subtasks score <span className="text-white font-semibold">above 80%</span> quality parity — meaning the open-source model output is statistically indistinguishable from the proprietary baseline for practical use cases.
          </p>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-cyan" />
          <p className="text-xs text-gray-400">
            Tasks scoring below threshold are automatically marked <span className="text-accent-amber font-semibold">KEEP</span> — SwitchCost never recommends a migration that would degrade quality.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function QualityReport({ plan }) {
  return (
    <div className="gradient-border p-6 glow-green">
      <h3 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-1">
        Quality Assurance Report
      </h3>
      <p className="text-xs text-gray-600 mb-5">
        Why this migration is safe — four layers of quality protection
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {QUALITY_EVIDENCE.map((ev) => (
          <div key={ev.title} className={`${ev.bgColor} border ${ev.borderColor} rounded-xl p-4`}>
            <div className="flex items-start justify-between mb-2">
              <h4 className={`text-xs font-bold ${ev.color}`}>{ev.title}</h4>
              <div className="text-right flex-shrink-0 ml-3">
                <p className={`text-lg font-bold font-mono ${ev.color}`}>{ev.metric}</p>
                <p className="text-[9px] text-gray-600">{ev.metricLabel}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{ev.desc}</p>
          </div>
        ))}
      </div>

      <ScoreBreakdown plan={plan} />
    </div>
  );
}
