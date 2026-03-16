// Pre-computed demo data so judges can see the full experience without API keys

export const DEMO_TASK =
  'Research the top 5 AI cloud infrastructure companies (Nebius, CoreWeave, Lambda, ' +
  'Together AI, Fireworks AI). For each company, find their latest funding round, ' +
  'GPU offerings, and pricing strategy. Compare their approaches to inference ' +
  'optimization. Then write a 500-word investment analysis recommending which ' +
  'company has the strongest competitive moat and why.';

export const DEMO_ANALYSIS = {
  analysis_id: 'demo-analysis',
  task: DEMO_TASK,
  status: 'completed',
  migration_plan: [
    {
      subtask_type: 'classify',
      verdict: 'MIGRATE',
      baseline_display_name: 'DeepSeek R1',
      recommended_display_name: 'Llama 3.1 8B',
      recommended_model_key: 'nebius-small',
      baseline_cost_per_call: 0.00184,
      recommended_cost_per_call: 0.000054,
      cost_reduction_pct: 97.1,
      quality_parity_score: 94,
      call_count: 2,
    },
    {
      subtask_type: 'extract',
      verdict: 'MIGRATE',
      baseline_display_name: 'DeepSeek R1',
      recommended_display_name: 'Qwen3 32B',
      recommended_model_key: 'nebius-mid',
      baseline_cost_per_call: 0.00296,
      recommended_cost_per_call: 0.000182,
      cost_reduction_pct: 93.9,
      quality_parity_score: 91,
      call_count: 5,
    },
    {
      subtask_type: 'summarize',
      verdict: 'MIGRATE',
      baseline_display_name: 'DeepSeek R1',
      recommended_display_name: 'Qwen3 30B MoE',
      recommended_model_key: 'openrouter-mid',
      baseline_cost_per_call: 0.00352,
      recommended_cost_per_call: 0.000290,
      cost_reduction_pct: 91.8,
      quality_parity_score: 88,
      call_count: 5,
    },
    {
      subtask_type: 'reason',
      verdict: 'MIGRATE',
      baseline_display_name: 'DeepSeek R1',
      recommended_display_name: 'Qwen3 32B',
      recommended_model_key: 'nebius-mid',
      baseline_cost_per_call: 0.00480,
      recommended_cost_per_call: 0.000224,
      cost_reduction_pct: 95.3,
      quality_parity_score: 85,
      call_count: 3,
    },
    {
      subtask_type: 'generate',
      verdict: 'MIGRATE',
      baseline_display_name: 'DeepSeek R1',
      recommended_display_name: 'Qwen3 32B',
      recommended_model_key: 'nebius-mid',
      baseline_cost_per_call: 0.00544,
      recommended_cost_per_call: 0.000252,
      cost_reduction_pct: 95.4,
      quality_parity_score: 86,
      call_count: 1,
    },
    {
      subtask_type: 'search',
      verdict: 'KEEP',
      baseline_display_name: 'Tavily Search',
      recommended_display_name: 'Tavily Search',
      recommended_model_key: 'tavily',
      baseline_cost_per_call: 0.001,
      recommended_cost_per_call: 0.001,
      cost_reduction_pct: 0,
      quality_parity_score: 100,
      call_count: 3,
    },
  ],
  quality_matrix: {
    classify: {
      'nebius-small': 94,
      'nebius-mid': 97,
      'openrouter-small': 91,
      'openrouter-mid': 93,
    },
    extract: {
      'nebius-small': 72,
      'nebius-mid': 91,
      'openrouter-small': 78,
      'openrouter-mid': 86,
    },
    summarize: {
      'nebius-small': 68,
      'nebius-mid': 85,
      'openrouter-small': 74,
      'openrouter-mid': 88,
    },
    reason: {
      'nebius-small': 58,
      'nebius-mid': 85,
      'openrouter-small': 62,
      'openrouter-mid': 82,
    },
    generate: {
      'nebius-small': 61,
      'nebius-mid': 86,
      'openrouter-small': 65,
      'openrouter-mid': 83,
    },
  },
  baseline: {
    metrics: [
      {
        step_id: 1,
        subtask_type: 'classify',
        model_key: 'nebius-large',
        estimated_cost: 0.00184,
        latency_ms: 1240,
        input_tokens: 320,
        output_tokens: 580,
        output_preview: 'Classified companies into tiers: Tier 1 (hyperscale infrastructure): Nebius, CoreWeave. Tier 2 (inference optimization): Together AI, Fireworks AI. Tier 3 (GPU cloud): Lambda.',
      },
      {
        step_id: 2,
        subtask_type: 'search',
        model_key: 'tavily',
        estimated_cost: 0.001,
        latency_ms: 890,
        input_tokens: 0,
        output_tokens: 0,
        output_preview: 'Found 15 relevant sources across funding announcements, GPU availability reports, and pricing pages for all 5 companies.',
      },
      {
        step_id: 3,
        subtask_type: 'extract',
        model_key: 'nebius-large',
        estimated_cost: 0.00296,
        latency_ms: 2180,
        input_tokens: 1850,
        output_tokens: 920,
        output_preview: 'Nebius: $1.5B Series A (2024), H100/H200 clusters. CoreWeave: $12.7B raised total, 100k+ GPUs. Lambda: $800M Series C, On-Demand cloud...',
      },
      {
        step_id: 4,
        subtask_type: 'extract',
        model_key: 'nebius-large',
        estimated_cost: 0.00296,
        latency_ms: 1950,
        input_tokens: 1720,
        output_tokens: 880,
        output_preview: 'Together AI: $228.5M raised, serverless inference. Fireworks AI: $220M total, function-calling optimized. GPU offerings comparison extracted...',
      },
      {
        step_id: 5,
        subtask_type: 'summarize',
        model_key: 'nebius-large',
        estimated_cost: 0.00352,
        latency_ms: 2450,
        input_tokens: 2100,
        output_tokens: 1100,
        output_preview: 'Key findings: Infrastructure moat strongest at Nebius (vertical integration) and CoreWeave (GPU fleet scale). Inference optimization approaches differ...',
      },
      {
        step_id: 6,
        subtask_type: 'reason',
        model_key: 'nebius-large',
        estimated_cost: 0.00480,
        latency_ms: 3200,
        input_tokens: 2800,
        output_tokens: 1400,
        output_preview: 'Competitive analysis: Nebius has strongest moat due to vertical stack (custom hardware + Token Factory platform). CoreWeave leads on raw GPU capacity...',
      },
      {
        step_id: 7,
        subtask_type: 'generate',
        model_key: 'nebius-large',
        estimated_cost: 0.00544,
        latency_ms: 4100,
        input_tokens: 3200,
        output_tokens: 1800,
        output_preview: 'INVESTMENT ANALYSIS: The AI infrastructure market is projected to reach $500B by 2030. Among the five companies analyzed, Nebius presents the strongest...',
      },
    ],
  },
  replays: [
    // classify replays
    { subtask_id: 1, model_key: 'nebius-small', display_name: 'Llama 3.1 8B', quality_score: 94, estimated_cost: 0.000054, latency_ms: 180 },
    { subtask_id: 1, model_key: 'nebius-mid', display_name: 'Qwen3 32B', quality_score: 97, estimated_cost: 0.000126, latency_ms: 420 },
    { subtask_id: 1, model_key: 'openrouter-small', display_name: 'GPT-OSS 20B', quality_score: 91, estimated_cost: 0.000132, latency_ms: 350 },
    { subtask_id: 1, model_key: 'openrouter-mid', display_name: 'Qwen3 30B MoE', quality_score: 93, estimated_cost: 0.000206, latency_ms: 480 },
    // extract replays (step 3)
    { subtask_id: 3, model_key: 'nebius-small', display_name: 'Llama 3.1 8B', quality_score: 72, estimated_cost: 0.000139, latency_ms: 290 },
    { subtask_id: 3, model_key: 'nebius-mid', display_name: 'Qwen3 32B', quality_score: 91, estimated_cost: 0.000182, latency_ms: 680 },
    { subtask_id: 3, model_key: 'openrouter-small', display_name: 'GPT-OSS 20B', quality_score: 78, estimated_cost: 0.000275, latency_ms: 520 },
    { subtask_id: 3, model_key: 'openrouter-mid', display_name: 'Qwen3 30B MoE', quality_score: 86, estimated_cost: 0.000314, latency_ms: 750 },
    // extract replays (step 4)
    { subtask_id: 4, model_key: 'nebius-small', display_name: 'Llama 3.1 8B', quality_score: 70, estimated_cost: 0.000130, latency_ms: 270 },
    { subtask_id: 4, model_key: 'nebius-mid', display_name: 'Qwen3 32B', quality_score: 89, estimated_cost: 0.000170, latency_ms: 650 },
    { subtask_id: 4, model_key: 'openrouter-small', display_name: 'GPT-OSS 20B', quality_score: 76, estimated_cost: 0.000260, latency_ms: 490 },
    { subtask_id: 4, model_key: 'openrouter-mid', display_name: 'Qwen3 30B MoE', quality_score: 84, estimated_cost: 0.000300, latency_ms: 720 },
    // summarize replays
    { subtask_id: 5, model_key: 'nebius-small', display_name: 'Llama 3.1 8B', quality_score: 68, estimated_cost: 0.000096, latency_ms: 340 },
    { subtask_id: 5, model_key: 'nebius-mid', display_name: 'Qwen3 32B', quality_score: 85, estimated_cost: 0.000168, latency_ms: 780 },
    { subtask_id: 5, model_key: 'openrouter-small', display_name: 'GPT-OSS 20B', quality_score: 74, estimated_cost: 0.000230, latency_ms: 580 },
    { subtask_id: 5, model_key: 'openrouter-mid', display_name: 'Qwen3 30B MoE', quality_score: 88, estimated_cost: 0.000290, latency_ms: 820 },
    // reason replays
    { subtask_id: 6, model_key: 'nebius-small', display_name: 'Llama 3.1 8B', quality_score: 58, estimated_cost: 0.000108, latency_ms: 410 },
    { subtask_id: 6, model_key: 'nebius-mid', display_name: 'Qwen3 32B', quality_score: 85, estimated_cost: 0.000224, latency_ms: 920 },
    { subtask_id: 6, model_key: 'openrouter-small', display_name: 'GPT-OSS 20B', quality_score: 62, estimated_cost: 0.000310, latency_ms: 700 },
    { subtask_id: 6, model_key: 'openrouter-mid', display_name: 'Qwen3 30B MoE', quality_score: 82, estimated_cost: 0.000380, latency_ms: 960 },
    // generate replays
    { subtask_id: 7, model_key: 'nebius-small', display_name: 'Llama 3.1 8B', quality_score: 61, estimated_cost: 0.000117, latency_ms: 520 },
    { subtask_id: 7, model_key: 'nebius-mid', display_name: 'Qwen3 32B', quality_score: 86, estimated_cost: 0.000252, latency_ms: 1100 },
    { subtask_id: 7, model_key: 'openrouter-small', display_name: 'GPT-OSS 20B', quality_score: 65, estimated_cost: 0.000360, latency_ms: 850 },
    { subtask_id: 7, model_key: 'openrouter-mid', display_name: 'Qwen3 30B MoE', quality_score: 83, estimated_cost: 0.000420, latency_ms: 1050 },
  ],
};

