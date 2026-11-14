import { Exercise, FrameItem, ReviewMap, VisualizationSequence } from '../types';
import { reviewStatus } from './review-system';

/**
 * Preserve every stored outward pose/prompt up to the actual peak.
 * The return path references those ORIGINAL images by index; never render it.
 * The virtual "0" is the player reset state after the last displayed frame 1,
 * NOT a new image or an extra generation request.
 */
export function mirrorExerciseSequence(sequence: VisualizationSequence): VisualizationSequence {
  const original = sequence.frames ?? [];
  if (original.length < 3) throw new Error('At least three frames are required');

  const peakIndex = original.findIndex(f =>
    /κορύφωση|peak|apex|τέλος εκτέλεσης|τελική θέση της εξόδου/i.test(f.label || '')
  );
  const firstReturn = original.findIndex((f, i) =>
    i > 1 && /^(επιστροφή [12]|ελεγχόμενη επαναφορά|καρέ \d+ — επιστροφή)/i.test(f.label || '')
  );
  const lastOriginal = original.findIndex((f, i) => i > 0 && f.sameImageAs === 1);
  const count = peakIndex >= 1
    ? peakIndex + 1
    : firstReturn > 1
      ? firstReturn
      : lastOriginal > 1
        ? lastOriginal
        : original.length;

  const forward = original.slice(0, count).map((f, i) => ({
    ...f, frame: i + 1, sameImageAs: null,
  }));
  if (forward.length < 2) throw new Error('No usable outward movement');

  const aliases: FrameItem[] = forward.slice(0, -1).reverse().map((source, i) => ({
    ...source,
    frame: forward.length + i + 1,
    label: 'Επιστροφή — ίδιο ακριβώς με καρέ ' + source.frame,
    sameImageAs: source.frame,
    imageUrl: undefined,
    prompt: 'REUSE EXACT ORIGINAL IMAGE FROM FRAME ' + source.frame +
      '. DO NOT GENERATE A NEW IMAGE. DO NOT FLIP, MIRROR, RETOUCH OR CHANGE PIXELS.',
  }));

  const frames = [...forward, ...aliases];
  return {
    ...sequence,
    frames,
    frameCount: frames.length,
    closingFrameReuses: 1,
    coachReviewRequired: true,
  };
}

export interface PendingExerciseRenderPlan {
  exerciseId: string;
  name: string;
  referenceProfile: string;
  referenceImage: string;
  referenceSha256: string;
  generate: Array<{ frame: number; label: string; prompt: string }>;
  aliases: Array<{ frame: number; sameImageAs: number; prompt: string }>;
  sequence: VisualizationSequence;
}

/**
 * The ten FIRST hybrid exercises in the repository are the selected Custom /
 * Advanced set (Zevara, Vyxora, Qorix ...). Keep repository sequence ordering.
 * Do not silently fall back to the unrelated sofia-original-001 family.
 */
export function firstPendingVisualPlans(
  concepts: Exercise[],
  reviews: ReviewMap,
  max = 10,
): PendingExerciseRenderPlan[] {
  return concepts
    .filter(ex => (ex.id.startsWith('hybrid-') || ex.id.startsWith('sofia-hiit-2026-') || ex.id === 'sofia-original-001' || ex.id === 'sofia-original-002') && reviewStatus(ex.id, reviews) === 'pending')
    .slice(0, max)
    .filter(ex => !!ex.visualization?.frames?.length)
    .map(ex => {
      const sequence = mirrorExerciseSequence(ex.visualization!);
      return {
        exerciseId: ex.id,
        name: ex.name ?? ex.id,
        referenceProfile: sequence.referenceProfile,
        referenceImage: sequence.referenceImage,
        referenceSha256: sequence.referenceSha256,
        generate: sequence.frames.filter(f => f.sameImageAs == null).map(f => ({
          frame: f.frame, label: f.label, prompt: f.prompt,
        })),
        aliases: sequence.frames.filter(f => f.sameImageAs != null).map(f => ({
          frame: f.frame, sameImageAs: f.sameImageAs!, prompt: f.prompt,
        })),
        sequence,
      };
    });
}
