import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('public');const manifestPath=path.join(root,'data/exercise-images.json');
const original=JSON.parse(fs.readFileSync(manifestPath,'utf8'));const entries=original.exercises||{};
let files=0,errors=[];
for(const [id,entry] of Object.entries(entries)){
 if(!/^(functional|sofia-original)-\d{3}$/.test(id))errors.push('invalid exercise ID '+id);
 if(!Array.isArray(entry.phases)||entry.phases.length<4||entry.phases.length>6)errors.push('invalid number of phases '+id);
 for(const [i,url] of (entry.phases||[]).entries()){
  if(!url.startsWith('/images/exercises/'+id+'/')){errors.push('ID mismatch '+id+' '+url);continue}
  if(!url.endsWith('/'+String(i+1).padStart(2,'0')+'.webp'))errors.push('phase mismatch '+id+' '+url);
  if(!fs.existsSync(path.join(root,url.slice(1))))errors.push('missing file '+url);else files++;
 }
}
console.log(JSON.stringify({exerciseEntries:Object.keys(entries).length,imageFiles:files,errors},null,2));if(errors.length)process.exitCode=1;
