import React, { useMemo } from 'react';
import { Exercise, ReviewMap } from '../types';
import { firstPendingVisualPlans } from '../services/pending-visual-batch';

interface Props {
  concepts: Exercise[];
  reviews: ReviewMap;
  onOpenExercise: (id: string) => void;
}

export const PendingVisualBatch: React.FC<Props> = ({ concepts, reviews, onOpenExercise }) => {
  const plans = useMemo(() => firstPendingVisualPlans(concepts, reviews, 10), [concepts, reviews]);

  const downloadManifest = () => {
    const payload = {
      purpose: 'SOFIA — first 10 pending coach review exercises',
      status: 'draft_only_not_generated_or_approved',
      rendering: 'Only generate[] frames with the approved locked model-and-studio image; return frames are exact local file copies.',
      plans,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sofia-pending-first-10-render-plan.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!plans.length) return null;
  return (
    <details className="mb-5 rounded-xl border border-sky-700 bg-slate-950/80 p-4 text-white">
      <summary className="cursor-pointer font-bold text-sky-200">
        Οπτικοποίηση — 10 πρώτες ασκήσεις σε αναμονή έγκρισης
      </summary>
      <p className="mt-2 text-xs text-amber-200">
        Προετοιμασία prompts μόνο. Οι φωτογραφίες δεν έχουν παραχθεί και καμία άσκηση δεν έχει εγκριθεί.
        Τα καρέ επιστροφής είναι ακριβή αντίγραφα, χωρίς δεύτερη κλήση AI.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {plans.map((plan, index) => (
          <div key={plan.exerciseId} className="rounded-lg border border-slate-700 bg-slate-900 p-3 flex flex-wrap justify-between gap-3 items-center">
            <div>
              <div className="text-sm font-semibold">{index + 1}. {plan.name}</div>
              <div className="text-xs text-slate-300">
                {plan.exerciseId} · {plan.referenceProfile === 'male' ? 'Άνδρας' : 'Γυναίκα'} ·
                {plan.generate.length} μοναδικά + {plan.aliases.length} αντίγραφα =
                {plan.sequence.frames.length} καρέ
              </div>
            </div>
            <button type="button" onClick={() => onOpenExercise(plan.exerciseId)}
              className="rounded-lg bg-sky-900 px-3 py-2 text-xs text-white">
              Προβολή άσκησης
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={downloadManifest}
        className="mt-3 rounded-lg bg-sky-700 px-4 py-2 font-semibold text-sm text-white">
        Λήψη των 10 πλάνων + μοναδικών prompts (JSON)
      </button>
    </details>
  );
};
