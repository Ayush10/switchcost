import { useState, useCallback } from 'react';
import TaskInput from './components/TaskInput';
import MigrationPlan from './components/MigrationPlan';
import SavingsPanel from './components/SavingsPanel';
import QualityMatrix from './components/QualityMatrix';
import CostChart from './components/CostChart';
import StepTimeline from './components/StepTimeline';
import {
  startAnalysis, getAnalysis, calculateSavings, getDemoTask,
} from './utils/api';

function App() {
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [savings, setSavings] = useState(null);
  const [dailyCalls, setDailyCalls] = useState(10000);
  const [proprietaryModel, setProprietaryModel] = useState('gpt-4o');

  const pollAnalysis = useCallback(async (analysisId) => {
    const interval = setInterval(async () => {
      try {
        const result = await getAnalysis(analysisId);
        if (result.status === 'completed') {
          clearInterval(interval);
          setAnalysis(result);
          setStatus('done');
          setStatusMessage('Analysis complete');
          // Calculate initial savings
          try {
            const savingsResult = await calculateSavings(dailyCalls, proprietaryModel);
            if (!savingsResult.error) setSavings(savingsResult);
          } catch (_) { /* ignore */ }
        } else if (result.status === 'error') {
          clearInterval(interval);
          setStatus('idle');
          setStatusMessage(`Error: ${result.error}`);
        } else {
          // Update progress message
          const progress = result.progress || [];
          const lastStatus = progress.filter(p => p.event === 'status').pop();
          if (lastStatus) {
            setStatusMessage(lastStatus.message);
          }
        }
      } catch (e) {
        // keep polling
      }
    }, 2000);
    return interval;
  }, [dailyCalls, proprietaryModel]);

  const handleAnalyze = async (taskText) => {
    setStatus('running');
    setStatusMessage('Starting migration analysis...');
    setAnalysis(null);
    setSavings(null);

    try {
      const result = await startAnalysis(taskText);
      pollAnalysis(result.analysis_id);
    } catch (e) {
      setStatus('idle');
      setStatusMessage(`Error: ${e.message}`);
    }
  };

  const handleSavingsUpdate = async (calls, model) => {
    setDailyCalls(calls);
    setProprietaryModel(model);
    if (analysis?.status === 'completed') {
      try {
        const result = await calculateSavings(calls, model);
        if (!result.error) setSavings(result);
      } catch (_) { /* ignore */ }
    }
  };

  const handleLoadDemo = async () => {
    try {
      const demo = await getDemoTask();
      setTask(demo.task);
    } catch (e) {
      setTask(
        'Research the top 5 AI cloud infrastructure companies. Compare their GPU offerings, ' +
        'pricing strategies, and recent partnerships. Write an investment analysis with recommendations.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-accent-cyan">Switch</span>
            <span className="text-white">Cost</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            Migrate from proprietary to open models. See exactly what you save.
          </p>
        </div>
        <button
          onClick={handleLoadDemo}
          className="px-4 py-2 text-sm rounded-lg bg-surface-700 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/10 transition"
        >
          Load Demo Task
        </button>
      </header>

      {/* Task Input */}
      <TaskInput
        task={task}
        setTask={setTask}
        onRun={handleAnalyze}
        status={status}
        statusMessage={statusMessage}
      />

      {/* Results */}
      {(analysis || status === 'running') && (
        <div className="mt-6 space-y-6 animate-slide-in">
          {/* Migration Plan (HERO) */}
          {analysis?.migration_plan && (
            <MigrationPlan plan={analysis.migration_plan} />
          )}

          {/* Savings Calculator */}
          {analysis?.migration_plan && savings && (
            <SavingsPanel
              savings={savings}
              dailyCalls={dailyCalls}
              proprietaryModel={proprietaryModel}
              onUpdate={handleSavingsUpdate}
            />
          )}

          {/* Quality Matrix + Cost Chart */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QualityMatrix matrix={analysis.quality_matrix} />
              <CostChart plan={analysis.migration_plan} />
            </div>
          )}

          {/* Replay Timeline */}
          {analysis?.replays && (
            <StepTimeline
              baselineSteps={analysis.baseline?.metrics || []}
              replays={analysis.replays}
            />
          )}

          {/* Loading state */}
          {status === 'running' && !analysis && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">{statusMessage}</p>
              <p className="text-gray-600 text-xs mt-1">
                Analyzing your workload against open models...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-surface-700 text-center text-xs text-gray-600">
        Built with Nebius Token Factory / OpenRouter / Tavily
        <br />
        Nebius Build SF 2026
      </footer>
    </div>
  );
}

export default App;
