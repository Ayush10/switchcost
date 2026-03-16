const TASK_CATEGORIES = [
  {
    type: 'classify',
    label: 'Classification & Routing',
    bestModel: 'Llama 3.1 8B',
    bestProvider: 'Nebius',
    cost: '$0.03/M',
    color: 'text-accent-cyan',
    examples: [
      'Intent classification for chatbots',
      'Ticket routing and prioritization',
      'Content moderation and filtering',
      'Sentiment analysis on reviews',
      'Document type categorization',
    ],
    verdict: 'MIGRATE',
    note: 'Classification is the easiest task to migrate. Small models match proprietary accuracy at 80x lower cost.',
  },
  {
    type: 'extract',
    label: 'Data Extraction & Parsing',
    bestModel: 'Qwen3 32B',
    bestProvider: 'Nebius',
    cost: '$0.14/M',
    color: 'text-accent-purple',
    examples: [
      'Structured data extraction from PDFs',
      'Entity recognition from unstructured text',
      'Resume parsing and field mapping',
      'Invoice and receipt data extraction',
      'API response normalization',
    ],
    verdict: 'MIGRATE',
    note: 'Mid-tier models handle extraction well. Qwen3 32B maintains 91% quality parity on structured tasks.',
  },
  {
    type: 'summarize',
    label: 'Summarization & Synthesis',
    bestModel: 'Qwen3 30B MoE',
    bestProvider: 'OpenRouter',
    cost: '$0.10/M',
    color: 'text-accent-amber',
    examples: [
      'Meeting transcript summarization',
      'Research paper abstracts',
      'News article condensation',
      'Multi-document synthesis',
      'Customer conversation summaries',
    ],
    verdict: 'MIGRATE',
    note: 'MoE architecture excels at summarization — the sparse activation pattern captures key details efficiently.',
  },
  {
    type: 'reason',
    label: 'Analysis & Reasoning',
    bestModel: 'Qwen3 32B',
    bestProvider: 'Nebius',
    cost: '$0.14/M',
    color: 'text-accent-green',
    examples: [
      'Comparative analysis and trade-offs',
      'Root cause analysis from logs',
      'Financial modeling and projections',
      'Legal clause interpretation',
      'Strategic recommendation generation',
    ],
    verdict: 'MIGRATE',
    note: 'Complex reasoning requires mid-tier models minimum. Quality drops below threshold with 8B models, but 32B maintains 85% parity.',
  },
  {
    type: 'generate',
    label: 'Content Generation',
    bestModel: 'Qwen3 32B',
    bestProvider: 'Nebius',
    cost: '$0.14/M',
    color: 'text-accent-purple',
    examples: [
      'Blog posts and marketing copy',
      'Email drafts and responses',
      'Code generation and documentation',
      'Product descriptions',
      'Report writing from structured data',
    ],
    verdict: 'MIGRATE',
    note: 'Generation quality depends heavily on task complexity. Simple generation migrates easily; creative/nuanced writing may need case-by-case evaluation.',
  },
  {
    type: 'search',
    label: 'Web Search & Retrieval',
    bestModel: 'Tavily API',
    bestProvider: 'Tavily',
    cost: '$0.001/call',
    color: 'text-accent-pink',
    examples: [
      'Real-time market research',
      'Fact verification and grounding',
      'Competitive intelligence gathering',
      'News monitoring and alerts',
      'Knowledge base augmentation (RAG)',
    ],
    verdict: 'KEEP',
    note: 'Search is not an LLM task — it requires a dedicated search API. Tavily provides grounded web results that prevent hallucination in agentic workflows.',
  },
];

export default function FutureTaskCoverage() {
  return (
    <div className="gradient-border p-6">
      <h3 className="text-sm font-semibold text-accent-cyan uppercase tracking-wider mb-1">
        Future Task Coverage
      </h3>
      <p className="text-xs text-gray-600 mb-5">
        What other tasks these models can handle — organized by subtask type
      </p>

      <div className="space-y-3">
        {TASK_CATEGORIES.map((cat) => (
          <div key={cat.type} className="bg-surface-900 border border-surface-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono uppercase ${cat.color}`}>
                  {cat.label}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                  cat.verdict === 'MIGRATE'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {cat.verdict}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                <span className={cat.color}>{cat.bestModel}</span>
                <span className="text-gray-700">|</span>
                <span>{cat.bestProvider}</span>
                <span className="text-gray-700">|</span>
                <span>{cat.cost}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {cat.examples.map((ex) => (
                <span key={ex} className="text-[10px] px-2 py-1 rounded-lg bg-surface-800 text-gray-400 border border-surface-700">
                  {ex}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              {cat.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
