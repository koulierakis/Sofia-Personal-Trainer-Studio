// Static repository imagery manifest. Only list files actually committed under public/images/exercises/.
// Format: {"functional-001":{"status":"pending_visual_review","phases":["/images/exercises/functional-001/01.webp",...]}}.
// A phase is never mapped by order in the overall library: use the exact exercise ID and phase index.
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


const REVIEW_KEY='sofia_repository_image_reviews_v1';
export function imageReviewKey(id,index,url){return JSON.stringify([id,index,url]);}
export function readImageReviews(storage=globalThis.localStorage){
 try{const value=JSON.parse(storage.getItem(REVIEW_KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}
}
export function setImageReview(id,index,url,status,storage=globalThis.localStorage){
 if(!['approved','rejected','pending_visual_review'].includes(status))throw Error('Invalid image review');
 const reviews=readImageReviews(storage);reviews[imageReviewKey(id,index,url)]=status;storage.setItem(REVIEW_KEY,JSON.stringify(reviews));
}