// Proprietary model pricing for client-side savings calculation
export const PROPRIETARY_PRICING = {
  'gpt-4o': { input: 2.50, output: 10.00, name: 'GPT-4o' },
  'gpt-4-turbo': { input: 10.00, output: 30.00, name: 'GPT-4 Turbo' },
  'claude-3.5-sonnet': { input: 3.00, output: 15.00, name: 'Claude 3.5 Sonnet' },
  'gemini-1.5-pro': { input: 1.25, output: 5.00, name: 'Gemini 1.5 Pro' },
};

// Average tokens per call from demo baseline
const AVG_INPUT_TOKENS = 1713;
const AVG_OUTPUT_TOKENS = 954;

export function calculateDemoSavings(dailyCalls, proprietaryModel) {
  const pricing = PROPRIETARY_PRICING[proprietaryModel] || PROPRIETARY_PRICING['gpt-4o'];

  // Proprietary cost per call
  const proprietaryCostPerCall =
    (AVG_INPUT_TOKENS * pricing.input + AVG_OUTPUT_TOKENS * pricing.output) / 1_000_000;

  // Migrated cost: weighted average from migration plan
  const plan = DEMO_ANALYSIS.migration_plan;
  const totalWeight = plan.reduce((acc, r) => acc + r.call_count, 0);
  const migratedCostPerCall =
    plan.reduce((acc, r) => acc + r.recommended_cost_per_call * r.call_count, 0) / totalWeight;

  const monthlyCalls = dailyCalls * 30;
  const proprietaryMonthly = monthlyCalls * proprietaryCostPerCall;
  const migratedMonthly = monthlyCalls * migratedCostPerCall;
  const monthlySavings = proprietaryMonthly - migratedMonthly;
  const savingsPct = proprietaryMonthly > 0 ? (monthlySavings / proprietaryMonthly) * 100 : 0;

  return {
    monthly_savings: monthlySavings,
    proprietary_monthly_cost: proprietaryMonthly,
    migrated_monthly_cost: migratedMonthly,
    savings_pct: savingsPct,
  };
}
