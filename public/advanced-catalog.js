import {buildVisualization} from './visualization-sequence.js';
// Αυτοτελής γεννήτρια πρωτότυπων συνδυασμών. Οι εγγραφές είναι προτάσεις υπό αξιολόγηση,
// ΟΧΙ πιστοποιημένες ασκήσεις ή τεχνικά επαληθευμένες επιδείξεις.
const STANDING=[
 ['Reverse Lunge to Knee Drive','Οπίσθια προβολή με σταθερό γόνατο και επιστροφή σε άρση αντίθετου γονάτου'],
 ['Lateral Lunge to Balance','Πλάγια προβολή, ώθηση από το πόδι στήριξης και ισορροπία'],
 ['Split Squat to Controlled March','Ελεγχόμενο split squat και μετάβαση σε στάση εναλλάξ βηματισμού'],
 ['Cossack Squat to Rise','Πλευρική κάθοδος στο διαθέσιμο εύρος και επιστροφή στην όρθια θέση'],
 ['Hip Hinge to Single-Leg Balance','Κάμψη από τα ισχία και ελεγχόμενη μετάβαση σε μονοποδική ισορροπία'],
 ['Diagonal Step-Back to Stand','Διαγώνιο βήμα πίσω, ελεγχόμενη κάμψη ισχίων και επαναφορά'],
 ['Side Step to Squat Rise','Πλάγιο βήμα, κάθισμα και ελεγχόμενη όρθια μετάβαση'],
 ['Step-Up to Balance Hold','Ανάβαση σε χαμηλό σταθερό step και παραμονή σε ισορροπία'],
 ['Single-Leg Hinge to Reverse Step','Μονοποδική κάμψη από ισχία και μετάβαση σε οπίσθιο βήμα'],
 ['Sled March to Reset','Ελεγχόμενη ώθηση sled με μικρά βήματα και παύση για επαναφορά'],
 ['Low Lunge to Standing Rotation','Χαμηλή προβολή, επιστροφή όρθιος και ήπια θωρακική περιστροφή'],
 ['Squat to Lateral Step Hold','Ελεγχόμενο squat, πλάγιο βήμα και σταθερή ισορροπία']
];
const UPPER=[
 ['Band Anti-Rotation Reach','ελεγχόμενη αντιπεριστροφική ώθηση λάστιχου στο ύψος στέρνου','Λάστιχο αντίστασης'],
 ['Band Diagonal Press','διαγώνια πίεση λάστιχου με σταθερό κορμό','Λάστιχο αντίστασης'],
 ['Band High-to-Low Pull','έλξη λάστιχου από ψηλά προς χαμηλά χωρίς στροφή της μέσης','Λάστιχο αντίστασης'],
 ['Dumbbell Neutral-Grip Press','μονόπλευρη πίεση ελαφρού αλτήρα με ουδέτερη λαβή','Αλτήρας'],
 ['Dumbbell Suitcase Carry Hold','στατική μεταφορά/κράτημα αλτήρα στο πλάι χωρίς κλίση','Αλτήρας'],
 ['Dumbbell Front Rack Hold','κράτημα αλτήρα σε σταθερή θέση front rack','Αλτήρας'],
 ['Kettlebell Goblet Hold','σταθερό κράτημα kettlebell κοντά στο στήθος','Kettlebell'],
 ['Kettlebell Suitcase Hold','κράτημα kettlebell στο πλάι με αντιπλάγια σταθεροποίηση','Kettlebell'],
 ['Medicine Ball Forward Reach','ελεγχόμενη έκταση medicine ball μπροστά από το στέρνο','Medicine Ball'],
 ['Medicine Ball Diagonal Reach','διαγώνια μεταφορά medicine ball στο ύψος ώμου','Medicine Ball'],
 ['Cable Anti-Rotation Press','αντιπεριστροφική πίεση σε τροχαλία με ελαφρύ φορτίο','Τροχαλία'],
 ['Bodyweight Cross-Body Reach','σταυρωτή έκταση χεριών με έλεγχο θωρακικής στροφής','Βάρος σώματος']
];
const GROUND=[
 ['Bear Crawl to Kneeling Reach','Μικρά βήματα bear crawl και ελεγχόμενη μετάβαση σε γονάτισμα'],
 ['Plank Walkout to Shoulder Tap','Περπάτημα παλαμών μέχρι σανίδα και εναλλάξ shoulder tap'],
 ['Crab Walk to Hip Bridge','Ελεγχόμενο crab walk και μετάβαση σε γέφυρα ισχίων'],
 ['Half-Kneeling Rotation to Stand','Γονάτισμα, ήπια θωρακική στροφή και όρθια μετάβαση'],
 ['Quadruped Reach to Beast Hold','Τετραποδική έκταση αντίθετων άκρων και χαμηλή beast hold'],
 ['Side Plank to Bear Reset','Πλάγια σανίδα, επιστροφή σε τετραποδική βάση και bear stance'],
 ['Low Squat to Walkout','Χαμηλό κάθισμα και ελεγχόμενο περπάτημα παλαμών σε σανίδα'],
 ['Kneeling Get-Up to Lateral Step','Ανάβαση από γονάτισμα και ελεγχόμενο πλάγιο βήμα']
];
const FINISH=[
 ['Opposite Reach','έκταση αντίθετου χεριού με σταθερό θώρακα'],
 ['Shoulder Tap','ήπιο άγγιγμα αντίθετου ώμου χωρίς απώλεια ισορροπίας'],
 ['Thoracic Open','ελεγχόμενο θωρακικό άνοιγμα χωρίς στροφή της οσφύος'],
 ['Balance Pause','παύση δύο αναπνοών με τον κορμό ενεργό'],
 ['Diagonal Arm Sweep','διαγώνια κίνηση του ελεύθερου χεριού χωρίς βίαιη περιστροφή'],
 ['Slow Reverse Transition','αργή επιστροφή από τα ίδια σημεία στήριξης'],
 ['Contralateral Lift','αντίθετη άρση άκρου σε μικρό ασφαλές εύρος'],
 ['Controlled Reach Reset','έκταση χεριού και ελεγχόμενη επαναφορά']
];
const MUSCLES_BY_PATTERN={
 'Reverse Lunge to Knee Drive':['Τετρακέφαλοι','Γλουτιαίοι','Οπίσθιοι μηριαίοι','Γαστροκνήμιοι','Κορμός'],
 'Lateral Lunge to Balance':['Τετρακέφαλοι','Γλουτιαίοι','Προσαγωγοί','Μέσος γλουτιαίος','Κορμός'],
 'Split Squat to Controlled March':['Τετρακέφαλοι','Γλουτιαίοι','Οπίσθιοι μηριαίοι','Γαστροκνήμιοι','Κορμός'],
 'Cossack Squat to Rise':['Προσαγωγοί','Γλουτιαίοι','Τετρακέφαλοι','Οπίσθιοι μηριαίοι','Κορμός'],
 'Hip Hinge to Single-Leg Balance':['Γλουτιαίοι','Οπίσθιοι μηριαίοι','Ραχιαίοι','Κορμός'],
 'Diagonal Step-Back to Stand':['Γλουτιαίοι','Τετρακέφαλοι','Προσαγωγοί','Κορμός'],
 'Side Step to Squat Rise':['Γλουτιαίοι','Τετρακέφαλοι','Μέσος γλουτιαίος','Προσαγωγοί','Κορμός'],
 'Step-Up to Balance Hold':['Τετρακέφαλοι','Γλουτιαίοι','Οπίσθιοι μηριαίοι','Γαστροκνήμιοι','Κορμός'],
 'Single-Leg Hinge to Reverse Step':['Γλουτιαίοι','Οπίσθιοι μηριαίοι','Ραχιαίοι','Κορμός'],
 'Sled March to Reset':['Τετρακέφαλοι','Γλουτιαίοι','Γαστροκνήμιοι','Κορμός'],
 'Low Lunge to Standing Rotation':['Τετρακέφαλοι','Γλουτιαίοι','Προσαγωγοί','Λοξοί κοιλιακοί','Κορμός'],
 'Squat to Lateral Step Hold':['Τετρακέφαλοι','Γλουτιαίοι','Μέσος γλουτιαίος','Προσαγωγοί','Κορμός'],
 'Band Anti-Rotation Reach':['Λοξοί κοιλιακοί','Εγκάρσιος κοιλιακός','Σταθεροποιητές ώμου'],
 'Band Diagonal Press':['Δελτοειδείς','Τρικέφαλοι','Θωρακικοί','Κορμός'],
 'Band High-to-Low Pull':['Πλατύς ραχιαίος','Ρομβοειδείς','Δικέφαλοι','Κορμός'],
 'Dumbbell Neutral-Grip Press':['Δελτοειδείς','Τρικέφαλοι','Θωρακικοί','Κορμός'],
 'Dumbbell Suitcase Carry Hold':['Λοξοί κοιλιακοί','Πήχεις','Κορμός'],
 'Dumbbell Front Rack Hold':['Δελτοειδείς','Ρομβοειδείς','Πήχεις','Κορμός'],
 'Kettlebell Goblet Hold':['Δελτοειδείς','Πήχεις','Κορμός'],
 'Kettlebell Suitcase Hold':['Λοξοί κοιλιακοί','Πήχεις','Κορμός'],
 'Medicine Ball Forward Reach':['Πρόσθιοι δελτοειδείς','Θωρακικοί','Κορμός'],
 'Medicine Ball Diagonal Reach':['Δελτοειδείς','Λοξοί κοιλιακοί','Κορμός'],
 'Cable Anti-Rotation Press':['Λοξοί κοιλιακοί','Θωρακικοί','Δελτοειδείς','Κορμός'],
 'Bodyweight Cross-Body Reach':['Λοξοί κοιλιακοί','Δελτοειδείς','Κορμός'],
 'Bear Crawl to Kneeling Reach':['Δελτοειδείς','Τρικέφαλοι','Γλουτιαίοι','Τετρακέφαλοι','Κορμός'],
 'Plank Walkout to Shoulder Tap':['Θωρακικοί','Τρικέφαλοι','Δελτοειδείς','Λοξοί κοιλιακοί','Κορμός'],
 'Crab Walk to Hip Bridge':['Τρικέφαλοι','Οπίσθιοι δελτοειδείς','Γλουτιαίοι','Οπίσθιοι μηριαίοι','Κορμός'],
 'Half-Kneeling Rotation to Stand':['Γλουτιαίοι','Τετρακέφαλοι','Λοξοί κοιλιακοί','Κορμός'],
 'Quadruped Reach to Beast Hold':['Δελτοειδείς','Γλουτιαίοι','Τετρακέφαλοι','Κορμός'],
 'Side Plank to Bear Reset':['Λοξοί κοιλιακοί','Δελτοειδείς','Γλουτιαίοι','Κορμός'],
 'Low Squat to Walkout':['Τετρακέφαλοι','Γλουτιαίοι','Θωρακικοί','Τρικέφαλοι','Δελτοειδείς','Κορμός'],
 'Kneeling Get-Up to Lateral Step':['Τετρακέφαλοι','Γλουτιαίοι','Δελτοειδείς','Κορμός'],
 'Opposite Reach':['Δελτοειδείς','Κορμός'],
 'Shoulder Tap':['Δελτοειδείς','Τρικέφαλοι','Κορμός'],
 'Thoracic Open':['Ρομβοειδείς','Οπίσθιοι δελτοειδείς','Λοξοί κοιλιακοί'],
 'Balance Pause':['Γλουτιαίοι','Σταθεροποιητές ισχίου','Κορμός'],
 'Diagonal Arm Sweep':['Δελτοειδείς','Λοξοί κοιλιακοί','Κορμός'],
 'Slow Reverse Transition':['Δελτοειδείς','Γλουτιαίοι','Κορμός'],
 'Contralateral Lift':['Ραχιαίοι','Γλουτιαίοι','Κορμός'],
 'Controlled Reach Reset':['Δελτοειδείς','Κορμός']
};
const musclesFor=(baseName,actionName)=>[...new Set([...(MUSCLES_BY_PATTERN[baseName]||[]),...(MUSCLES_BY_PATTERN[actionName]||[])])];

