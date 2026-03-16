import { useState, useCallback, useRef } from 'react';
import TaskInput from './components/TaskInput';
import MigrationPlan from './components/MigrationPlan';
import SavingsPanel from './components/SavingsPanel';
import QualityMatrix from './components/QualityMatrix';
import CostChart from './components/CostChart';
import StepTimeline from './components/StepTimeline';
import Architecture from './components/Architecture';
import AudioPlayer from './components/AudioPlayer';
import { DEMO_ANALYSIS, DEMO_TASK, calculateDemoSavings } from './data/demo';
import {
  startAnalysis, getAnalysis, calculateSavings, getDemoTask,
} from './utils/api';

const HERO_STATS = [
  { value: '10-100x', label: 'cheaper inference' },
  { value: '>80%', label: 'quality maintained' },
  { value: '~60s', label: 'full analysis' },
];

const STEPS = [
  {
    num: '01',
    title: 'Capture & Decompose',
    desc: 'Your complex agentic task is broken into typed subtasks — classify, extract, summarize, reason, search, generate.',
    color: 'text-accent-cyan',
    glow: 'glow-cyan',
  },
  {
    num: '02',
    title: 'Replay & Profile',
    desc: 'Every subtask is replayed against all open models on Nebius Token Factory + OpenRouter. Quality scored by LLM-as-judge.',
    color: 'text-accent-purple',
    glow: 'glow-purple',
  },
  {
    num: '03',
    title: 'Plan & Save',
    desc: 'The cheapest model per subtask that maintains quality parity is recommended. See your projected monthly savings instantly.',
    color: 'text-accent-green',
    glow: 'glow-green',
  },
];

function App() {
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [savings, setSavings] = useState(null);
  const [dailyCalls, setDailyCalls] = useState(10000);
  const [proprietaryModel, setProprietaryModel] = useState('gpt-4o');
  const [isDemo, setIsDemo] = useState(false);
  const resultsRef = useRef(null);

  const pollAnalysis = useCallback(async (analysisId) => {
    const interval = setInterval(async () => {
      try {
        const result = await getAnalysis(analysisId);
        if (result.status === 'completed') {
          clearInterval(interval);
          setAnalysis(result);
          setStatus('done');
          setStatusMessage('Analysis complete');
          try {
            const savingsResult = await calculateSavings(dailyCalls, proprietaryModel);
            if (!savingsResult.error) setSavings(savingsResult);
          } catch (_) { /* ignore */ }
        } else if (result.status === 'error') {
          clearInterval(interval);
          setStatus('idle');
          setStatusMessage(`Error: ${result.error}`);
        } else {
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
    setIsDemo(false);

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
    if (isDemo) {
      setSavings(calculateDemoSavings(calls, model));
      return;
    }
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
      setTask(DEMO_TASK);
    }
  };

  const handleRunDemo = () => {
    setIsDemo(true);
    setTask(DEMO_TASK);
    setStatus('done');
    setStatusMessage('Demo analysis complete');
    setAnalysis(DEMO_ANALYSIS);
    setSavings(calculateDemoSavings(dailyCalls, proprietaryModel));
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const showResults = analysis || status === 'running';

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Hero Section */}
      {!showResults && (
        <section className="relative overflow-hidden">
          <div className="hero-grid" />
          <div className="max-w-5xl mx-auto px-4 md:px-6 pt-16 pb-12 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-xs font-mono text-accent-cyan">Nebius Build SF 2026</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                <span className="text-accent-cyan">Switch</span>
                <span className="text-white">Cost</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-3">
                Stop overpaying for AI inference. See exactly what you save by migrating to open models.
              </p>
              <p className="text-sm text-gray-600 max-w-xl mx-auto mb-8">
                Paste any complex agentic task. We decompose it, replay every subtask against
                Nebius Token Factory + OpenRouter models, score quality, and show you the cheapest
                option that maintains parity.
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 md:gap-12 mb-10">
                {HERO_STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold font-mono text-white">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRunDemo}
                  className="px-8 py-3 text-sm font-bold rounded-lg bg-accent-cyan text-surface-900 hover:bg-accent-cyan/90 transition shadow-lg shadow-accent-cyan/20"
                >
                  Run Demo Analysis
                </button>
                <a
                  href="#try-it"
                  className="px-6 py-3 text-sm font-semibold rounded-lg border border-surface-600 text-gray-400 hover:text-white hover:border-surface-500 transition"
                >
                  Try Your Own Task
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Audio Player + How It Works */}
      {!showResults && (
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-10">
          {/* Audio walkthrough */}
          <AudioPlayer />

          {/* How It Works */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STEPS.map((step) => (
                <div key={step.num} className={`gradient-border p-5 ${step.glow}`}>
                  <span className={`text-3xl font-bold font-mono ${step.color} opacity-30`}>
                    {step.num}
                  </span>
                  <h3 className={`text-base font-bold ${step.color} mt-2 mb-2`}>{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture */}
          <Architecture />
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
        {/* Compact header when results are showing */}
        {showResults && (
          <header className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-accent-cyan">Switch</span>
                <span className="text-white">Cost</span>
              </h1>
              {isDemo && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                  DEMO
                </span>
              )}
            </div>
            <button
              onClick={() => { setStatus('idle'); setAnalysis(null); setSavings(null); setIsDemo(false); }}
              className="text-xs text-gray-500 hover:text-white transition"
            >
              &larr; New Analysis
            </button>
          </header>
        )}

        {/* Task Input */}
        <div id="try-it">
          <TaskInput
            task={task}
            setTask={setTask}
            onRun={handleAnalyze}
            onDemo={handleRunDemo}
            status={status}
            statusMessage={statusMessage}
            showDemoButton={!showResults}
          />
        </div>

        {/* Results */}
        {showResults && (
          <div ref={resultsRef} className="mt-6 space-y-6 animate-slide-in">
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

        {/* Tech Stack */}
        <footer className="mt-16 pt-6 border-t border-surface-700">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            {['Nebius Token Factory', 'OpenRouter', 'Tavily', 'FastAPI', 'React', 'LLM-as-Judge'].map((t) => (
              <span key={t} className="text-xs font-mono px-3 py-1.5 rounded-full bg-surface-800 text-gray-500 border border-surface-700">
                {t}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600">
            Built for Nebius Build SF 2026
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
