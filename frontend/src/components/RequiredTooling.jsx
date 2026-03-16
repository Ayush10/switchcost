const TOOLS = [
  {
    name: 'Nebius Token Factory',
    role: 'Primary Inference Provider',
    why: 'Hosts the core open-source models (Llama 3.1 8B, Qwen3 32B, DeepSeek R1). Provides OpenAI-compatible API endpoints with 5-15x lower pricing than proprietary alternatives. Required for running all migrated subtasks.',
    required: true,
    models: ['Llama 3.1 8B — $0.03/$0.09 per 1M tokens', 'Qwen3 32B — $0.14/$0.14 per 1M tokens', 'DeepSeek R1 671B — $0.80/$2.40 per 1M tokens'],
    color: 'text-accent-cyan',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/5',
    dotColor: 'bg-accent-cyan',
  },
  {
    name: 'OpenRouter',
    role: 'Secondary Inference Provider',
    why: 'Expands model coverage with additional open-source options (GPT-OSS 20B, Qwen3 30B MoE). Ensures you\'re not locked into a single provider and can always find the cheapest model for each task type.',
    required: false,
    models: ['GPT-OSS 20B — $0.05/$0.20 per 1M tokens', 'Qwen3 30B MoE — $0.10/$0.30 per 1M tokens'],
    color: 'text-accent-green',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/5',
    dotColor: 'bg-accent-green',
  },
  {
    name: 'Tavily',
    role: 'Agentic Web Search',
    why: 'LLMs cannot browse the web. For any agentic workflow that involves research, fact-checking, or real-time data retrieval, a dedicated search API is required. Tavily provides structured search results that ground model outputs and prevent hallucination.',
    required: true,
    models: [],
    useCases: ['Real-time research subtasks', 'Fact verification', 'Competitive intelligence', 'RAG pipeline augmentation'],
    color: 'text-accent-pink',
    borderColor: 'border-pink-500/30',
    bgColor: 'bg-pink-500/5',
    dotColor: 'bg-accent-pink',
  },
  {
    name: 'Toloka',
    role: 'Human Quality Validation',
    why: 'LLM-as-judge scoring has known biases (verbosity bias, position bias, self-preference). For production migrations, human expert evaluation via Toloka provides ground-truth quality validation that calibrates and validates the automated scoring pipeline.',
    required: false,
    models: [],
    useCases: ['High-stakes migration validation', 'LLM judge calibration', 'Subjective quality assessment', 'Compliance-sensitive outputs'],
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/5',
    dotColor: 'bg-blue-400',
  },
];

export default function RequiredTooling() {
  return (
    <div className="gradient-border p-6">
      <h3 className="text-sm font-semibold text-accent-amber uppercase tracking-wider mb-1">
        Required Tooling Stack
      </h3>
      <p className="text-xs text-gray-600 mb-5">
        What you need beyond open-source models to maintain the same quality level
      </p>

      <div className="space-y-3">
        {TOOLS.map((tool) => (
          <div key={tool.name} className={`${tool.bgColor} border ${tool.borderColor} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${tool.dotColor}`} />
                <span className={`text-sm font-bold ${tool.color}`}>{tool.name}</span>
                <span className="text-[10px] font-mono text-gray-600 bg-surface-800 px-1.5 py-0.5 rounded">
                  {tool.role}
                </span>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                tool.required
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-surface-800 text-gray-500 border border-surface-700'
              }`}>
                {tool.required ? 'REQUIRED' : 'RECOMMENDED'}
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-3">{tool.why}</p>

            {tool.models.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-600 font-mono uppercase mb-1.5">Available Models</p>
                <div className="space-y-1">
                  {tool.models.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                      <span className={`w-1 h-1 rounded-full ${tool.dotColor}`} />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tool.useCases && tool.useCases.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-600 font-mono uppercase mb-1.5">Use Cases</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.useCases.map((uc) => (
                    <span key={uc} className="text-[10px] px-2 py-0.5 rounded bg-surface-800 text-gray-400 border border-surface-700">
                      {uc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 bg-surface-900 border border-surface-700 rounded-xl p-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-white font-semibold">Bottom line:</span> Switching to open-source models is not just about swapping the LLM. To maintain quality parity, you need
          <span className="text-accent-pink font-semibold"> agentic search </span> for grounded retrieval,
          <span className="text-accent-cyan font-semibold"> multi-provider inference </span> for model diversity, and optionally
          <span className="text-blue-400 font-semibold"> human evaluation </span> for validation.
          SwitchCost accounts for all of these in its migration plan — the recommended cost includes the full tooling stack, not just model inference.
        </p>
      </div>
    </div>
  );
}
