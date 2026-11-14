import { Exercise, FrameItem, ReviewMap, VisualizationSequence } from '../types';
import { reviewStatus } from './review-system';

/**
 * A visual frame is generated only on the outward half. The return frames
 * are byte-for-byte aliases of approved images, NEVER separate AI requests.
 * This is an opt-in preview plan: nothing is published or approved here.
 */
export function mirrorExerciseSequence(sequence: VisualizationSequence): VisualizationSequence {
  const original = sequence.frames ?? [];
  if (original.length < 3) return sequence;
  // Stop BEFORE the first return phase; complex movements can have several
  // outward poses and just one generic closing frame, so midpoint is wrong.
  const returnIndex = original.findIndex((frame, i) =>
    i > 0 && /επιστροφ|επαναφορ|return|reverse|reset/i.test(
      (frame.label ?? '') + ' ' + (frame.transitionDescription ?? '')
    )
  );
  const peak = returnIndex > 1
    ? returnIndex - 1
    : Math.floor((original.length - 1) / 2);
  const outward = original.slice(0, peak + 1);
  const forward: FrameItem[] = outward.map((frame, i) => ({
    ...frame,
    frame: i + 1,
    sameImageAs: null,
  }));
  const back: FrameItem[] = outward.slice(0, -1).reverse().map((source, i) => ({
    ...source,
    frame: forward.length + i + 1,
    label: `Επιστροφή — ίδιο με καρέ ${source.frame}`,
    sameImageAs: source.frame,
    imageUrl: undefined,
    prompt: source.prompt, // no second render; record the source prompt for traceability
  }));
  const frames = [...forward, ...back];
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
  aliases: Array<{ frame: number; sameImageAs: number }>;
  sequence: VisualizationSequence;
}

/**
 * Select the FIRST ten concept exercises currently in pending review status.
 * Browser-local coach review decisions are supplied at runtime; never assume
 * repository defaults override a coach's local approvals/rejections.
 */
export function firstPendingVisualPlans(
  concepts: Exercise[],
  reviews: ReviewMap,
  max = 10,
): PendingExerciseRenderPlan[] {
  return concepts
    .filter(ex => ex.id.startsWith('sofia-original-') && reviewStatus(ex.id, reviews) === 'pending')
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
          frame: f.frame, sameImageAs: f.sameImageAs!,
        })),
        sequence,
      };
    });
}
