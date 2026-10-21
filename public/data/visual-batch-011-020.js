// Curated ground-truth frames for Sofia exercises 011–020.
// Draft render specifications; images must be visually reviewed before approval.
export const BATCH_011_020 = {
"functional-011": {name:"Dumbbell Shoulder Press",equipment:["two dumbbells"],frames:[
["Αρχική θέση","Standing upright with both dumbbells at shoulder height, wrists stacked above elbows, ribs down and feet grounded."],
["Έναρξη πίεσης","Both dumbbells move upward in a controlled shoulder press, wrists neutral, no lumbar hyperextension."],
["Τελική θέση","Both dumbbells above shoulders with arms nearly straight, head neutral, shoulders elevated naturally."],
["Ελεγχόμενη επαναφορά","Both dumbbells descend symmetrically toward shoulder level while torso remains vertical."]]},
"functional-012": {name:"Dumbbell Romanian Deadlift",equipment:["two dumbbells"],frames:[
["Αρχική θέση","Upright stance, two dumbbells in front of thighs, knees soft, spine neutral."],
["Κίνηση από τα ισχία","Hips move backward; dumbbells slide close to thighs, knees maintain slight flexion."],
["Κάτω θέση","Controlled hip hinge with dumbbells close to shins, neutral back, hips behind heels, no spinal rounding."],
["Επιστροφή","Hip extension brings the torso upright, dumbbells finish against thighs."]]},
"functional-013": {name:"Standing Calf Raise",equipment:["bodyweight","stable support rail"],frames:[
["Αρχική θέση","Standing upright on flat ground with forefingers lightly resting on a sturdy vertical rail."],
["Άρση φτερνών","Both heels rise while forefeet stay on the floor and ankles remain aligned."],
["Κορύφωση","Highest comfortable heel raise with straight but not locked knees and balanced ankles."],
["Επαναφορά","Both heels lower under control until whole feet rest flat on floor."]]},
"functional-014": {name:"Wall Sit",equipment:["flat wall"],frames:[
["Αρχική θέση","Back and pelvis lightly against a solid flat wall, feet placed forward on stable floor."],
["Κάθοδος","Back glides down wall, knees bend gradually while feet remain fully grounded."],
["Ισομετρική θέση","Wall sit at comfortable knee angle, torso supported on wall, shins approximately vertical, knees tracking feet."],
["Ανάβαση","Push through feet to slide back up wall without knee collapse."]]},
"functional-015": {name:"Lateral Lunge",equipment:["bodyweight"],frames:[
["Αρχική θέση","Standing tall with both feet under hips, hands clasped in front of sternum."],
["Πλάγιο βήμα","A long side step to the right with whole right foot flat and left leg nearly straight."],
["Κάτω θέση","Right hip shifts backward and right knee bends over the right foot while left leg remains extended."],
["Επιστροφή στο κέντρο","Push from the right leg to step back to a tall parallel stance."]]},
"functional-016": {name:"Standing Resistance Band Row",equipment:["resistance band","secure chest-height anchor"],frames:[
["Αρχική θέση","Facing a secure chest-height band anchor, both hands grip band handles, arms almost straight, feet staggered."],
["Έναρξη έλξης","Elbows bend and track along sides, band remains anchored and taut."],
["Τελική έλξη","Band handles approach lower ribs, shoulder blades retract without trunk arching."],
["Επαναφορά","Hands extend forward slowly while maintaining light band tension and upright posture."]]},
"functional-017": {name:"Side Plank on Knees",equipment:["exercise mat"],frames:[
["Αρχική θέση","Side-lying on mat, bottom elbow underneath shoulder, knees bent with knees stacked, pelvis on floor."],
["Άρση λεκάνης","Lift pelvis away from floor supported by forearm and knees, avoid twisting."],
["Ισομετρική θέση","Shoulder, hip and knee form a clear straight line, head aligned with torso and hips elevated."],
["Ελεγχόμενη κάθοδος","Pelvis lowers toward mat while shoulders and knees remain aligned."]]},
"functional-018": {name:"Standing Biceps Curl",equipment:["two dumbbells"],frames:[
["Αρχική θέση","Standing tall, elbows close to torso, two dumbbells at sides, neutral wrists."],
["Κάμψη αγκώνων","Elbows flex to bring dumbbells upward without swinging shoulders or hips."],
["Κορυφή κίνησης","Dumbbells near front of shoulders, elbows fixed at the sides, wrists neutral."],
["Αργή έκταση","Dumbbells lower to near full elbow extension without trunk rocking."]]},
"functional-019": {name:"Kneeling Push-Up",equipment:["exercise mat"],frames:[
["Αρχική θέση","Hands on mat slightly wider than shoulders; knees supported; shoulders, hips and knees form a straight line."],
["Κάθοδος","Elbows bend and chest moves toward floor with trunk and hips remaining rigid as a unit."],
["Κάτω θέση","Chest near mat, elbows angled diagonally behind torso, no sagging pelvis or craned neck."],
["Επιστροφή","Push through palms to extend arms and return to straight shoulder–hip–knee alignment."]]},
"functional-020": {name:"Standing Hip Hinge Drill",equipment:["bodyweight"],frames:[
["Αρχική θέση","Stand with feet hip-width apart, knees softly bent, arms crossed over chest, head neutral."],
["Μεταφορά ισχίων πίσω","Hips slide backward as torso inclines forward at hip joints with stable spinal curves."],
["Τελική κλίση","Controlled forward torso inclination, knees slightly bent, spine neutral, hips back and feet rooted."],
["Επιστροφή","Extend at hip joints to stand fully tall without leaning backward."]]}
};
export function curatedFrames(exercise){
 const entry=BATCH_011_020[exercise?.id];
 return entry?entry.frames.map(([label,cue],i)=>({phase:i+1,labelEl:label,cue,reviewStatus:"pending_visual_review"})):null;
}
