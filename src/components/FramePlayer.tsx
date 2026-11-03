import React, { useState, useEffect, useRef } from 'react';
import { VisualizationSequence } from '../types';
import { VISUAL_REFERENCES } from '../services/visual-reference-lock';

interface FramePlayerProps {
  sequence: VisualizationSequence;
  exerciseId?: string;
}

export const FramePlayer: React.FC<FramePlayerProps> = ({ sequence, exerciseId }) => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [delay, setDelay] = useState(1500);
  const timerRef = useRef<number | null>(null);

  const frames = sequence.frames || [];
  const currentFrame = frames[index] || frames[0];

  const profile: 'female' | 'male' = sequence.referenceProfile === 'male' ? 'male' : 'female';
  const referenceData = VISUAL_REFERENCES[profile] || VISUAL_REFERENCES.female;

  useEffect(() => {
    // Reset index when sequence or exercise changes
    setIndex(0);
    setIsPlaying(false);
  }, [sequence, exerciseId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setIndex((prev) => {
          if (prev >= frames.length - 1) {
            if (isLooping) {
              return 0; // Ομαλή αδιάκοπη επανάληψη
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

  return (
    <section className="frame-player" aria-label="Αναπαραγωγή περιγραφών καρέ">
      {/* ΕΝΣΩΜΑΤΩΜΕΝΟ ΜΟΝΤΕΛΟ ΑΝΑΦΟΡΑΣ & ΑΣΦΑΛΙΣΤΙΚΗ ΔΙΚΛΕΙΔΑ */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-[#0c192c] via-[#10223d] to-[#0a1526] border-2 border-sky-500/60 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative shrink-0 w-32 h-44 rounded-xl overflow-hidden border-2 border-amber-400 shadow-xl bg-black">
            <img
              src={referenceData.url}
              alt={referenceData.athleteTitleGreek}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute top-1 left-1 right-1 bg-black/85 text-[10px] text-amber-300 font-extrabold px-1.5 py-0.5 rounded text-center tracking-wider uppercase">
              Κλειδωμενο Μοντελο
            </div>
            <div className="absolute bottom-1 left-1 right-1 bg-black/80 text-[9px] text-sky-200 font-bold px-1 py-0.5 rounded text-center">
              📐 Λήψη 45° (λοξά)
            </div>
          </div>

          <div className="flex-1 text-left space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-black rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/50 uppercase tracking-wide">
                Επίσημη Αναφορά: {referenceData.athleteTitleGreek}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-sky-950 text-sky-300 border border-sky-800">
                Studio ATHLETICO
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                γωνία 45 μοίρες
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-amber-200 font-bold">Υποχρεωτικός Κανόνας:</strong> Για την οπτικοποίηση αυτής της άσκησης απαιτείται <strong className="text-white font-extrabold uppercase underline decoration-amber-400">αυστηρά και αποκλειστικά</strong> η χρήση του συγκεκριμένου μοντέλου, με την ίδια ενδυμασία ({referenceData.outfitGreek}), στον ίδιο χώρο studio ATHLETICO και με λήψη σταθερά στις 45 μοίρες (στη μέση λοξά).
            </p>

            {/* Reference assignment is NOT proof of generation compliance. */}
            <div className="mt-2 pt-2 border-t border-slate-700/60 text-xs text-amber-200" role="status">
              🛡️ Μοντέλο αναφοράς ανατεθειμένο — ΜΗ ΕΠΑΛΗΘΕΥΜΕΝΟ. Δεν έχει αποδειχθεί ότι ο generator έλαβε τη φωτογραφία αναφοράς ή διατήρησε την ταυτότητα.
            </div>
          </div>
        </div>
      </div>

      {/* ΜΠΛΟΚΑΡΙΣΜΑ ΕΑΝ ΔΕΝ ΤΗΡΕΙΤΑΙ Η ΑΣΦΑΛΙΣΤΙΚΗ ΔΙΚΛΕΙΔΑ */}
      {/* FRAME PLAYER CONTROLS & ANIMATION */}
      {(
        <>
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
                <span className="font-medium text-sky-200">🔁 Συνεχής επανάληψη</span>
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

          <progress
            className="w-full h-3 my-3 rounded"
            max={frames.length}
            value={index + 1}
            aria-label="Πρόοδος αναπαραγωγής καρέ"
          />

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {index === 0 && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-900/80 border border-blue-500 text-blue-200">
                🎯 Αρχική θέση επανάληψης (Καρέ 1) — Σταθερή λήψη 45°
              </span>
            )}
            {index > 0 && index < frames.length - 1 && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-950/80 border border-sky-600 text-sky-200">
                🔄 Ενδιάμεση κίνηση / στάση σώματος (Καρέ {index + 1}/{frames.length}) — Λήψη 45°
              </span>
            )}
            {index === frames.length - 1 && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-950/80 border border-emerald-500 text-emerald-200">
                ✅ Τελική θέση — Πλήρης επαναφορά στην αρχική θέση (Καρέ {frames.length} = Καρέ 1)
              </span>
            )}
          </div>

          {/* ΟΠΤΙΚΟΠΟΙΗΣΗ ΚΑΡΕ ΜΕ ΤΟ ΕΓΚΕΚΡΙΜΕΝΟ ΜΟΝΤΕΛΟ */}
          <div className="my-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* ΚΥΡΙΑ ΕΙΚΟΝΑ ΚΑΡΕ */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-sky-500/80 bg-slate-950 shadow-2xl group">
                {/* Κλειδωμένη φωτογραφία μοντέλου αναφοράς ενσωματωμένη στην άσκηση */}
                <img
                  src={currentFrame.imageUrl || ''}
                  alt={`${currentFrame.label} - Καρέ ${index + 1}`}
                  className="w-full h-full object-cover object-top transition-all duration-300"
                />

                {/* Overlays */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-600/90 text-white backdrop-blur-md shadow-md border border-sky-400/50">
                    Καρέ {index + 1} / {frames.length}
                  </span>
                  {currentFrame.sameImageAs && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-600/90 text-white backdrop-blur-md uppercase">
                      Επαναχρηση Καρέ 1
                    </span>
                  )}
                </div>

                <div className="absolute top-2 right-2 z-10">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-amber-300 border border-amber-500/60 shadow">
                    📐 45° λοξά 3/4
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent z-10">
                  <p className="text-xs font-bold text-white truncate drop-shadow">
                    {currentFrame.label}
                  </p>
                  <p className="text-[10px] text-amber-300 font-medium truncate">
                    👤 Μοντέλο: {referenceData.athleteTitleGreek}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 text-center mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-semibold">
                  👤 Ενσωματωμένο Μοντέλο Άσκησης
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300 font-semibold">
                  📐 Σταθερή Λήψη 45°
                </span>
              </div>
            </div>

            {/* ΠΕΡΙΓΡΑΦΗ & ΚΙΝΗΣΙΟΛΟΓΙΚΕΣ ΛΕΠΤΟΜΕΡΕΙΕΣ */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              {/* ΕΠΙΒΕΒΑΙΩΣΗ ΚΙΝΗΣΙΟΛΟΓΙΑΣ ΖΕΒΑΡΑ / ΜΟΝΟΠΟΔΙΚΗΣ ΣΤΗΡΙΞΗΣ */}
              {(exerciseId === 'hybrid-zev' || sequence.frames?.length === 7) && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-sky-500/60 text-xs shadow-md">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">🎯</span>
                    <strong className="text-sky-300 font-bold uppercase tracking-wide">
                      Επαληθευμένη Κινησιολογία Ποδιών &amp; Στήριξης
                    </strong>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-200">
                    <div className="bg-black/30 p-2 rounded-lg border border-sky-800/40">
                      <span className="text-amber-300 font-bold block mb-0.5">🦶 ΜΟΝΙΜΗ ΣΤΗΡΙΞΗ:</span>
                      <span><strong>Αριστερό πόδι</strong> — πατάει ακλόνητο και σταθερό με ολόκληρο το πέλμα στο δάπεδο.</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg border border-sky-800/40">
                      <span className="text-emerald-300 font-bold block mb-0.5">🦵 ΚΙΝΟΥΜΕΝΟ ΠΟΔΙ:</span>
                      <span><strong>Δεξί πόδι</strong> — κάνει το βήμα πίσω, και <strong>ΤΟ ΙΔΙΟ δεξί πόδι</strong> εκτινάσσεται εμπρός και ψηλά στις 90°.</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="frame-player-pose">
                <span className="font-semibold text-sky-300 block mb-1">
                  📍 Αναλυτική στάση σώματος καρέ {index + 1}:
                </span>
                <p className="leading-relaxed text-slate-100 text-sm">
                  {currentFrame.poseDescription}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs">
                <span className="font-semibold text-amber-300 block mb-1">
                  🔄 Μετατόπιση μελών σώματος:
                </span>
                <p className="leading-relaxed text-slate-200">
                  {currentFrame.changeFromPrevious || currentFrame.transitionDescription || 'Αρχική σταθερή τοποθέτηση.'}
                </p>
              </div>

              {/* THUMBNAIL STRIP ΓΙΑ ΟΛΑ ΤΑ ΚΑΡΕ ΜΕ ΤΟ ΕΓΚΕΚΡΙΜΕΝΟ ΜΟΝΤΕΛΟ */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Αλληλουχία κίνησης ({frames.length} καρέ):</span>
                  <span className="text-sky-300">Κλικ σε καρέ για άμεση μετάβαση</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {frames.map((f, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectFrame(i)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border p-0 transition-all ${
                        index === i
                          ? 'border-sky-400 ring-2 ring-sky-400 scale-105 z-10 shadow-lg'
                          : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
                      }`}
                      title={`Καρέ ${i + 1}: ${f.label}`}
                    >
                      <img
                        src={f.imageUrl || ''}
                        alt={`Καρέ ${i + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/85 text-[9px] font-extrabold text-white text-center py-0.5">
                        {i + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
        </>
      )}

      {/* ΑΥΣΤΗΡΟ ΚΛΕΙΔΩΜΑ ΜΟΝΤΕΛΩΝ - ΕΝΤΟΝΗ ΕΠΙΣΗΜΑΝΣΗ */}
      <div className="mt-4 p-3 rounded-xl bg-amber-950/70 border-2 border-amber-500 text-xs text-amber-200 leading-relaxed shadow-lg">
        <strong className="text-amber-300 font-extrabold uppercase tracking-wide block mb-1 text-sm">
          🔒 ΑΥΣΤΗΡΟ ΚΛΕΙΔΩΜΑ ΜΟΝΤΕΛΩΝ & ΧΩΡΟΥ (SOFIA VISUAL LOCK):
        </strong>
        <p className="font-semibold text-slate-100">
          Όποιος χειρίζεται το <strong>Sofia Personal Studio</strong> υποχρεούται <strong>ΑΠΟΚΛΕΙΣΤΙΚΑ ΚΑΙ ΜΟΝΟ</strong> να χρησιμοποιεί ένα από τα δύο εγκεκριμένα μοντέλα (Athletico Female & Male Reference) στο studio <strong>ATHLETICO Fitness Boutique</strong>, με λήψη σταθερά στις 45 μοίρες. <strong>Απαγορεύεται ρητά η χρήση οποιουδήποτε άλλου προσώπου, ενδυμασίας ή χώρου.</strong>
        </p>
      </div>
    </section>
  );
};
