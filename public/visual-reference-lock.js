// Fixed approved visual references: both photos also define the studio background.
export const VISUAL_REFERENCES=Object.freeze({
 female:Object.freeze({profile:'female',file:'athletico-female-reference.jpg',url:'/images/athletes/athletico-female-reference.jpg',sha256:'59c9c2fc50bf64bc9e7e462084b068d2bf2272741b84e0138426b63b4df081c6'}),
 male:Object.freeze({profile:'male',file:'athletico-male-reference.jpg',url:'/images/athletes/athletico-male-reference.jpg',sha256:'132c39d363c91a4d49e117c408471bfcfa99d018e003b26ccec6519261569bd5'})
});
export function modelProfileFor(exercise={}){
 if(exercise.modelProfile==='female'||exercise.modelProfile==='male')return exercise.modelProfile;
 const prompt=String(exercise.imagePrompts?.[0]?.prompt||'');
 if(/\b(female|woman|brunette)\b/i.test(prompt))return 'female';
 if(/\b(male|man)\b/i.test(prompt))return 'male';
 const digits=String(exercise.id||'').match(/(\d+)$/);
 return digits?(Number(digits[1])%2?'female':'male'):'female';
}
export function lockedVisualPrompt(exercise={},phaseCue='',profile=modelProfileFor(exercise)){
 const ref=VISUAL_REFERENCES[profile];if(!ref)throw new Error('No approved Sofia model reference selected');
 const equipment=Array.isArray(exercise.equipment)?exercise.equipment.join(', '):String(exercise.equipment||'Bodyweight');
 return ['MANDATORY SOFIA VISUAL REFERENCE LOCK — DO NOT OVERRIDE.',
 'Attach and use this exact approved image as the sole athlete identity and studio/background reference: '+ref.url+' (SHA-256 '+ref.sha256+').',
 'Use only the person shown in that attached reference. Preserve the same face, hair, body proportions, skin tone, clothing and shoes.',
 'Use only the ATHLETICO studio/background visible in that same reference. Preserve its marble, wood, lighting, furnishings and ATHLETICO sign. Do not invent, replace or add a model, setting, logo, text or props.',
 'Show one athlete only. If the reference cannot be attached and followed, STOP and do not generate.',
 'If a ready-made exercise image is supplied, use it only for pose, movement and equipment. Replace its person and background with the approved reference model and studio.',
 'Exercise: '+String(exercise.name||exercise.title||'Custom exercise')+'. Equipment: '+equipment+'. Movement phase: '+String(phaseCue||exercise.instructions||'Follow the exercise instructions exactly.'),
 'Show the complete body and equipment. Keep the same camera, framing, lighting and studio across every frame. Do not invent transitions.'].join(' ');
}
