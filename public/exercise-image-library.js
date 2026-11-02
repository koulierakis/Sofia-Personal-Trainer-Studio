// Repository exercise-photo manifest. It is intentionally empty: exercise records contain written prompts only.
// The two approved athlete/studio references are kept separately for future prompt-guided image generation.
export async function loadImageLibrary(){
 try{
  const response=await fetch('/data/exercise-images.json',{cache:'no-cache'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const doc=await response.json();
  if(doc.version!==1||typeof doc.exercises!=='object')throw Error('Invalid manifest');
  return doc.exercises;
 }catch(e){console.warn('Image library manifest unavailable',e);return {}}
}
export function imageFor(exercise,id,index,library,reviews=readImageReviews()){
 const entry=library[id];
 const path=entry?.phases?.[index];
 if(entry?.blockedPhases?.[String(index+1)])return null;
 if(!entry||!['approved','pending_visual_review'].includes(entry.status))return null;
 if(typeof path!=='string'||!/^\/images\/exercises\/[a-z0-9-]+\/\d{2}(?:-[a-f0-9]{16})?\.webp$/.test(path))return null;
 if(!path.includes('/'+id+'/'))return null;
 const status=reviews[imageReviewKey(id,index,path)]||entry.phaseReviews?.[String(index+1)]?.status||entry.status;
 return {url:path,status,label:entry.labels?.[index]};
}

// Explicitly enabled batch previews are unapproved alternatives. Keep the original
// phase mapping/reviews intact, and never supersede a coach-approved sequence.
export function playerImageEntry(entry){
 const preview=entry?.storyboardPreview;
 const approved=entry?.status==='approved'||Object.values(entry?.phaseReviews||{}).some(r=>r.status==='approved');
 if(approved||preview?.status!=='pending_visual_review'||preview.coachApproved!==false||!Array.isArray(preview.phases)||preview.phases.length<4||preview.phases.length>10||preview.labels?.length!==preview.phases.length)return entry;
 if(!preview.phases.every((url,i)=>entry.importedCandidates?.some(c=>c.url===url&&c.phase===i+1&&c.reviewStatus==='pending_visual_review')))return entry;
 return {...entry,status:'pending_visual_review',phases:preview.phases,labels:preview.labels,blockedPhases:{},phaseReviews:{},previewActive:true};
}


const REVIEW_KEY='sofia_repository_image_reviews_v1';
export function imageReviewKey(id,index,url){return JSON.stringify([id,index,url]);}
export function readImageReviews(storage=globalThis.localStorage){
 try{const value=JSON.parse(storage.getItem(REVIEW_KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}
}
export function setImageReview(id,index,url,status,storage=globalThis.localStorage){
 if(!['approved','rejected','pending_visual_review'].includes(status))throw Error('Invalid image review');
 const reviews=readImageReviews(storage);reviews[imageReviewKey(id,index,url)]=status;storage.setItem(REVIEW_KEY,JSON.stringify(reviews));
}

