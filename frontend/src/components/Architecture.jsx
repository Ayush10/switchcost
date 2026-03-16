import { useState, useEffect } from 'react';

const PIPELINE_STEPS = [
  {
    id: 'input',
    label: 'User Task',
    desc: 'Complex agentic prompt with multiple subtasks',
    color: 'border-gray-600',
    textColor: 'text-white',
    bgHover: 'hover:border-gray-500',
  },
  {
    id: 'decompose',
    label: 'Decomposer',
    desc: 'Breaks task into typed subtasks',
    model: 'Qwen3 32B',
    sponsor: 'Nebius Token Factory',
    sponsorColor: 'text-accent-cyan',
    color: 'border-cyan-500/40',
    textColor: 'text-accent-cyan',
    bgHover: 'hover:border-cyan-500/60',
  },
  {
    id: 'baseline',
    label: 'Baseline',
    desc: 'Runs each subtask on expensive model',
    model: 'DeepSeek R1 671B',
    sponsor: 'Nebius Token Factory',
    sponsorColor: 'text-accent-cyan',
    color: 'border-orange-500/40',
    textColor: 'text-accent-orange',
    bgHover: 'hover:border-orange-500/60',
  },
  {
    id: 'search',
    label: 'Web Search',
    desc: 'Agentic search for research subtasks',
    model: 'Search API',
    sponsor: 'Tavily',
    sponsorColor: 'text-accent-pink',
    color: 'border-pink-500/40',
    textColor: 'text-accent-pink',
    bgHover: 'hover:border-pink-500/60',
  },
  {
    id: 'replay',
    label: 'Replay Engine',
    desc: 'Tests every subtask against all open models',
    model: '5 models',
    sponsor: 'Nebius + OpenRouter',
    sponsorColor: 'text-accent-purple',
    color: 'border-purple-500/40',
    textColor: 'text-accent-purple',
    bgHover: 'hover:border-purple-500/60',
  },
  {
    id: 'judge',
    label: 'Quality Judge',
    desc: 'Scores each replay 0-100 vs baseline',
    model: 'Llama 3.1 8B',
    sponsor: 'Nebius Token Factory',
    sponsorColor: 'text-accent-cyan',
    color: 'border-green-500/40',
    textColor: 'text-accent-green',
    bgHover: 'hover:border-green-500/60',
  },
  {
    id: 'human',
    label: 'Human Eval',
    desc: 'Optional crowdsourced quality validation',
    model: 'Expert Workers',
    sponsor: 'Toloka',
    sponsorColor: 'text-blue-400',
    color: 'border-blue-500/40',
    textColor: 'text-blue-400',
    bgHover: 'hover:border-blue-500/60',
    optional: true,
  },
  {
    id: 'plan',
    label: 'Migration Plan',
    desc: 'Cheapest model per subtask at >80% quality',
    color: 'border-green-500/40',
    textColor: 'text-accent-green',
    bgHover: 'hover:border-green-500/60',
  },
];

const SPONSORS = [
  {
    name: 'Nebius Token Factory',
    role: 'Primary Inference',
    desc: 'Powers task decomposition (Qwen3 32B), baseline execution (DeepSeek R1 671B MoE), LLM-as-judge quality scoring (Llama 3.1 8B), and serves as the primary model provider for migration targets.',
    color: 'text-accent-cyan',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/5',
    dotColor: 'bg-accent-cyan',
    models: ['Llama 3.1 8B', 'Qwen3 32B', 'DeepSeek R1 671B'],
  },
  {
    name: 'OpenRouter',
    role: 'Secondary Models',
    desc: 'Provides additional open-source models for broader replay coverage. Every subtask is tested against OpenRouter models alongside Nebius models to find the cheapest option across providers.',
    color: 'text-accent-green',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/5',
    dotColor: 'bg-accent-green',
    models: ['GPT-OSS 20B', 'Qwen3 30B MoE'],
  },
  {
    name: 'Tavily',
    role: 'Agentic Search',
    desc: 'Handles "search" type subtasks with real web search results. When the decomposer identifies a research step, Tavily provides grounded search data instead of model hallucination.',
    color: 'text-accent-pink',
    borderColor: 'border-pink-500/30',
    bgColor: 'bg-pink-500/5',
    dotColor: 'bg-accent-pink',
    models: [],
  },
  {
    name: 'Toloka',
    role: 'Human Evaluation',
    desc: 'Optional human-in-the-loop quality validation. Crowdsourced expert workers score model outputs alongside the LLM-as-judge, calibrating AI evaluation against human judgment for high-stakes migration decisions.',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/5',
    dotColor: 'bg-blue-400',
    models: [],
  },
];

