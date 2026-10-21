// Sofia concept review model; decisions persist per browser, exportable as JSON.
// A rejected concept remains tombstoned, so updates cannot reintroduce it.
export const REVIEW_KEY='sofia_concept_review_v1';
export const IMAGE_STATES=['not_generated','queued','generated','review_required','approved'];
export function sanitizeReviews(source){
 const out={};if(!source||typeof source!=='object'||Array.isArray(source))return out;
 for(const [id,r] of Object.entries(source)){
  if(!/^sofia-original-\d{3}$/.test(id)||!r||typeof r!=='object')continue;
  if(!['pending','approved','rejected'].includes(r.status))continue;
  const imageStatus=IMAGE_STATES.includes(r.imageStatus)?r.imageStatus:'not_generated';
  out[id]={status:r.status,imageStatus,reviewedAt:typeof r.reviewedAt==='string'?r.reviewedAt:null};
 }
 return out;
}
export function reviewStatus(id,reviews){return reviews[id]?.status||'pending';}
export function reviewConcept(id,status,reviews,now=new Date().toISOString()){
 if(!/^sofia-original-\d{3}$/.test(id))throw Error('Unknown concept ID');
 if(!['approved','rejected','pending'].includes(status))throw Error('Invalid review status');
 return {...reviews,[id]:{status,imageStatus:reviews[id]?.imageStatus||'not_generated',reviewedAt:now}};
}
export function visibleConcepts(concepts,reviews,includePending){
 return concepts.filter(x=>reviewStatus(x.id,reviews)!=='rejected'&&(includePending||reviewStatus(x.id,reviews)==='approved')).map(x=>{
  const status=reviewStatus(x.id,reviews);
  return {...x,reviewStatus:status,requiresCoachReview:status!=='approved',approvedBySofia:status==='approved',imageStatus:reviews[x.id]?.imageStatus||'not_generated'};
 });
}
export function reviewCounts(concepts,reviews){
 const counts={pending:0,approved:0,rejected:0};
 for(const x of concepts)counts[reviewStatus(x.id,reviews)]++;
 return counts;
}
