import { Exercise, ReviewMap, VisualizationSequence } from '../types';
import { reviewStatus } from './review-system';

/**
 * Important: visualization-sequence.ts ALREADY supplies the complete canonical
 * outward + exact reverse-alias sequence. Never re-generate, shorten, re-label,
 * replace or reinterpret any exercise's frame prompts here.
 */
export function mirrorExerciseSequence(sequence: VisualizationSequence): VisualizationSequence {
  const frames = sequence.frames ?? [];
  if (frames.length < 3) throw new Error('Exercise has too few canonical frames');
  if (frames[frames.length - 1].sameImageAs !== 1) {
    throw new Error('Canonical exercise is missing last-frame alias to frame 1');
  }
  for (const [index, frame] of frames.entries()) {
    if (frame.frame !== index + 1) {
      throw new Error('Invalid canonical frame numbering');
    }
    if (!frame.prompt?.trim()) {
      throw new Error('Missing original frame prompt at ' + frame.frame);
    }
    if (frame.sameImageAs !== null && frame.sameImageAs !== undefined) {
      const source = frames[frame.sameImageAs - 1];
      if (!source || source.frame >= frame.frame || source.sameImageAs != null) {
        throw new Error('Invalid source-frame alias at ' + frame.frame);
      }
    }
  }
  // Return the original sequence untouched so the exact stored prompts survive.
  return sequence;
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

/** Review decisions saved in the user's browser take precedence. */
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
          frame: f.frame, sameImageAs: f.sameImageAs!, prompt: f.prompt,
        })),
        sequence,
      };
    });
}
