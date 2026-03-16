import { useState } from 'react';

const MODEL_COLORS = {
  'nebius-small': { bg: 'bg-cyan-500/10', text: 'text-accent-cyan', border: 'border-cyan-500/30' },
  'nebius-mid': { bg: 'bg-purple-500/10', text: 'text-accent-purple', border: 'border-purple-500/30' },
  'nebius-large': { bg: 'bg-orange-500/10', text: 'text-accent-orange', border: 'border-orange-500/30' },
  'openrouter-small': { bg: 'bg-green-500/10', text: 'text-accent-green', border: 'border-green-500/30' },
  'openrouter-mid': { bg: 'bg-amber-500/10', text: 'text-accent-amber', border: 'border-amber-500/30' },
  'tavily': { bg: 'bg-pink-500/10', text: 'text-accent-pink', border: 'border-pink-500/30' },
};

const MODEL_DISPLAY = {
  'nebius-large': 'DeepSeek R1 671B',
  'nebius-small': 'Llama 3.1 8B',
  'nebius-mid': 'Qwen3 32B',
  'openrouter-small': 'GPT-OSS 20B',
  'openrouter-mid': 'Qwen3 30B MoE',
  'tavily': 'Tavily Search',
};

function StepCard({ step }) {
  const [expanded, setExpanded] = useState(false);
  const colors = MODEL_COLORS[step.model_key] || {
    bg: 'bg-surface-700', text: 'text-gray-400', border: 'border-surface-600',
  };

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 animate-slide-in`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold ${colors.text}`}>
            {MODEL_DISPLAY[step.model_key] || step.model_key}
          </span>
          <span className="text-[10px] font-mono text-gray-600 bg-surface-800 px-1.5 py-0.5 rounded">
            {step.subtask_type}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="text-gray-600">cost</span>
            ${(step.estimated_cost * 1000).toFixed(3)}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-600">lat</span>
            {Math.round(step.latency_ms)}ms
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-600">tok</span>
            {(step.input_tokens + step.output_tokens).toLocaleString()}
          </span>
        </div>
      </div>
      {step.output_preview && (
        <div>
          <p className={`text-xs text-gray-400 leading-relaxed whitespace-pre-line ${expanded ? '' : 'line-clamp-3'}`}>
            {step.output_preview}
          </p>
          {step.output_preview.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-accent-cyan/70 hover:text-accent-cyan mt-1 font-mono transition"
            >
              {expanded ? 'Show less' : 'Show full output'}
            </button>
          )}
        </div>
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
  const qualityBg =
    replay.quality_score >= 80 ? 'bg-green-500/10' :
    replay.quality_score >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10';

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-2.5`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-mono font-semibold ${colors.text}`}>
          {replay.display_name || replay.model_key}
        </span>
        <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${qualityColor} ${qualityBg}`}>
          {replay.quality_score}/100
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
        <span>${(replay.estimated_cost * 1000).toFixed(3)}</span>
        <span>&middot;</span>
        <span>{Math.round(replay.latency_ms)}ms</span>
        {replay.quality_score >= 80 && (
          <>
            <span>&middot;</span>
            <span className="text-accent-green">PASS</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function StepTimeline({ baselineSteps, replays }) {
  const replaysBySubtask = {};
  for (const r of replays || []) {
    if (!replaysBySubtask[r.subtask_id]) replaysBySubtask[r.subtask_id] = [];
    replaysBySubtask[r.subtask_id].push(r);
  }

  const totalCost = baselineSteps.reduce((a, s) => a + s.estimated_cost, 0);
  const totalLatency = baselineSteps.reduce((a, s) => a + s.latency_ms, 0);
  const totalReplays = (replays || []).length;

  return (
    <div className="gradient-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-accent-amber uppercase tracking-wider">
          Execution Timeline
        </h3>
        <div className="flex items-center gap-4 text-[10px] text-gray-600 font-mono">
          <span>{baselineSteps.length} steps</span>
          <span>{totalReplays} replays</span>
          <span>${(totalCost * 1000).toFixed(2)} total</span>
          <span>{(totalLatency / 1000).toFixed(1)}s</span>
        </div>
      </div>
      <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
        {baselineSteps.map((step, i) => (
          <div key={`step-${i}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-surface-800 border border-surface-600 flex items-center justify-center text-[10px] font-mono text-gray-500 flex-shrink-0">
                {step.step_id}
              </span>
              <p className="text-xs text-gray-400 font-semibold uppercase">
                {step.subtask_type}
                <span className="text-gray-600 font-normal ml-2">baseline</span>
              </p>
            </div>
            <StepCard step={step} />

            {replaysBySubtask[step.step_id] && (
              <div className="ml-8 mt-2 space-y-1.5">
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                  Replays ({replaysBySubtask[step.step_id].length} models tested)
                </p>
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
