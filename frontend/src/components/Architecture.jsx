import { useState, useEffect } from 'react';

const PIPELINE = [
  {
    id: 'input',
    label: 'User Task',
    sub: 'Complex agentic prompt',
    icon: '>>',
    color: 'text-white',
    borderColor: 'border-gray-600',
  },
  {
    id: 'decompose',
    label: 'Task Decomposer',
    sub: 'Qwen3 32B on Nebius',
    icon: '',
    color: 'text-accent-cyan',
    borderColor: 'border-cyan-500/40',
    api: 'Nebius Token Factory',
  },
  {
    id: 'baseline',
    label: 'Baseline Runner',
    sub: 'DeepSeek R1 671B MoE',
    icon: '',
    color: 'text-accent-orange',
    borderColor: 'border-orange-500/40',
    api: 'Nebius Token Factory',
  },
  {
    id: 'replay',
    label: 'Replay Engine',
    sub: '4 open models tested',
    icon: '',
    color: 'text-accent-purple',
    borderColor: 'border-purple-500/40',
    api: 'Nebius + OpenRouter',
  },
  {
    id: 'judge',
    label: 'Quality Judge',
    sub: 'LLM-as-judge (Llama 8B)',
    icon: '',
    color: 'text-accent-green',
    borderColor: 'border-green-500/40',
    api: 'Nebius Token Factory',
  },
  {
    id: 'plan',
    label: 'Migration Planner',
    sub: 'Cost-optimal routing',
    icon: '',
    color: 'text-accent-green',
    borderColor: 'border-green-500/40',
  },
];

const MODELS = [
  { name: 'Llama 3.1 8B', provider: 'Nebius', cost: '$0.03/M', tier: 'small', color: 'text-accent-cyan' },
  { name: 'Qwen3 32B', provider: 'Nebius', cost: '$0.14/M', tier: 'mid', color: 'text-accent-purple' },
  { name: 'DeepSeek R1', provider: 'Nebius', cost: '$0.80/M', tier: 'large', color: 'text-accent-orange' },
  { name: 'GPT-OSS 20B', provider: 'OpenRouter', cost: '$0.05/M', tier: 'small', color: 'text-accent-green' },
  { name: 'Qwen3 30B MoE', provider: 'OpenRouter', cost: '$0.10/M', tier: 'mid', color: 'text-accent-amber' },
];

export default function Architecture() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="gradient-border p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 text-center">
        Architecture
      </h3>

      {/* Pipeline Flow */}
      <div className="flex flex-col md:flex-row items-stretch gap-2 mb-8">
        {PIPELINE.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div
              className={`arch-node flex-1 ${i === activeStep ? 'active' : ''}`}
              onMouseEnter={() => setActiveStep(i)}
            >
              <p className={`text-xs font-bold font-mono ${step.color}`}>
                {step.label}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">{step.sub}</p>
              {step.api && (
                <span className="inline-block mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-900 text-gray-600 border border-surface-700">
                  {step.api}
                </span>
              )}
            </div>
            {i < PIPELINE.length - 1 && (
              <span className="text-gray-700 text-lg hidden md:block flex-shrink-0">&rarr;</span>
            )}
          </div>
        ))}
      </div>

      {/* Model Registry */}
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
          Model Registry
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {MODELS.map((m) => (
            <div key={m.name} className="bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-center">
              <p className={`text-xs font-bold font-mono ${m.color}`}>{m.name}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{m.provider}</p>
              <p className="text-xs font-mono text-gray-500 mt-1">{m.cost}</p>
            </div>
          ))}
        </div>
      </div>

      {/* APIs */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-cyan" />
          <span className="font-mono">Nebius Token Factory</span>
          <span className="text-gray-700">— primary inference</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-green" />
          <span className="font-mono">OpenRouter</span>
          <span className="text-gray-700">— secondary models</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-pink" />
          <span className="font-mono">Tavily</span>
          <span className="text-gray-700">— agentic search</span>
        </div>
      </div>
    </div>
  );
}
