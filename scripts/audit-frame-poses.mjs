import fs from 'node:fs';
import path from 'node:path';

const DATA = path.resolve('public/data');
const files = ['functional-01.json','functional-02.json','functional-03.json','functional-04.json','custom-sequences.json'];
const records = files.flatMap(file => JSON.parse(fs.readFileSync(path.join(DATA,file),'utf8')).map(exercise=>({...exercise,_source:file})));
const issues=[];
const add=(ex,frame,code,detail)=>issues.push({exerciseId:ex.id,exerciseName:ex.name,source:ex._source,frame,code,detail});
for(const ex of records){
  const viz=ex.visualization;
  if(!viz?.frames?.length){add(ex,null,'MISSING_FRAMES','No visualization frames');continue;}
  const frames=viz.frames;
  if(ex.requiresCoachReview) add(ex,null,'COACH_REVIEW_REQUIRED','Original movement requires specialist review');
  if(frames.length>4) add(ex,null,'FRAME_COUNT_REVIEW',`${frames.length} frames: review if all unique positions are necessary`);
  for(let i=0;i<frames.length;i++){
    const f=frames[i],p=String(f.poseDescription||'').trim();
    if(!p) add(ex,f.frame,'EMPTY_POSE','Missing exact anatomical pose');
    if(!String(f.transitionDescription||'').trim()) add(ex,f.frame,'EMPTY_TRANSITION','Missing movement transition');
    if(f.sameImageAs != null && (!frames.some(a=>a.frame===f.sameImageAs)||f.sameImageAs===f.frame))
      add(ex,f.frame,'INVALID_IMAGE_REUSE','Reuse target is absent or self');
    if(f.sameImageAs == null && !f.imageUrl) add(ex,f.frame,'NO_GENERATED_IMAGE','No image attached to this frame record');
    if(/^(μετακίνησε|χαμήλωσε|πίεσε|έκτεινε|λύγισε|σήκωσε|φέρε|ακολούθησε|επανάφερε|κράτησε|στρίψε|τράβηξε|ξεκίνα|οδήγησε)\b/i.test(p))
      add(ex,f.frame,'INSTRUCTION_NOT_STATIC_POSE','Pose text starts with an instruction, not a frozen anatomical position');
    if(/\b(45|90)\s*(?:μοίρ|°)/i.test(p)) add(ex,f.frame,'FIXED_ANGLE_REVIEW','Check whether exact angle is justified for this movement and athlete');
    if(i>0 && f.sameImageAs==null && p===String(frames[i-1].poseDescription||'').trim())
      add(ex,f.frame,'DUPLICATE_ADJACENT_POSE','Adjacent frames have identical pose text');
  }
}
const byCode=Object.entries(issues.reduce((acc,x)=>{acc[x.code]=(acc[x.code]||0)+1;return acc;},{})).map(([code,count])=>({code,count})).sort((a,b)=>b.count-a.count);
const report={exerciseCount:records.length,frameCount:records.reduce((n,e)=>n+(e.visualization?.frames?.length||0),0),issueCount:issues.length,byCode,issues};
const output=process.argv[2]||'frame-audit-results.json';
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({exerciseCount:report.exerciseCount,frameCount:report.frameCount,issueCount:report.issueCount,byCode},null,2));
