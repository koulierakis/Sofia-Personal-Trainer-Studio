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
export function imageFor(exercise,id,index,library){
 const entry=library[id];
 const path=entry?.phases?.[index];
 if(!entry||!['approved','pending_visual_review'].includes(entry.status))return null;
 if(typeof path!=='string'||!/^\/images\/exercises\/[a-z0-9-]+\/\d{2}\.webp$/.test(path))return null;
 if(!path.includes('/'+id+'/'))return null;
 return {url:path,status:entry.status};
}
