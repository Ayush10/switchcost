import { useState, useEffect } from 'react';

const PROPRIETARY_MODELS = {
  'gpt-4o': 'GPT-4o',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'claude-3.5-sonnet': 'Claude 3.5 Sonnet',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
};

function formatCurrency(amount) {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(2)}`;
}

export default function SavingsPanel({ savings, dailyCalls, proprietaryModel, onUpdate }) {
  const [localCalls, setLocalCalls] = useState(dailyCalls);
  const [localModel, setLocalModel] = useState(proprietaryModel);

  // Debounce slider updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localCalls !== dailyCalls || localModel !== proprietaryModel) {
        onUpdate(localCalls, localModel);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localCalls, localModel]);

  // Logarithmic slider mapping
  const callStops = [100, 1000, 10000, 100000, 1000000];

  const sliderToValue = (slider) => {
    const idx = slider / 25;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper || upper >= callStops.length) {
      return callStops[Math.min(lower, callStops.length - 1)];
    }
    const frac = idx - lower;
    return Math.round(
      callStops[lower] * Math.pow(callStops[upper] / callStops[lower], frac)
    );
  };

  const valueToSlider = (value) => {
    for (let i = 0; i < callStops.length - 1; i++) {
      if (value <= callStops[i + 1]) {
        const frac = Math.log(value / callStops[i]) / Math.log(callStops[i + 1] / callStops[i]);
        return (i + frac) * 25;
      }
    }
    return 100;
  };

  return (
    <div className="gradient-border p-6 glow-cyan">
      <h3 className="text-sm font-semibold text-accent-cyan mb-5 uppercase tracking-wider">
        Projected Savings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Big savings number */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <p className="text-5xl md:text-6xl font-bold text-accent-green font-mono">
            {formatCurrency(savings.monthly_savings)}
          </p>
          <p className="text-sm text-gray-500 mt-1">saved per month</p>
          <p className="text-xs text-gray-600 mt-3 font-mono">
            {formatCurrency(savings.proprietary_monthly_cost)}/mo &rarr;{' '}
            {formatCurrency(savings.migrated_monthly_cost)}/mo
          </p>
          <div className="mt-2 px-3 py-1 bg-green-500/10 rounded-full">
            <span className="text-accent-green font-bold text-sm">
              {savings.savings_pct.toFixed(0)}% reduction
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="md:col-span-2 space-y-5">
          {/* Volume slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 uppercase">Daily API Calls</label>
              <span className="text-sm font-mono text-white font-bold">
                {localCalls.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={valueToSlider(localCalls)}
              onChange={(e) => setLocalCalls(sliderToValue(Number(e.target.value)))}
              className="w-full h-2 bg-surface-700 rounded-full appearance-none cursor-pointer accent-accent-cyan"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1 font-mono">
              <span>100</span>
              <span>1k</span>
              <span>10k</span>
              <span>100k</span>
              <span>1M</span>
            </div>
          </div>

          {/* Proprietary model dropdown */}
          <div>
            <label className="text-xs text-gray-500 uppercase mb-2 block">
              Migrating From
            </label>
            <select
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              className="w-full bg-surface-800 border border-surface-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
            >
              {Object.entries(PROPRIETARY_MODELS).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
