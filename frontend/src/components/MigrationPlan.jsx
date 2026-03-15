const VERDICT_STYLES = {
  MIGRATE: {
    bg: 'bg-green-500/10',
    text: 'text-accent-green',
    border: 'border-green-500/30',
    badge: 'bg-green-500/20 text-green-400',
  },
  KEEP: {
    bg: 'bg-amber-500/10',
    text: 'text-accent-amber',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-400',
  },
};

function QualityBar({ score }) {
  let color = 'bg-green-500';
  if (score < 80) color = 'bg-red-500';
  else if (score < 85) color = 'bg-amber-500';
  else if (score < 95) color = 'bg-green-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-400 w-10 text-right">
        {score}%
      </span>
    </div>
  );
}

export default function MigrationPlan({ plan }) {
  if (!plan || plan.length === 0) return null;

  const migrateCount = plan.filter(r => r.verdict === 'MIGRATE').length;
  const totalWeight = plan.reduce((acc, r) => acc + (r.call_count || 1), 0);
  const weightedReduction = plan.reduce(
    (acc, r) => acc + r.cost_reduction_pct * (r.call_count || 1), 0
  ) / totalWeight;

  return (
    <div className="gradient-border p-6 glow-green">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">
          Migration Plan
        </h3>
        <div className="text-sm text-gray-400">
          <span className="text-accent-green font-bold">{migrateCount}</span> of{' '}
          <span className="font-bold">{plan.length}</span> call types can migrate
          {' '}&middot;{' '}
          <span className="text-accent-green font-bold">
            {weightedReduction.toFixed(0)}%
          </span> avg cost reduction
        </div>
      </div>

      <div className="space-y-3">
        {plan.map((rec) => {
          const styles = VERDICT_STYLES[rec.verdict] || VERDICT_STYLES.KEEP;
          return (
            <div
              key={rec.subtask_type}
              className={`${styles.bg} border ${styles.border} rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 uppercase bg-surface-800 px-2 py-1 rounded">
                    {rec.subtask_type}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                    {rec.verdict}
                  </span>
                </div>
                {rec.verdict === 'MIGRATE' && (
                  <span className="text-accent-green font-bold text-sm font-mono">
                    {rec.cost_reduction_pct.toFixed(0)}% cheaper
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-3">
                {/* Current model */}
                <div className="flex-1 bg-surface-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Current (GPT-4 class)</p>
                  <p className="text-sm text-orange-400 font-semibold">
                    {rec.baseline_display_name}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    ${(rec.baseline_cost_per_call * 1000).toFixed(4)}/call
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-gray-600 text-xl flex-shrink-0">
                  {rec.verdict === 'MIGRATE' ? (
                    <span className="text-accent-green">&#8594;</span>
                  ) : (
                    <span>&#8594;</span>
                  )}
                </div>

                {/* Recommended model */}
                <div className={`flex-1 rounded-lg p-3 ${
                  rec.verdict === 'MIGRATE'
                    ? 'bg-green-500/5 border border-green-500/20'
                    : 'bg-surface-800/50'
                }`}>
                  <p className="text-xs text-gray-600 mb-1">Recommended</p>
                  <p className={`text-sm font-semibold ${
                    rec.verdict === 'MIGRATE' ? 'text-accent-green' : 'text-gray-400'
                  }`}>
                    {rec.recommended_display_name}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    ${(rec.recommended_cost_per_call * 1000).toFixed(4)}/call
                  </p>
                </div>
              </div>

              {/* Quality bar */}
              <div>
                <p className="text-xs text-gray-600 mb-1">Quality Parity</p>
                <QualityBar score={rec.quality_parity_score} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
