import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CostChart({ plan }) {
  if (!plan || plan.length === 0) return null;

  const data = plan.map((rec) => ({
    type: rec.subtask_type,
    baseline: parseFloat((rec.baseline_cost_per_call * 1000).toFixed(4)),
    recommended: parseFloat((rec.recommended_cost_per_call * 1000).toFixed(4)),
    verdict: rec.verdict,
  }));

  return (
    <div className="gradient-border p-5">
      <h3 className="text-sm font-semibold text-accent-cyan mb-4 uppercase tracking-wider">
        Cost per Call (x1000)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#242434" />
          <XAxis dataKey="type" tick={{ fill: '#666', fontSize: 11 }} />
          <YAxis tick={{ fill: '#666', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#1a1a26', border: '1px solid #333', borderRadius: 8 }}
            labelStyle={{ color: '#aaa' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="baseline" name="Baseline (GPT-4 class)" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="recommended" name="Recommended" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
