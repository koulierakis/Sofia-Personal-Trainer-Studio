import React, { useState, useEffect, useRef } from 'react';
import { VisualizationSequence } from '../types';

interface FramePlayerProps {
  sequence: VisualizationSequence;
  exerciseId?: string;
}

export const FramePlayer: React.FC<FramePlayerProps> = ({ sequence, exerciseId }) => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [delay, setDelay] = useState(1500);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef<number | null>(null);

  const frames = sequence.frames || [];
  const currentFrame = frames[index] || frames[0];

  useEffect(() => {
    // Reset index when sequence or exercise changes
    setIndex(0);
    setIsPlaying(false);
    setImgError(false);
  }, [sequence, exerciseId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setIndex((prev) => {
          if (prev >= frames.length - 1) {
            if (isLooping) {
              return 0; // Ομαλή επανεκκίνηση από την αρχική θέση
            }
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
  }, [isPlaying, delay, frames.length, isLooping]);

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
    setIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return isLooping ? frames.length - 1 : 0;
      if (next >= frames.length) return isLooping ? 0 : frames.length - 1;
      return next;
    });
  };

  const handleSelectFrame = (targetIndex: number) => {
    setIsPlaying(false);
    setIndex(Math.max(0, Math.min(frames.length - 1, targetIndex)));
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

  // Επίλυση εικόνας ανά άσκηση
  const isSquat = exerciseId === 'functional-001' || currentFrame.prompt?.includes('Squat') || currentFrame.prompt?.includes('squat');
  const isZevara = exerciseId === 'hybrid-zev' || currentFrame.prompt?.includes('Zevara');

  let frameImageUrl: string | null = null;

  if (isSquat) {
    if (frames.length === 3) {
      // 3 καρέ: 1: Αρχική, 2: Βασική θέση (Κάθισμα), 3: Επιστροφή (Αρχική)
      if (index === 0 || index === 2) {
        frameImageUrl = '/images/exercises/squat/frame_01.jpg';
      } else {
        frameImageUrl = '/images/exercises/squat/frame_03.jpg';
      }
    } else if (frames.length === 5) {
      const map5 = [
        '/images/exercises/squat/frame_01.jpg',
        '/images/exercises/squat/frame_02.jpg',
        '/images/exercises/squat/frame_03.jpg',
        '/images/exercises/squat/frame_04.jpg',
        '/images/exercises/squat/frame_01.jpg',
      ];
      frameImageUrl = map5[index] || '/images/exercises/squat/frame_01.jpg';
    } else {
      frameImageUrl = index === frames.length - 1 ? '/images/exercises/squat/frame_01.jpg' : '/images/exercises/squat/frame_03.jpg';
    }
  } else if (isZevara) {
    if (frames.length === 5) {
      const zMap = [
        '/zevara/frame_001.png',
        '/zevara/frame_006.png',
        '/zevara/frame_011.png',
        '/zevara/frame_016.png',
        '/zevara/frame_001.png',
      ];
      frameImageUrl = zMap[index] || '/zevara/frame_001.png';
    } else {
      const frameNumStr = String(Math.min(27, index + 1)).padStart(3, '0');
      frameImageUrl = index === frames.length - 1 ? '/zevara/frame_001.png' : `/zevara/frame_${frameNumStr}.png`;
    }
  }

  return (
    <section className="frame-player" aria-label="Αναπαραγωγή περιγραφών καρέ">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h4 className="font-semibold text-lg text-white">
          Αναπαραγωγή καρέ επανάληψης (1–{frames.length})
        </h4>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isLooping}
              onChange={(e) => setIsLooping(e.target.checked)}
              className="rounded accent-sky-500 cursor-pointer"
            />
            <span>🔁 Συνεχής επανάληψη</span>
          </label>

          <label className="text-xs text-slate-300 flex items-center gap-1.5">
            <span>Επιλογή:</span>
            <select
              value={index}
              onChange={(e) => handleSelectFrame(Number(e.target.value))}
              className="p-1 rounded bg-slate-800 border border-slate-600 text-sky-200 text-xs font-semibold"
            >
              {frames.map((f, i) => (
                <option key={i} value={i}>
                  Καρέ {i + 1}/{frames.length} — {f.label.slice(0, 32)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="frame-player-counter font-bold text-sky-200">
        Καρέ {index + 1} από {frames.length} · {currentFrame.label}
      </p>

      {/* Visual Image Display if available */}
      {frameImageUrl && !imgError && (
        <div className="my-4 flex flex-col items-center justify-center p-3 bg-[#0d1624] border border-[#23354d] rounded-xl shadow-inner">
          <div className="relative max-w-[300px] w-full aspect-[3/4] overflow-hidden rounded-lg shadow-2xl bg-black border border-slate-700 flex items-center justify-center">
            <img
              src={frameImageUrl}
              alt={`Καρέ ${index + 1} - ${currentFrame.label}`}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain transition-opacity duration-300"
            />
            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[11px] font-mono text-white shadow">
              Καρέ {index + 1}/{frames.length}
            </div>
            {currentFrame.sameImageAs && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/85 text-emerald-300 text-[10px] p-1.5 text-center rounded border border-emerald-500/40 font-medium shadow">
                ✅ Επαναφορά στην αρχική θέση (Ταυτόσημη σωματική στάση με Καρέ {currentFrame.sameImageAs})
              </div>
            )}
          </div>
        </div>
      )}

      <progress
        className="w-full h-3 my-3 rounded"
        max={frames.length}
        value={index + 1}
        aria-label="Πρόοδος αναπαραγωγής καρέ"
      />

      <div className="flex flex-wrap items-center gap-2 mb-2">
        {index === 0 && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-900/80 border border-blue-500 text-blue-200">
            🎯 Αρχική θέση επανάληψης (Καρέ 1)
          </span>
        )}
        {index > 0 && index < frames.length - 1 && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-950/80 border border-sky-600 text-sky-200">
            🔄 Ενδιάμεση κίνηση / στάση σώματος (Καρέ {index + 1}/{frames.length})
          </span>
        )}
        {index === frames.length - 1 && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-950/80 border border-emerald-500 text-emerald-200">
            ✅ Τελική θέση — Πλήρης επαναφορά στην αρχική θέση (Καρέ {frames.length} = Καρέ 1)
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

      <div className="frame-player-controls mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={index === 0 && !isLooping}
          className="disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Προηγούμενο
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="font-semibold min-w-[130px] bg-sky-900 border-sky-600 hover:bg-sky-800"
        >
          {isPlaying ? 'Ⅱ Παύση' : '▶ Αναπαραγωγή'}
        </button>

        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={index === frames.length - 1 && !isLooping}
          className="disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Επόμενο →
        </button>

        <label className="flex flex-col text-xs text-slate-300 ml-auto">
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

      {/* Τεχνική επισήμανση λειτουργίας Player */}
      <div className="mt-4 p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/60 text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-300 block mb-0.5">ℹ️ Τεχνική σημείωση αναπαραγωγής:</strong>
        Ο player προβάλλει διακριτά, πιστοποιημένα καρέ (keyframes) μίας πλήρους επανάληψης με ομαλή οπτική μετάβαση (crossfade) και σαφείς οδηγίες διδασκαλίας για αρχαρίους. Δεν πραγματοποιεί τεχνητή νευρωνική παρεμβολή (frame-morphing), διασφαλίζοντας ανατομική ακρίβεια χωρίς παραμορφώσεις. Το πρώτο και το τελευταίο καρέ αντιπροσωπεύουν την ίδια αρχική θέση σώματος.
      </div>
    </section>
  );
};
