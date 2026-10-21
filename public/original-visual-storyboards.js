// Original Advanced series — 6 phase image storyboard. Visuals are pending review.
const steps=[
 ["Αρχική θέση","Initial setup: stable support and correct equipment grip."],
 ["Πρώτη κίνηση","First movement: initiate the first pattern with controlled joint alignment."],
 ["Ενδιάμεση μετάβαση","Transition: complete the first movement and establish a stable position before changing patterns."],
 ["Συνδυασμένη κίνηση","Combination: perform the second movement without unwanted spinal rotation or compensatory acceleration."],
 ["Έκκεντρη επαναφορά","Controlled return: reverse the second movement and maintain stable foot, hand and equipment contacts."],
 ["Τελική επαναφορά","Final reset: reverse the first movement and finish in the original balanced setup."]
];
export function originalAdvancedFrames(x){
 if(!x?.newConcept)return null;
 const cues=Array.isArray(x.phases)?x.phases.map(p=>p.cue||''):[];
 const parts=Array.isArray(x.patterns)?x.patterns:[x.name];
 return steps.map(([label,description],index)=>({
   phase:index+1,labelEl:label,
   cue:description+" First pattern: "+parts[0]+". Second pattern: "+parts[1]+". Greek coaching reference: "+(cues[Math.min(index,cues.length-1)]||x.instructions),
   image:null,imageStatus:"not_generated",reviewStatus:"pending_visual_review",
   requiresCoachReview:true
 }));
}
