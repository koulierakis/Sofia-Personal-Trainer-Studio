// Browser-local image review storage. Images are NOT published to GitHub by this module.
const DB='sofia_visual_review_v1',STORE='phase_images';
function db(){return new Promise((ok,no)=>{const q=indexedDB.open(DB,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(STORE))q.result.createObjectStore(STORE)};q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})}
async function operation(key,value,write){const d=await db();return new Promise((ok,no)=>{const tx=d.transaction(STORE,write?'readwrite':'readonly'),s=tx.objectStore(STORE),req=write?s.put(value,key):s.get(key);req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error);tx.oncomplete=()=>d.close();tx.onerror=()=>no(tx.error)})}
export function getFrame(id,index){return operation(id+':'+index,null,false)}
export async function setFrame(id,index,file){if(!file||!file.type.startsWith('image/')||file.size>8*1024*1024)throw Error('Επίλεξε εικόνα JPG/PNG/WebP έως 8 MB');return operation(id+':'+index,{blob:file,reviewStatus:'pending_visual_review',uploadedAt:new Date().toISOString()},true)}
export async function approveFrame(id,index){const v=await getFrame(id,index);if(!v)throw Error('Δεν υπάρχει εικόνα');return operation(id+':'+index,{...v,reviewStatus:'approved',reviewedAt:new Date().toISOString()},true)}
export async function rejectFrame(id,index){const d=await db();return new Promise((ok,no)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id+':'+index);tx.oncomplete=()=>{d.close();ok(true)};tx.onerror=()=>no(tx.error)})}
