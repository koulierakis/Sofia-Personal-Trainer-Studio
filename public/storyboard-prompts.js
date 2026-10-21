import {curatedFrames} from './data/visual-batch-011-020.js';
// Reproducible DALL-E-ready instructions, not generated or validated images.
// Ensure every phase is a separate complete prompt with all visual invariants.
const models={
 female:"A fictional Greek/Mediterranean athletic woman aged 26, dark shoulder-length hair, wearing ONLY a black sports bra and tight opaque black leggings, dark training shoes.",
 male:"A fictional Greek/Mediterranean athletic man aged 27, short dark hair, wearing ONLY a black short-sleeved training t-shirt and tight black training pants, dark training shoes."
};
const STUDIO="Inside a luxury modern personal training studio, minimalist exercise equipment, clean uncluttered interior, neutral professional studio lighting, no logos, no text in the background.";
const labels4=["Initial Setup","Movement Initiation","Peak Contraction / End Position","Controlled Return"];
const labels6=["Initial Setup","First Movement","Intermediate Transition","Peak / Completion","Eccentric Return","Final Reset"];
const greek6=["Αρχική θέση","Πρώτη κίνηση","Ενδιάμεση μετάβαση","Κορύφωση","Έκκεντρη επαναφορά","Τελική επαναφορά"];
const greek4=["Αρχική θέση","Εκτέλεση","Ολοκλήρωση","Επιστροφή"];
const clean=x=>String(x??'').replace(/\s+/g,' ').trim();
export function exerciseStoryboard(exercise){
 const complex=!curatedFrames(exercise)&&Boolean(exercise.newConcept||exercise.requiresCoachReview||/advanced/i.test(exercise.level||'')||/complex|flow|burpee|clean.*press|squat.*press|lunge.*press|crawl.*row/i.test(clean(exercise.name)));
 const count=complex?6:4;
 const labels=complex?labels6:labels4,gr=complex?greek6:greek4;
 const existing=Array.isArray(exercise.phases)?exercise.phases:[];
 const title=clean(exercise.name||exercise.title||exercise.gr)||'Unnamed exercise';
 const equipment=Array.isArray(exercise.equipment)?exercise.equipment.join(', '):clean(exercise.equipment)||'bodyweight';
 const instructions=clean(exercise.instructions||exercise.description);
 const character=models[/\d$/.test(exercise.id||'')&&Number((exercise.id||'').slice(-1))%2===0?'male':'female'];
 const curated=curatedFrames(exercise);
 const cues=curated?curated.map(p=>p.cue):existing.map(p=>clean(p.cue||p.description||p.label));
 return labels.map((phase,i)=>({
   phase:i+1,label:phase,labelEl:gr[i],
   status:"prompt_only",
   prompt:[
    "Photorealistic professional fitness biomechanics instructional photograph.",
    character,STUDIO,
    "Show the SAME model, identity, hairstyle, outfit, body proportions, studio, exact equipment, fixed camera and lighting in every image of this exercise series.",
    "Full body visible including both hands and feet, camera at three-quarter side view, realistic joint articulation and credible load mechanics.",
    "Exercise: "+title+".",
    "Equipment: "+equipment+".",
    "Sequence frame "+(i+1)+" of "+count+" — "+phase+".",
    "Exercise instructions (source reference, preserve mechanics): "+instructions+".",
    "This frame's source-based movement cue: "+(cues[Math.min(i,cues.length-1)]||("Depict "+phase.toLowerCase()+" according to the supplied movement instructions."))+".",
    "Make this a single distinct movement phase, not a collage. Use anatomically credible balance, controlled range of motion, realistic hand placement and safe load path.",
    "Do not invent equipment or add accessories. No captions, watermarks, arrows, typography, anatomical overlays or duplicate limbs.",
    "If the source instructions do not specify a unique pose for this intermediate phase, require trainer review rather than inventing an unsafe transition."
   ].join(" ")
 }));
}
