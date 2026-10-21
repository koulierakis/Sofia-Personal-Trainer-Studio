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
   prompt:"Photorealistic professional fitness instruction image. "+(Number(x.id.slice(-1))%2===0?"Fictional Greek Mediterranean woman aged 26 with dark shoulder-length hair, black sports bra and tight black leggings.":"Fictional Greek Mediterranean man aged 27 with short dark hair, black t-shirt and fitted black training pants.")+" Same model, outfit, studio and camera across all phases; clean modern high-end personal training studio with neutral lighting and no background text. Exercise: "+x.name+". Equipment: "+(x.equipment||[]).join(", ")+". Phase "+(index+1)+" of six: "+label+". "+description+" First movement: "+parts[0]+". Second movement: "+parts[1]+". Maintain plausible load path, balance, grip, and joint alignment. Show the full body in a fixed three-quarter view, no annotations or watermark. Pending coach biomechanical review.",
   image:null,imageStatus:"not_generated",reviewStatus:"pending_visual_review",
   requiresCoachReview:true
 }));
}