const fmt=(id,base,action,equip,ground=false)=>{
 const [baseName,baseText]=base,[actionName,actionText]=action;
 const title=baseName+' + '+actionName;
 const setup=ground?'Στο στρώμα, οργάνωσε τις παλάμες, τα πέλματα και τη στήριξη των ώμων.':'Σε σταθερό δάπεδο, στάσου με ουδέτερη σπονδυλική στήλη και ελαφρύ φορτίο εφόσον υπάρχει.';
 const p1='Αρχική: '+setup+' Ενεργοποίησε κοιλιά και γλουτούς, χωρίς κράτημα αναπνοής.';
 const p2='Μετάβαση: '+baseText+'. Εκτέλεσε την κίνηση αργά χωρίς να ξεπερνάς το προσωπικό ελεγχόμενο εύρος.';
 const p3='Συνδυασμός: '+actionText+'. Σταμάτησε στιγμιαία, βεβαιώσου ότι μπορείς να σταθεροποιήσεις λεκάνη και ώμους και συνέχισε μόνο αν διατηρείται ο έλεγχος.';
 const p4='Επαναφορά: Επίστρεψε από την ίδια ασφαλή τροχιά στην αρχική θέση, χωρίς απότομη αλλαγή φοράς. Επανάλαβε και στις δύο πλευρές όταν η ακολουθία είναι μονόπλευρη.';
 const exercise={id:'sofia-original-'+String(id).padStart(3,'0'),name:title,discipline:'functional',level:'Advanced',category:'Full Body',muscles:musclesFor(baseName,actionName),custom:true,classification:'Custom',equipment:[equip],instructions:[p1,p2,p3,p4].join('\n'),breathing:'Εισπνοή στην προετοιμασία και στην ελεγχόμενη κάθοδο, εκπνοή κατά τη μετάβαση ή την ώθηση. Απόφυγε παρατεταμένη άπνοια.',safety:'Απαιτεί τεχνική κατάρτιση και έλεγχο από τη Sofia πριν δοθεί σε αθλούμενο. Απόφυγε αστάθεια, πόνο, κόπωση που αλλοιώνει την κίνηση και υπερβολικά φορτία. Προσάρμοσε ή αφαίρεσε τις μεταβάσεις όπου δεν υπάρχει επαρκής κινητικότητα.',phases:[p1,p2,p3,p4].map((cue,i)=>({label:['Αρχική','Μεσαία','Επόμενη','Επιστροφή'][i],cue,image:''})),source:'sofia-original-concept',verified:false,requiresCoachReview:true,reviewStatus:'pending',patterns:[baseName,actionName,'Controlled return'],newConcept:true};
 const start=ground?'Αρχική βάση στο έδαφος ή στο στρώμα, με σημεία στήριξης και αρθρώσεις τοποθετημένα για το πρώτο μοτίβο '+baseName+'.':'Όρθια αρχική θέση με πέλματα σταθερά, κορμό ουδέτερο και τον εξοπλισμό στη θέση που απαιτεί το '+baseName+'.';
 const sequence=[
  {label:'Αρχική θέση',sourceCue:start},
  {label:'Έναρξη πρώτου κινητικού μοτίβου',sourceCue:baseText+'. Ξεκίνησε την κίνηση από τα ισχία ή τα σημεία στήριξης που απαιτεί το μοτίβο, χωρίς να αλλάξεις τη θέση του εξοπλισμού.'},
  {label:'Ολοκλήρωση πρώτου μοτίβου',sourceCue:'Ολοκλήρωσε με ελεγχόμενο εύρος το '+baseName+' και σταθεροποίησε πέλματα, λεκάνη και κορμό πριν από την επόμενη κίνηση.'},
  {label:'Μετάβαση στο δεύτερο μοτίβο',sourceCue:'Χωρίς απότομη αλλαγή στήριξης, ξεκίνησε το '+actionName+': '+actionText+'.'},
  {label:'Κορυφαία θέση σύνθετης κίνησης',sourceCue:'Ολοκλήρωσε το '+actionName+' στο σταθερό, ελεγχόμενο τελικό σημείο: '+actionText+'.'},
  {label:'Ελεγχόμενη επαναφορά',sourceCue:p4}
 ];
 exercise.visualization=buildVisualization(exercise,sequence);
 exercise.modelProfile=exercise.visualization.referenceProfile;
 return exercise;
};
export function buildOriginalConcepts(){
 const items=[];let id=1;
 for(const base of STANDING)for(const action of UPPER){
  // Προτάσεις χωρίς συγχρονισμένο βαρύ overhead φορτίο ή άλματα.
  items.push(fmt(id++,base,action,action[2]));
 }
 for(const base of GROUND)for(const finish of FINISH)items.push(fmt(id++,base,finish,'Βάρος σώματος',true));
 return items;
}