const MODEL_PRICING = [
  { name: 'Llama 3.1 8B', provider: 'Nebius', input: '$0.03', output: '$0.09', tier: 'small', color: 'text-accent-cyan', borderColor: 'border-cyan-500/20' },
  { name: 'Qwen3 32B', provider: 'Nebius', input: '$0.14', output: '$0.14', tier: 'mid', color: 'text-accent-purple', borderColor: 'border-purple-500/20' },
  { name: 'DeepSeek R1 671B', provider: 'Nebius', input: '$0.80', output: '$2.40', tier: 'large', color: 'text-accent-orange', borderColor: 'border-orange-500/20' },
  { name: 'GPT-OSS 20B', provider: 'OpenRouter', input: '$0.05', output: '$0.20', tier: 'small', color: 'text-accent-green', borderColor: 'border-green-500/20' },
  { name: 'Qwen3 30B MoE', provider: 'OpenRouter', input: '$0.10', output: '$0.30', tier: 'mid', color: 'text-accent-amber', borderColor: 'border-amber-500/20' },
];

const PROPRIETARY_PRICING = [
  { name: 'GPT-4o', input: '$2.50', output: '$10.00', color: 'text-red-400', borderColor: 'border-red-500/20' },
  { name: 'Claude 3.5 Sonnet', input: '$3.00', output: '$15.00', color: 'text-red-400', borderColor: 'border-red-500/20' },
  { name: 'GPT-4 Turbo', input: '$10.00', output: '$30.00', color: 'text-red-400', borderColor: 'border-red-500/20' },
  { name: 'Gemini 1.5 Pro', input: '$1.25', output: '$5.00', color: 'text-red-400', borderColor: 'border-red-500/20' },
];

export default function Architecture() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Pipeline Flow */}
      <div className="gradient-border p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 text-center">
          Pipeline Architecture
        </h3>

        {/* Horizontal pipeline */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-green-500/20 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
            {PIPELINE_STEPS.map((step, i) => (
              <div
                key={step.id}
                className={`relative bg-surface-900 border rounded-xl p-3 transition-all duration-300 cursor-pointer ${step.color} ${step.bgHover} ${
                  i === activeStep ? 'shadow-lg scale-[1.02]' : ''
                }`}
                onMouseEnter={() => setActiveStep(i)}
                style={i === activeStep ? { boxShadow: `0 0 20px ${step.color.includes('cyan') ? 'rgba(34,211,238,0.15)' : step.color.includes('orange') ? 'rgba(249,115,22,0.15)' : step.color.includes('pink') ? 'rgba(244,114,182,0.15)' : step.color.includes('purple') ? 'rgba(167,139,250,0.15)' : step.color.includes('blue') ? 'rgba(96,165,250,0.15)' : step.color.includes('green') ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)'}` } : {}}
              >
                {step.optional && (
                  <span className="absolute -top-2 -right-2 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    OPTIONAL
                  </span>
                )}
                <p className={`text-xs font-bold font-mono ${step.textColor} mb-1`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-600 leading-tight mb-1.5">{step.desc}</p>
                {step.model && (
                  <p className="text-[10px] font-mono text-gray-500">{step.model}</p>
                )}
                {step.sponsor && (
                  <span className={`inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-800 ${step.sponsorColor} border border-surface-700`}>
                    {step.sponsor}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsor Integrations */}
      <div className="gradient-border p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 text-center">
          Sponsor Integrations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPONSORS.map((s) => (
            <div key={s.name} className={`${s.bgColor} border ${s.borderColor} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                <span className={`text-sm font-bold ${s.color}`}>{s.name}</span>
                <span className="text-[10px] font-mono text-gray-600 bg-surface-800 px-1.5 py-0.5 rounded">
                  {s.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{s.desc}</p>
              {s.models.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {s.models.map((m) => (
                    <span key={m} className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-800 text-gray-400 border border-surface-700">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Model Pricing */}
      <div className="gradient-border p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1 text-center">
          Model Pricing Comparison
        </h3>
        <p className="text-[10px] text-gray-600 text-center mb-5">
          per 1M tokens — this is what SwitchCost optimizes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Open Source Models */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-green" />
              <span className="text-xs font-semibold text-accent-green uppercase tracking-wider">Open Source (Migration Targets)</span>
            </div>
            <div className="space-y-2">
              {MODEL_PRICING.map((m) => (
                <div key={m.name} className={`flex items-center justify-between bg-surface-900 border ${m.borderColor} rounded-lg px-3 py-2`}>
                  <div>
                    <span className={`text-xs font-bold font-mono ${m.color}`}>{m.name}</span>
                    <span className="text-[10px] text-gray-600 ml-2">{m.provider}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-gray-400">{m.input}</span>
                    <span className="text-[10px] text-gray-600 mx-1">/</span>
                    <span className="text-xs font-mono text-gray-400">{m.output}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proprietary Models */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Proprietary (Migrating From)</span>
            </div>
            <div className="space-y-2">
              {PROPRIETARY_PRICING.map((m) => (
                <div key={m.name} className={`flex items-center justify-between bg-surface-900 border ${m.borderColor} rounded-lg px-3 py-2`}>
                  <span className={`text-xs font-bold font-mono ${m.color}`}>{m.name}</span>
                  <div className="text-right">
                    <span className="text-xs font-mono text-red-400/70">{m.input}</span>
                    <span className="text-[10px] text-gray-600 mx-1">/</span>
                    <span className="text-xs font-mono text-red-400/70">{m.output}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
              10-100x more expensive than open alternatives
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
