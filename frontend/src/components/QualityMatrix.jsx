export default function QualityMatrix({ matrix }) {
  if (!matrix || Object.keys(matrix).length === 0) return null;

  const subtaskTypes = Object.keys(matrix);
  const allModels = new Set();
  for (const st of subtaskTypes) {
    for (const mk of Object.keys(matrix[st])) {
      allModels.add(mk);
    }
  }
  const models = Array.from(allModels).sort();

  function getCellColor(score) {
    if (score >= 95) return 'bg-green-500';
    if (score >= 85) return 'bg-green-400';
    if (score >= 80) return 'bg-yellow-500';
    if (score >= 70) return 'bg-amber-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // Short display names for table headers
  const shortNames = {
    'nebius-small': 'Llama 8B',
    'nebius-mid': 'Qwen 32B',
    'nebius-large': 'DS R1',
    'openrouter-small': 'GPT-OSS',
    'openrouter-mid': 'Qwen 30B',
  };

  return (
    <div className="gradient-border p-5">
      <h3 className="text-sm font-semibold text-accent-purple mb-4 uppercase tracking-wider">
        Quality Matrix (vs Baseline)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-gray-600 p-2 font-mono">Type</th>
              {models.map((m) => (
                <th key={m} className="text-center text-gray-600 p-2 font-mono whitespace-nowrap">
                  {shortNames[m] || m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subtaskTypes.map((st) => (
              <tr key={st} className="border-t border-surface-700">
                <td className="text-gray-400 p-2 font-mono font-semibold">{st}</td>
                {models.map((m) => {
                  const score = matrix[st]?.[m];
                  if (score === undefined) {
                    return (
                      <td key={m} className="text-center p-2 text-gray-700">
                        -
                      </td>
                    );
                  }
                  return (
                    <td key={m} className="text-center p-1">
                      <span
                        className={`inline-block px-2 py-1 rounded ${getCellColor(score)} text-white font-bold font-mono min-w-[3rem]`}
                      >
                        {score}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500" /> 95+
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-400" /> 85-94
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-500" /> 80-84
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-500" /> 70-79
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500" /> &lt;60
        </span>
      </div>
    </div>
  );
}
