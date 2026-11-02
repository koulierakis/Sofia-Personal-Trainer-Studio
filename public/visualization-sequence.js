import {VISUAL_REFERENCES,modelProfileFor,lockedVisualPrompt} from './visual-reference-lock.js';

const COMPLETE_BODY='Πλήρες σώμα μέσα στο κάδρο. Δείξε καθαρά πέλματα και σημεία στήριξης, προσανατολισμό των γονάτων, θέση ισχίων και κορμού, αυχένα, ώμους, αγκώνες, καρπούς και λαβή. Δείξε τη διαδρομή και τον προσανατολισμό του εξοπλισμού. Ακολούθησε μόνο τις γωνίες και τις θέσεις που τεκμηριώνει η περιγραφή· μην επινοήσεις αριθμητικές γωνίες ή τεχνική.';
const MANUAL_STARTS={
 'functional-001':'Όρθια θέση, πέλματα περίπου στο άνοιγμα των ώμων, ολόκληρα στο έδαφος, κορμός ουδέτερος και χέρια μπροστά για ισορροπία.',
 'functional-002':'Όρθια θέση με πέλματα στο άνοιγμα ισχίων, λεκάνη στραμμένη μπροστά και κορμός σταθερός.',
 'functional-003':'Όρθια θέση με πέλματα στο άνοιγμα ισχίων, κορμός ενεργός και βλέμμα μπροστά.',
 'functional-004':'Κεκλιμένη σανίδα με παλάμες σε σταθερό, μη ολισθηρό πάγκο λίγο πιο ανοιχτά από τους ώμους· πόδια πίσω και σώμα σε ευθεία.',
 'functional-005':'Ύπτια θέση, γόνατα λυγισμένα, πέλματα επίπεδα στο έδαφος και χέρια χαλαρά δίπλα στο σώμα.',
 'functional-006':'Γονατιστή προετοιμασία στο στρώμα, πήχεις κάτω από τους ώμους, γόνατα στο έδαφος και αυχένας ουδέτερος.',
 'functional-007':'Ύπτια θέση, χέρια προς την οροφή και ισχία και γόνατα περίπου στις 90 μοίρες· λεκάνη σταθερή.',
 'functional-008':'Τετραποδική θέση, παλάμες κάτω από ώμους, γόνατα κάτω από ισχία, πλάτη ουδέτερη και βλέμμα προς το έδαφος.',
 'functional-009':'Όρθια θέση μπροστά από χαμηλό και σταθερό step, πέλματα στο έδαφος και κορμός σταθερός.',
 'functional-010':'Όρθια θέση με έναν αλτήρα σε κάθε χέρι, λαβές ουδέτερες, πέλματα σταθερά και ώμοι χαλαροί.'
};

const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('el-GR');
const sentences=s=>String(s??'').split(/(?<=[.!?])\s+|\n+/).map(clean).filter(Boolean);
function movementCue(frame){return clean(frame?.sourceCue||frame?.cue||frame?.poseDescription||frame?.label||frame?.description);}
function uniqueFrames(source){
 const result=[];let previous='';
 for(const frame of source||[]){const cue=movementCue(frame);if(!cue)continue;const key=norm(cue);if(key===previous)continue;previous=key;result.push({label:clean(frame.label||frame.labelEl||frame.phaseLabel)||'Κίνηση',cue});}
 return result;
}
function deriveStart(exercise,cues){
 if(MANUAL_STARTS[exercise.id])return MANUAL_STARTS[exercise.id];
 const first=movementCue(cues?.[0]);
 if(first)return first;
 const lead=sentences(exercise.instructions||exercise.description)[0];
 if(lead)return 'Πριν από την πρώτη επανάληψη: '+lead;
 return 'Σταθερή αρχική θέση πριν από την κίνηση «'+(exercise.name||exercise.title||'άσκηση')+'», με τον εξοπλισμό τοποθετημένο όπως ορίζουν οι οδηγίες.';
}
function derivedSource(exercise){
 const lines=sentences(exercise.instructions||exercise.description);
 if(!lines.length)return [{label:'Εκτέλεση',sourceCue:'Ακολούθησε αποκλειστικά τις καταχωρισμένες οδηγίες και διατήρησε ελεγχόμενη στάση.'}];
 return lines.map((sourceCue,i)=>({label:i===0?'Προετοιμασία':'Φάση κίνησης '+i,sourceCue}));
}
function promptFor(exercise,profile,phase,index,total,previous,next){
 const phaseCue=phase.poseDescription;
 const transition=`Προηγούμενο καρέ: ${previous||'αρχική προετοιμασία'}. Επόμενο καρέ: ${next||'ολοκλήρωση της επανάληψης'}.`;
 return [lockedVisualPrompt(exercise,phaseCue,profile),
   `Frame ${index+1} of ${total}. ${phase.label}.`,
   `Ακριβής στάση του σώματος σε αυτό το στιγμιότυπο: ${phaseCue}`,
   COMPLETE_BODY,
   `Συνέχεια της κίνησης: ${transition}`,
   `Οδηγίες άσκησης: ${clean(exercise.instructions||exercise.description)}`,
   `Μυϊκές ομάδες: ${(exercise.muscles||exercise.primaryMuscles||[]).join?.(', ')||exercise.muscles||'σύμφωνα με την περιγραφή'}.`,
   'Μία μόνο φωτογραφική στάση, χωρίς κολάζ, βέλη, λεζάντες ή πρόσθετα άκρα. Αν η πηγή δεν καθορίζει ασφαλή στάση, σταμάτησε και ζήτησε έλεγχο προπονητή.'
 ].filter(Boolean).join(' ');
}

