export interface ExercisePhase {
  label: string;
  cue?: string;
  sequenceIndex?: number;
}

export interface FrameItem {
  frame: number;
  label: string;
  poseDescription: string;
  changeFromPrevious?: string;
  transitionDescription?: string;
  referenceProfile: string;
  referenceImage: string;
  referenceSha256: string;
  sameImageAs: number | null;
  prompt: string;
  imageUrl?: string;
}

export interface VisualizationSequence {
  version: number;
  referenceProfile: string;
  referenceImage: string;
  referenceSha256: string;
  promptTemplate: string;
  fixedVisualContext: string;
  frameCount: number;
  closingFrameReuses: number;
  coachReviewRequired: boolean;
  frames: FrameItem[];
}

export interface Exercise {
  id: string;
  name?: string;
  title?: string;
  gr?: string;
  greekName?: string;
  code?: string;
  discipline?: 'functional' | 'pilates' | string;
  trainingType?: string;
  level?: string;
  category?: string;
  goal?: string;
  muscles?: string[];
  primaryMuscles?: string[];
  detailedMuscles?: string[];
  equipment?: string[] | string;
  instructions?: string;
  description?: string;
  breathing?: string;
  safety?: string;
  phases?: ExercisePhase[];
  custom?: boolean;
  classification?: string;
  source?: string;
  verified?: boolean;
  requiresCoachReview?: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  approvedBySofia?: boolean;
  imageStatus?: string;
  newConcept?: boolean;
  patterns?: string[];
  visualization?: VisualizationSequence;
  modelProfile?: 'female' | 'male';
}

export interface ProgramBlock {
  minutes: number;
  activity: string;
}

export interface Program {
  id: string;
  name?: string;
  title?: string;
  discipline?: 'functional' | 'pilates' | string;
  level?: string;
  durationMinutes?: number;
  blocks: ProgramBlock[];
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ConceptReview {
  status: ReviewStatus;
  imageStatus: string;
  reviewedAt: string | null;
}

export type ReviewMap = Record<string, ConceptReview>;

export interface AppState {
  exercises: Exercise[];
  programs: Program[];
}
