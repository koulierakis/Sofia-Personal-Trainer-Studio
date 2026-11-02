import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=path.resolve('public');const manifestPath=path.join(root,'data/exercise-images.json');
const catalog=JSON.parse(execFileSync('node',[path.resolve('scripts/image-catalog.mjs')],{encoding:'utf8'}));
const original=JSON.parse(fs.readFileSync(manifestPath,'utf8'));const entries=original.exercises||{};
let files=0,errors=[];
for(const exercise of catalog){
 const sequence=exercise.visualization,frames=sequence?.frames||[];
 if(frames.length<3||frames.length>20||sequence.frameCount!==frames.length)errors.push('invalid visualization frame count '+exercise.id);
 if(frames.some((frame,i)=>frame.frame!==i+1||!frame.poseDescription||!frame.transitionDescription))errors.push('incomplete frame description '+exercise.id);
 if(frames.at(-1)?.sameImageAs!==1||frames.at(-1)?.poseDescription!==frames[0]?.poseDescription)errors.push('closing frame must reuse frame 1 '+exercise.id);
 if(!sequence.referenceImage||!sequence.referenceSha256||!sequence.promptTemplate?.includes(sequence.referenceSha256))errors.push('missing locked reference '+exercise.id);
 if(exercise.custom&&(exercise.level!=='Advanced'||exercise.category!=='Full Body'||exercise.classification!=='Custom'))errors.push('invalid custom classification '+exercise.id);
}
for(const [id,entry] of Object.entries(entries)){
 if(!/^(functional-\d{3}|sofia-original-\d{3}|hybrid-[a-z]+)$/.test(id))errors.push('invalid exercise ID '+id);
 if(!Array.isArray(entry.phases)||entry.phases.length<3||entry.phases.length>20)errors.push('invalid number of phases '+id);
 for(const [i,url] of (entry.phases||[]).entries()){
  if(!url.startsWith('/images/exercises/'+id+'/')){errors.push('ID mismatch '+id+' '+url);continue}
  if(!new RegExp('/'+String(i+1).padStart(2,'0')+'(?:-[a-f0-9]{16})?\\.webp$').test(url))errors.push('phase mismatch '+id+' '+url);
  if(!fs.existsSync(path.join(root,url.slice(1))))errors.push('missing file '+url);else files++;
 }
}
console.log(JSON.stringify({exerciseCount:catalog.length,exerciseEntries:Object.keys(entries).length,imageFiles:files,errors},null,2));if(errors.length)process.exitCode=1;

