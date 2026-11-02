import React, { useState, useEffect, useRef } from 'react';
import { VisualizationSequence } from '../types';

interface FramePlayerProps {
  sequence: VisualizationSequence;
}

export const FramePlayer: React.FC<FramePlayerProps> = ({ sequence }) => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [delay, setDelay] = useState(1500);
  const timerRef = useRef<number | null>(null);

  const frames = sequence.frames;
  const currentFrame = frames[index] || frames[0];

  useEffect(() => {
    // Reset index when sequence changes
    setIndex(0);
    setIsPlaying(false);
  }, [sequence]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setIndex((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, delay, frames.length]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (index >= frames.length - 1) {
        setIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleStep = (direction: number) => {
    setIsPlaying(false);
    setIndex((prev) => Math.max(0, Math.min(frames.length - 1, prev + direction)));
  };

  const speedOptions = [
    { label: '0,5× · πιο αργά', value: 3000 },
    { label: '0,75× · αργά', value: 2000 },
    { label: '1× · κανονικά', value: 1500 },
    { label: '1,5× · γρήγορα', value: 1000 },
    { label: '2× · πιο γρήγορα', value: 750 },
    { label: '3× · πολύ γρήγορα', value: 500 },
  ];

  if (!frames || frames.length === 0) return null;

  return (
    <section className="frame-player" aria-label="Αναπαραγωγή περιγραφών καρέ">
      <h4 className="font-semibold text-lg text-white">Αναπαραγωγή περιγραφών καρέ</h4>
      <p className="frame-player-counter font-bold text-sky-200">
        Καρέ {index + 1} από {frames.length} · {currentFrame.label}
      </p>

      <progress
        className="w-full h-3 my-3 rounded"
        max={frames.length}
        value={index + 1}
        aria-label="Πρόοδος αναπαραγωγής καρέ"
      />

      <div className="flex items-center gap-2 mb-2">
        {index === 0 && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-900/80 border border-blue-500 text-blue-200">
            🎯 Αρχική θέση επανάληψης
          </span>
        )}
        {index > 0 && index < frames.length - 1 && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-950/80 border border-sky-600 text-sky-200">
            🔄 Ενδιάμεση κίνηση / στάση σώματος
          </span>
        )}
        {index === frames.length - 1 && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-950/80 border border-emerald-500 text-emerald-200">
            ✅ Τελική θέση — Πλήρης επαναφορά στην αρχική θέση (Ολοκλήρωση επανάληψης)
          </span>
        )}
      </div>

      <div className="frame-player-pose">
        <span className="font-semibold text-sky-300 block mb-1">Στάση σώματος:</span>
        {currentFrame.poseDescription}
      </div>

      <div className="frame-player-change text-slate-300 text-sm mt-2">
        <span className="font-medium text-slate-400">Αλλαγή από το προηγούμενο καρέ: </span>
        {currentFrame.changeFromPrevious || currentFrame.transitionDescription || 'Αρχική τοποθέτηση'}
      </div>

      <div className="frame-player-controls mt-4">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={index === 0}
          className="disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Προηγούμενο
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="font-semibold min-w-[120px] bg-sky-900 border-sky-600"
        >
          {isPlaying ? 'Ⅱ Παύση' : '▶ Αναπαραγωγή'}
        </button>

        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={index === frames.length - 1}
          className="disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Επόμενο →
        </button>

        <label className="flex flex-col text-xs text-slate-300">
          <span>Ταχύτητα αναπαραγωγής</span>
          <select
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="mt-1 p-2 rounded bg-slate-800 border border-slate-600 text-white text-xs"
          >
            {speedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};
