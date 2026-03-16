import { useState, useRef, useEffect } from 'react';

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onEnd = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('loadedmetadata', onTime);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('loadedmetadata', onTime);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
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
    <div className="gradient-border p-4 glow-cyan">
      <audio ref={audioRef} src="/voiceover.mp3" preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={toggle}
          className={`audio-btn w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition ${
            playing
              ? 'bg-accent-cyan text-surface-900 playing'
              : 'bg-surface-800 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/10'
          }`}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="4" height="12" rx="1" />
              <rect x="8" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5v11l9-5.5z" />
            </svg>
          )}
        </button>

        {/* Info + Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Project Walkthrough</span>
              {playing && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                  <span className="text-[10px] text-accent-cyan font-mono">PLAYING</span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-600">
              {fmt(progress)} / {fmt(duration)}
            </span>
          </div>

          {/* Progress bar */}
          <div
            onClick={seek}
            className="w-full h-1.5 bg-surface-700 rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-accent-cyan rounded-full transition-all duration-100 relative"
              style={{ width: `${pct}%` }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent-cyan rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg shadow-accent-cyan/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
