const MODEL_COLORS = {
  'nebius-small': { bg: 'bg-cyan-500/10', text: 'text-accent-cyan', border: 'border-cyan-500/30' },
  'nebius-mid': { bg: 'bg-purple-500/10', text: 'text-accent-purple', border: 'border-purple-500/30' },
  'nebius-large': { bg: 'bg-orange-500/10', text: 'text-accent-orange', border: 'border-orange-500/30' },
  'openrouter-small': { bg: 'bg-green-500/10', text: 'text-accent-green', border: 'border-green-500/30' },
  'openrouter-mid': { bg: 'bg-amber-500/10', text: 'text-accent-amber', border: 'border-amber-500/30' },
  'tavily': { bg: 'bg-pink-500/10', text: 'text-accent-pink', border: 'border-pink-500/30' },
};

function StepCard({ step }) {
  const colors = MODEL_COLORS[step.model_key] || {
    bg: 'bg-surface-700', text: 'text-gray-400', border: 'border-surface-600',
  };

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-3 animate-slide-in`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-mono font-semibold ${colors.text}`}>
          {step.model_key}
        </span>
        <span className="text-xs text-gray-600">
          {step.subtask_type}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
        <span>${(step.estimated_cost * 1000).toFixed(3)}</span>
        <span>{Math.round(step.latency_ms)}ms</span>
        <span>{step.input_tokens + step.output_tokens} tok</span>
      </div>
      {step.output_preview && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{step.output_preview}</p>
      )}
    </div>
  );
}

function ReplayCard({ replay }) {
  const colors = MODEL_COLORS[replay.model_key] || {
    bg: 'bg-surface-700', text: 'text-gray-400', border: 'border-surface-600',
  };
  const qualityColor =
    replay.quality_score >= 80 ? 'text-accent-green' :
    replay.quality_score >= 60 ? 'text-accent-amber' : 'text-red-400';

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-2.5`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-mono font-semibold ${colors.text}`}>
          {replay.display_name || replay.model_key}
        </span>
        <span className={`text-xs font-bold font-mono ${qualityColor}`}>
          {replay.quality_score}/100
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-600 font-mono mt-1">
        <span>${(replay.estimated_cost * 1000).toFixed(3)}</span>
        <span>{Math.round(replay.latency_ms)}ms</span>
      </div>
    </div>
  );
}

export default function StepTimeline({ baselineSteps, replays }) {
  // Group replays by subtask_id
  const replaysBySubtask = {};
  for (const r of replays || []) {
    if (!replaysBySubtask[r.subtask_id]) replaysBySubtask[r.subtask_id] = [];
    replaysBySubtask[r.subtask_id].push(r);
  }

  return (
    <div className="gradient-border p-5">
      <h3 className="text-sm font-semibold text-accent-amber mb-4 uppercase tracking-wider">
        Analysis Timeline
      </h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {baselineSteps.map((step, i) => (
          <div key={`step-${i}`}>
            <p className="text-xs text-gray-600 font-semibold uppercase mb-1.5">
              Step {step.step_id}: {step.subtask_type} (baseline)
            </p>
            <StepCard step={step} />

            {replaysBySubtask[step.step_id] && (
              <div className="ml-4 mt-2 space-y-1.5">
                <p className="text-xs text-gray-700 font-mono">Replays:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                  {replaysBySubtask[step.step_id].map((r, j) => (
                    <ReplayCard key={`replay-${i}-${j}`} replay={r} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
