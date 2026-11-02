import { Exercise, ReviewMap, ReviewStatus } from '../types';

export const REVIEW_KEY = 'sofia_concept_review_v1';
export const IMAGE_STATES = ['not_generated', 'queued', 'generated', 'review_required', 'approved'] as const;

export function sanitizeReviews(source: any): ReviewMap {
  const out: ReviewMap = {};
  if (!source || typeof source !== 'object' || Array.isArray(source)) return out;
  for (const [id, r] of Object.entries(source) as [string, any][]) {
    if (!/^(sofia-original-\d{3}|hybrid-[a-z]{3})$/.test(id) || !r || typeof r !== 'object') continue;
    if (!['pending', 'approved', 'rejected'].includes(r.status)) continue;
    const imageStatus = IMAGE_STATES.includes(r.imageStatus) ? r.imageStatus : 'not_generated';
    out[id] = {
      status: r.status as ReviewStatus,
      imageStatus,
      reviewedAt: typeof r.reviewedAt === 'string' ? r.reviewedAt : null,
    };
  }
  return out;
}

export function reviewStatus(id: string, reviews: ReviewMap): ReviewStatus {
  return reviews[id]?.status || 'pending';
}

export function reviewConcept(
  id: string,
  status: ReviewStatus,
  reviews: ReviewMap,
  now = new Date().toISOString()
): ReviewMap {
  if (!/^(sofia-original-\d{3}|hybrid-[a-z]{3})$/.test(id)) {
    throw new Error('Unknown concept ID: ' + id);
  }
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    throw new Error('Invalid review status: ' + status);
  }
  return {
    ...reviews,
    [id]: {
      status,
      imageStatus: reviews[id]?.imageStatus || 'not_generated',
      reviewedAt: now,
    },
  };
}

export function visibleConcepts(
  concepts: Exercise[],
  reviews: ReviewMap,
  includePending: boolean
): Exercise[] {
  return concepts
    .filter((x) => reviewStatus(x.id, reviews) !== 'rejected' && (includePending || reviewStatus(x.id, reviews) === 'approved'))
    .map((x) => {
      const status = reviewStatus(x.id, reviews);
      return {
        ...x,
        reviewStatus: status,
        requiresCoachReview: status !== 'approved',
        approvedBySofia: status === 'approved',
        imageStatus: reviews[x.id]?.imageStatus || 'not_generated',
      };
    });
}

export function reviewCounts(concepts: Exercise[], reviews: ReviewMap): { pending: number; approved: number; rejected: number } {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const x of concepts) {
    counts[reviewStatus(x.id, reviews)]++;
  }
  return counts;
}