export function buildVisualization(exercise={},sourceFrames=null){
 const profile=modelProfileFor(exercise),reference=VISUAL_REFERENCES[profile];
 const raw=Array.isArray(sourceFrames)&&sourceFrames.length?sourceFrames:derivedSource(exercise);
 const cues=uniqueFrames(raw);
 const start=deriveStart(exercise,raw);
 const interior=cues.filter(x=>norm(x.cue)!==norm(start));
 if(!interior.length){const fallback=sentences(exercise.instructions||exercise.description).slice(1);for(const cue of fallback)interior.push({label:'Εκτέλεση',cue});}
 const distinct=interior.slice(0,18);
 const base=[{label:'Αρχική θέση',poseDescription:start},...distinct.map((x,i)=>({label:x.label||`Φάση ${i+1}`,poseDescription:x.cue}))];
 if(base.length===1)base.push({label:'Κύρια στάση',poseDescription:'Εκτέλεσε την περιγραφόμενη κίνηση μέχρι το ελεγχόμενο τελικό σημείο: '+clean(exercise.instructions||exercise.description)});
 const total=base.length+1;
 const frames=base.map((phase,i)=>({
   frame:i+1,label:phase.label,poseDescription:phase.poseDescription,
   transitionDescription:`${i===0?'Ξεκίνημα από την αρχική θέση.':'Ακολούθησε την προηγούμενη στάση.'} ${phase.poseDescription}${i<base.length-1?' Προετοίμασε ομαλή μετάβαση προς: '+base[i+1].poseDescription:''}`,
   referenceProfile:profile,referenceImage:reference.url,referenceSha256:reference.sha256,
   sameImageAs:null,
   prompt:promptFor(exercise,profile,phase,i,total,base[i-1]?.poseDescription,base[i+1]?.poseDescription)
 }));
 frames.push({frame:total,label:'Τελική επαναφορά — ίδια με την αρχική θέση',poseDescription:frames[0].poseDescription,
   transitionDescription:'Επανάφερε το σώμα ακριβώς στην αρχική θέση. Δεν δημιουργείται νέα εικόνα· χρησιμοποιείται αυτούσια η εικόνα του Frame 1.',
   referenceProfile:profile,referenceImage:reference.url,referenceSha256:reference.sha256,sameImageAs:1,
   prompt:'REUSE THE EXACT IMAGE FILE GENERATED FOR FRAME 1. Do not generate or alter another model, pose, camera, equipment or background.'});
 return {version:1,referenceProfile:profile,referenceImage:reference.url,referenceSha256:reference.sha256,
   promptTemplate:'MANDATORY SOFIA VISUAL REFERENCE LOCK — attach this exact approved model-and-studio photo '+reference.url+' (SHA-256 '+reference.sha256+'). Use that person and that background only. Preserve the same identity, facial features, hair, proportions, clothes, shoes, camera, framing and studio in every frame. Generate one image for one frame from its poseDescription; never invent another model or background. If the reference image cannot be attached, stop. The final frame with sameImageAs must reuse the source image file exactly and must not be generated again.',
   fixedVisualContext:'Μοντέλο και περιβάλλον/φόντο παραμένουν ακριβώς όπως στην εγκεκριμένη φωτογραφία αναφοράς. Αλλάζει μόνο η στάση και η φάση της άσκησης που περιγράφεται σε κάθε καρέ.',
   frameCount:frames.length,closingFrameReuses:1,coachReviewRequired:Boolean(exercise.requiresCoachReview||exercise.newConcept||exercise.custom),
   frames};
}

export function ensureVisualization(exercise={}){
 const current=exercise.visualization;
 const complete= current?.version===1&&Array.isArray(current.frames)&&current.frames.length>=3&&
   current.frames.every(frame=>frame.prompt&&frame.referenceImage&&frame.referenceSha256&&'sameImageAs'in frame);
 if(complete)return exercise;
 if(current?.version===1&&Array.isArray(current.frames)&&current.frames.length>=2)
   return {...exercise,visualization:buildVisualization(exercise,current.frames)};
 return {...exercise,visualization:buildVisualization(exercise)};
}
