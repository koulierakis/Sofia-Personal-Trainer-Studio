import type { Exercise } from '../types';
import { VISUAL_REFERENCES, modelProfileFor } from './visual-reference-lock';

export type ImageProvider = 'openai' | 'nano-banana-2' | 'open-source';
export type ImageJobStatus = 'draft' | 'queued' | 'generating' | 'needs-review' | 'approved' | 'failed';

export interface FrameImageJob {
  id: string;
  exerciseId: string;
  exerciseName: string;
  frameNumber: number;
  frameCount: number;
  provider: ImageProvider;
  status: ImageJobStatus;
  referenceImageUrl: string;
  prompt: string;
  imageUrl?: string;
  error?: string;
}

export interface ImageBatch {
  jobs: FrameImageJob[];
  exercises: number;
  frames: number;
  provider: ImageProvider;
  requiresHumanApproval: true;
}

type FrameData = {
  frame?: number;
  label?: string;
  poseDescription?: string;
  transitionDescription?: string;
  prompt?: string;
};

function exerciseFrames(exercise: Exercise): FrameData[] {
  const visual = (exercise as Exercise & { visualization?: { frames?: FrameData[] } }).visualization;
  return Array.isArray(visual?.frames) ? visual.frames : [];
}

export function buildFramePrompt(exercise: Exercise, frame: FrameData, index: number, total: number): string {
  const profile = modelProfileFor(exercise);
  const reference = VISUAL_REFERENCES[profile];
  const name = String(exercise.name || exercise.title || exercise.greekName || exercise.id);
  const pose = String(frame.poseDescription || '').trim();
  if (!pose) throw new Error(`Frame ${index + 1} of ${name} has no static anatomical pose description`);
  const transition = String(frame.transitionDescription || '').trim();
  return [
    'SOFIA PERSONAL TRAINER — SINGLE EXERCISE FRAME. Photorealistic full-body still photograph.',
    `Exercise: ${name}. Frame ${index + 1} of ${total}.`,
    `Reference athlete: ${reference.athleteName}. The approved reference image MUST be attached as image input, not merely mentioned as a URL.`,
    'Preserve exact face, body proportions, hairstyle, outfit, shoes, lighting and ATHLETICO studio from the attached image.',
    'One athlete, fixed 45-degree three-quarter camera angle, full body and equipment visible, consistent framing.',
    'LEFT and RIGHT mean the ATHLETE\'S anatomical left and right, not the viewer\'s. Never mirror or swap limbs.',
    `EXACT STATIC POSTURE: ${pose}`,
    transition ? `CHANGE FROM PREVIOUS FRAME: ${transition}` : 'First frame: establish the specified starting posture.',
    'Do not infer or invent missing limb positions. If the pose is ambiguous, flag for coach review rather than generating.',
    'No arrows, captions, labels, motion blur, duplicated limbs, or extra people.',
  ].join('\n');
}

export function prepareImageBatch(exercises: Exercise[], provider: ImageProvider, maxExercises = 20): ImageBatch {
  if (!['openai', 'nano-banana-2', 'open-source'].includes(provider)) throw new Error('Unsupported image provider');
  if (!Number.isInteger(maxExercises) || maxExercises < 1 || maxExercises > 20) throw new Error('Batch limit must be 1–20 exercises');
  const selected = exercises.slice(0, maxExercises);
  const jobs: FrameImageJob[] = [];
  for (const exercise of selected) {
    const frames = exerciseFrames(exercise);
    if (!frames.length) throw new Error(`Exercise ${exercise.id} has no frames`);
    const referenceImageUrl = VISUAL_REFERENCES[modelProfileFor(exercise)].url;
    frames.forEach((frame, index) => {
      jobs.push({
        id: `${exercise.id}:frame-${index + 1}`,
        exerciseId: exercise.id,
        exerciseName: String(exercise.name || exercise.title || exercise.id),
        frameNumber: index + 1,
        frameCount: frames.length,
        provider,
        status: 'draft',
        referenceImageUrl,
        prompt: buildFramePrompt(exercise, frame, index, frames.length),
      });
    });
  }
  return { jobs, exercises: selected.length, frames: jobs.length, provider, requiresHumanApproval: true };
}

// This module deliberately does NOT call external APIs or store credentials.
// A trusted backend must attach the reference image bytes and perform paid generation
// after explicit approval of the estimated batch cost.
