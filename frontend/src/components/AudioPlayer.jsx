import { useState, useRef, useEffect } from 'react';

const TOUR_SECTIONS = [
  { time: 0, label: 'Welcome', highlight: 'hero' },
  { time: 8, label: 'The Problem', highlight: 'hero' },
  { time: 18, label: 'How It Works', highlight: 'how-it-works' },
  { time: 30, label: 'Sponsor: Nebius', highlight: 'architecture' },
  { time: 43, label: 'Sponsor: OpenRouter', highlight: 'architecture' },
  { time: 50, label: 'Quality Scoring', highlight: 'architecture' },
  { time: 58, label: 'Sponsor: Tavily', highlight: 'architecture' },
  { time: 63, label: 'Sponsor: Toloka', highlight: 'architecture' },
  { time: 73, label: 'Try the Demo', highlight: 'try-it' },
];

export default function AudioPlayer({ onRequestDemo }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
      // Update current section based on timestamp
      for (let i = TOUR_SECTIONS.length - 1; i >= 0; i--) {
        if (audio.currentTime >= TOUR_SECTIONS[i].time) {
          setCurrentSection(i);
          break;
        }
      }
    };
    const onEnd = () => {
      setPlaying(false);
      setShowOverlay(false);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('loadedmetadata', onTime);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('loadedmetadata', onTime);
    };
  }, []);

  // Auto-scroll to highlighted section
  useEffect(() => {
    if (!playing) return;
    const section = TOUR_SECTIONS[currentSection];
    if (section?.highlight) {
      const el = document.getElementById(section.highlight);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSection, playing]);

  const startTour = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setShowOverlay(false);
    try {
      audio.currentTime = 0;
      await audio.play();
      setPlaying(true);
    } catch (err) {
      console.error('Audio play failed:', err);
      // Still dismiss overlay, show the player so user can retry
      setPlaying(false);
    }
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch (err) {
        console.error('Audio play failed:', err);
      }
    }
  };

  const dismiss = () => {
    const audio = audioRef.current;
    if (audio && playing) audio.pause();
    setPlaying(false);
    setShowOverlay(false);
    setDismissed(true);
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src="/voiceover.mp3" preload="auto" />

      {/* Welcome overlay - shows on first load */}
      {showOverlay && !dismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/90 backdrop-blur-sm animate-fade-in">
          <div className="relative z-[51] bg-surface-800 border border-surface-600 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl shadow-accent-cyan/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-cyan">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to SwitchCost</h2>
            <p className="text-sm text-gray-400 mb-6">
              Take a guided audio tour of the platform — learn how we help AI teams cut inference costs by 10-100x using open-source models.
            </p>
            <div className="relative z-[52] flex flex-col gap-2">
              <button
                onClick={startTour}
                className="relative z-[53] w-full px-6 py-3 text-sm font-bold rounded-lg bg-accent-cyan text-surface-900 hover:bg-accent-cyan/90 transition shadow-lg shadow-accent-cyan/20 cursor-pointer"
              >
                Start Guided Tour
              </button>
              <button
                onClick={dismiss}
                className="relative z-[53] w-full px-6 py-2.5 text-sm rounded-lg text-gray-500 hover:text-white transition cursor-pointer"
              >
                Skip, I'll explore on my own
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating player bar - appears when playing or after dismissing overlay */}
      {!showOverlay && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
          <div className="bg-surface-800/95 backdrop-blur-md border border-surface-600 rounded-xl p-3 shadow-2xl">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={toggle}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                  playing
                    ? 'bg-accent-cyan text-surface-900'
                    : 'bg-surface-700 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/10'
                }`}
              >
                {playing ? (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="2" y="1" width="4" height="12" rx="1" />
                    <rect x="8" y="1" width="4" height="12" rx="1" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M3 1.5v11l9-5.5z" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-white truncate">
                      {playing ? TOUR_SECTIONS[currentSection]?.label || 'Playing...' : 'Project Walkthrough'}
                    </span>
                    {playing && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-gray-600 flex-shrink-0 ml-2">
                    {fmt(progress)} / {fmt(duration)}
                  </span>
                </div>
                <div onClick={seek} className="w-full h-1 bg-surface-700 rounded-full cursor-pointer group">
                  <div
                    className="h-full bg-accent-cyan rounded-full transition-all duration-100"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Close */}
              <button
                onClick={dismiss}
                className="text-gray-600 hover:text-gray-400 transition flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
