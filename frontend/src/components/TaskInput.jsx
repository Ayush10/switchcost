export default function TaskInput({ task, setTask, onRun, status, statusMessage }) {
  const isDisabled = status === 'running';

  return (
    <div className="gradient-border p-5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
        Agentic Task
      </label>
      <textarea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter a complex multi-step task to analyze... e.g. Research the top AI cloud companies and write an investment analysis."
        rows={3}
        className="w-full bg-surface-900 border border-surface-600 rounded-lg p-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-accent-cyan/50 transition font-sans"
      />
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-600">
          {statusMessage && (
            <span className={status === 'done' ? 'text-accent-green' : 'text-accent-amber'}>
              {statusMessage}
            </span>
          )}
        </div>
        <button
          onClick={() => onRun(task)}
          disabled={isDisabled || !task.trim()}
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent-cyan text-surface-900 hover:bg-accent-cyan/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'running' ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Analyze Migration'
          )}
        </button>
      </div>
    </div>
  );
}
