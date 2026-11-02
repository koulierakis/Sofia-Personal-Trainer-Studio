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
function techniqueDetails(exercise, cue, label=''){
 const legacy=String(exercise.id||'').startsWith('hybrid-')?exercise.instructions:'';
 const name=norm([exercise.name,exercise.title,exercise.patterns?.join?.(' '),cue,legacy].filter(Boolean).join(' ')), phase=norm(label+' '+cue);
 const notes=[];
 if(/squat|thruster|καθισ|goblet/.test(name))notes.push('Πέλματα ολόκληρα στο δάπεδο με πίεση σε φτέρνα, βάση μεγάλου δακτύλου και βάση μικρού δακτύλου· γόνατα ακολουθούν την κατεύθυνση των δακτύλων. Κάμψη ισχίων και γονάτων μαζί, λεκάνη ελεγχόμενη και θώρακας στοιβαγμένος πάνω από τη λεκάνη.');
 if(/lunge|split squat|προβολ|step-back|knee drive/.test(name))notes.push('Στην προβολή, κράτησε τα πέλματα σε δύο σταθερές τροχιές, τη λεκάνη στραμμένη μπροστά και το μπροστινό γόνατο στην κατεύθυνση των δακτύλων. Κατέβασε το πίσω γόνατο ελεγχόμενα· στην άνοδο πίεσε όλο το μπροστινό πέλμα και σταθεροποίησε πριν από άρση γονάτου ή αλλαγή στήριξης.');
 if(/hinge|deadlift|rdl|hip thrust|swing/.test(name))notes.push('Η άρθρωση ξεκινά από τα ισχία: μετακίνησε τη λεκάνη πίσω, κράτησε μικρή μαλακή κάμψη στα γόνατα και ουδέτερη σπονδυλική στήλη. Το φορτίο μένει κοντά στα πόδια ή στο σώμα· δεν υπερεκτείνεται η μέση στην κορυφή.');
 if(/row|pull|κωπηλα|έλξ/.test(name))notes.push('Στην έλξη, κράτησε τον αυχένα μακρύ και τους ώμους μακριά από τα αυτιά. Οδήγησε τον αγκώνα προς τα πίσω στη διαδρομή που ορίζει η άσκηση, χωρίς τίναγμα ή στροφή του κορμού· επέστρεψε το φορτίο ελεγχόμενα.');
 if(/press|push-up|push up|κάμψ|πιέσ|thruster/.test(name))notes.push('Στην ώθηση, κράτησε καρπούς και αγκώνες ευθυγραμμισμένους με τη διαδρομή του φορτίου, πλευρά πάνω από λεκάνη και αυχένα ουδέτερο. Μην ανασηκώνεις τους ώμους και μην αντισταθμίζεις με υπερέκταση της μέσης.');
 if(/plank|bear|crawl|bird dog|side plank|σανίδ|τετραποδ/.test(name))notes.push('Στη στήριξη, πίεσε ενεργά το έδαφος, κράτησε τις ωμοπλάτες σταθερές, την κοιλιά ενεργή και τη λεκάνη χωρίς βύθιση ή στροφή. Ο αυχένας συνεχίζει τη γραμμή της σπονδυλικής στήλης και τα σημεία στήριξης παραμένουν σαφή.');
 if(/bear crawl|bear hold|beast/.test(name))notes.push('Τοποθέτησε παλάμες κάτω από ώμους και γόνατα κάτω από ισχία, δίπλωσε τα δάχτυλα των ποδιών και αιώρησε τα γόνατα λίγο πάνω από το έδαφος. Σε κάθε βήμα μετακίνησε αντίθετο χέρι και πόδι μικρή απόσταση, κρατώντας τη λεκάνη χαμηλή και σταθερή.');
 if(/side plank/.test(name))notes.push('Στήριξε τον αγκώνα ακριβώς κάτω από τον ώμο, στοίβαξε τους ώμους και κράτησε το σώμα σε ευθεία από κεφάλι έως φτέρνες. Ανύψωσε τη λεκάνη χωρίς να κυλήσεις προς τα εμπρός ή πίσω.');
 if(/bird dog|quadruped reach/.test(name))notes.push('Από τετραποδική θέση, έκτεινε αντίθετο χέρι και πόδι μέχρι να ευθυγραμμιστούν με τον κορμό, χωρίς να σηκώσεις τη λεκάνη ή να στρίψεις την πλάτη. Επέστρεψε παλάμη και γόνατο κάτω από τους αντίστοιχους ώμους και ισχίο.');
 if(/hip thrust|glute bridge|hip bridge|γέφυρα/.test(name))notes.push('Στήριξε τις ωμοπλάτες στον πάγκο ή την πλάτη στο στρώμα, πέλματα σταθερά και γόνατα στην ίδια κατεύθυνση με τα δάχτυλα. Ανύψωσε τη λεκάνη με σύσπαση γλουτών μέχρι ο κορμός να ευθυγραμμιστεί, χωρίς να καμπυλώσεις τη μέση.');
 if(/kettlebell swing/.test(name))notes.push('Κράτησε το kettlebell με δύο χέρια και ώμους ενεργούς. Οδήγησε το βάρος πίσω ανάμεσα στους μηρούς με hip hinge και ώθησε τα ισχία μπροστά για να αιωρηθεί· τα χέρια καθοδηγούν, δεν σηκώνουν το βάρος με τους ώμους.');
 if(/jump|bound|burpee|άλμα|πλειομετρ/.test(name))notes.push('Πριν από άλμα, φόρτισε ισχία και γόνατα χωρίς να καταρρεύσουν προς τα μέσα. Προσγειώσου με τα δύο πέλματα στο προβλεπόμενο σημείο, απορρόφησε την πρόσκρουση και σταθεροποίησε πριν συνεχίσεις.');
 if(/jump|bound|burpee|άλμα|πλειομετρ/.test(name))notes.push('Στην προσγείωση, προσγειώσου ήσυχα στο μέσο του πέλματος και απορρόφησε την πρόσκρουση με αστράγαλο, γόνατο και ισχίο στην ίδια κατεύθυνση. Σταθεροποίησε πλήρως πριν από την επόμενη επανάληψη.');
 if(/carry|farmer|suitcase/.test(name))notes.push('Κράτησε κορμό ψηλό, λεκάνη οριζόντια, ώμους ισότιμους και καρπό ουδέτερο. Το φορτίο μένει δίπλα στο σώμα χωρίς να σε τραβά σε πλάγια κλίση ή στροφή.');
 if(/calf raise|calf raise|γάμπ|ανυψώσεις? γαμπ/.test(name))notes.push('Στήριξε το βάρος ισότιμα στο μεγάλο και μικρό δάκτυλο και κράτησε τα γόνατα σταθερά. Ανύψωσε τις φτέρνες όσο ελέγχεις, χωρίς αναπήδηση ή κύλισμα των αστραγάλων, και κατέβασε αργά μέχρι την αρχική θέση.');
 if(/wall sit|ισομετρικ.*καθισ|κάθισμα στον τοίχο/.test(name))notes.push('Ακούμπησε την πλάτη στον τοίχο, κράτησε τα πέλματα ολόκληρα στο δάπεδο και τα γόνατα στην κατεύθυνση των δακτύλων. Μοίρασε το βάρος και στα δύο πόδια, κράτησε τον κορμό σταθερό και μην πιέζεις βαθύτερη θέση από αυτήν που ελέγχεις.');
 if(/biceps curl|hammer curl|δικεφάλ|κάμψη αγκώ/.test(name))notes.push('Κράτησε τους αγκώνες κοντά στα πλευρά και τους βραχίονες σταθερούς. Κάμψε τους αγκώνες χωρίς αιώρηση κορμού ή μετακίνηση ώμων, κράτησε τους καρπούς ευθείς και χαμήλωσε το βάρος αργά.');
 if(/dead bug/.test(name))notes.push('Ξάπλωσε ανάσκελα, κράτησε τα γόνατα πάνω από τα ισχία και τα χέρια προς την οροφή. Κατέβασε αντίθετο χέρι και πόδι μόνο όσο η λεκάνη μένει σταθερή και η μέση δεν αποκολλάται από το στρώμα· επέστρεψε και άλλαξε πλευρά.');
 if(/medicine ball.*slam|overhead.*slam|slam/.test(name))notes.push('Σήκωσε τη medicine ball πάνω από το κεφάλι με πλευρά ελεγχόμενα και πέταξέ την δυναμικά μπροστά και κάτω χρησιμοποιώντας ισχία και κορμό. Ακολούθησε την μπάλα με λυγισμένα γόνατα, κράτησε τα δάχτυλα μακριά από την τροχιά αναπήδησης και μάζεψέ την μόνο όταν σταματήσει.');
 if(/wall ball|medicine ball.*wall/.test(name))notes.push('Κράτησε τη medicine ball μπροστά από το στέρνο, εκτέλεσε ελεγχόμενο squat με πέλματα σταθερά και γόνατα στην κατεύθυνση των δακτύλων και στην άνοδο πέταξε την μπάλα στον στόχο. Υποδέξου την με μαλακούς αγκώνες και γόνατα πριν από την επόμενη κάθοδο.');
 if(/snatch|hang clean|clean and press|clean/.test(name))notes.push('Ξεκίνησε με το φορτίο κοντά στο σώμα και ώθησε από τα ισχία και τα πόδια, όχι με τράβηγμα της μέσης. Οδήγησε τον αγκώνα κοντά στο σώμα και υποδέξου το βάρος σε σταθερή θέση καρπού και ώμου· ολοκλήρωσε την επανάληψη πριν ξεκινήσεις την κάθοδο.');
 if(/woodchop|wood chopper|woodchopper/.test(name))notes.push('Οδήγησε το βάρος διαγώνια από τον ώμο προς το αντίθετο ισχίο με έλεγχο. Κράτησε λαβή σταθερή, γόνατα μαλακά και κορμό ενεργό· η κίνηση δεν γίνεται με απότομη στρέψη της μέσης.');
 if(/windmill/.test(name))notes.push('Στήριξε το φορτίο πάνω από τον ώμο με αγκώνα σταθερό και καρπό ευθύ. Στείλε το ισχίο προς τα πίσω και λύγισε πλάγια τον κορμό από το ισχίο, διατηρώντας την άνω πλευρά επιμηκυμένη και το φορτίο πάνω από τη βάση στήριξης. Επανέλαβε την άνοδο ελεγχόμενα.');
 if(/man maker/.test(name))notes.push('Κράτησε τους αλτήρες σταθερά σε ψηλή σανίδα, με καρπούς κάτω από ώμους και κορμό ακίνητο. Εκτέλεσε την έλξη ανά πλευρά χωρίς να στρίψει η λεκάνη, ολοκλήρωσε την κάμψη, φέρε τα πέλματα έξω από τα χέρια και σήκωσε τους αλτήρες στους ώμους με έλεγχο πριν από την όρθια θέση.');
 if(/world.*greatest|stretch flow|mobility flow/.test(name))notes.push('Κινήσου αργά μέσα στο ανώδυνο εύρος, διατηρώντας σταθερά τα σημεία στήριξης. Ολοκλήρωσε κάθε θέση πριν αλλάξεις πλευρά και μην πιέζεις άρθρωση ή μέση για μεγαλύτερο εύρος.');
 if(/rotation|twist|rotat|περιστροφ/.test(name))notes.push('Η στροφή είναι ελεγχόμενη και ξεκινά από τον θώρακα, με πέλματα σταθερά και λεκάνη χωρίς ανεξέλεγκτη περιστροφή. Μην εξαναγκάζεις την οσφυϊκή μοίρα στο τελικό εύρος.');
 if(/anti.?rotation/.test(name))notes.push('Στάσου πλάγια ως προς το σημείο αγκύρωσης, κράτησε το λάστιχο ή τη λαβή μπροστά από το στέρνο με δύο χέρια και πίεσε ευθεία μπροστά μόνο όταν η λεκάνη και ο θώρακας μένουν στραμμένοι εμπρός. Στην επαναφορά φέρε τα χέρια ξανά στο στέρνο χωρίς να σε περιστρέψει το λάστιχο.');
 if(/band diagonal press|διαγώνια πίεση/.test(name))notes.push('Κράτησε το λάστιχο με ασφαλή λαβή κοντά στον ώμο και πίεσέ το διαγώνια εμπρός-πάνω, ακολουθώντας την αντίσταση χωρίς να γυρίσουν λεκάνη και γόνατα. Ο καρπός μένει σε ευθεία με τον πήχη.');
 if(/high.to.low pull|υψηλή.*χαμηλή/.test(name))notes.push('Με το λάστιχο αγκυρωμένο ψηλότερα από τον ώμο, ξεκίνα με τα χέρια ψηλά και τράβηξε προς την αντίθετη πλευρά του ισχίου με αγκώνα ελαφρά λυγισμένο. Κράτησε τον θώρακα σταθερό και μην τραβάς με τη μέση.');
 if(/diagonal reach|diagonal arm sweep|diagonal/.test(name))notes.push('Οδήγησε το χέρι ή την μπάλα σε ελεγχόμενη διαγώνια τροχιά, με ώμο χαμηλό και αγκώνα μαλακό. Η λεκάνη παραμένει σταθερή· η θωρακική στροφή είναι μικρή και ανώδυνη.');
 if(/forward reach|cross.body reach|opposite reach|controlled reach|contralateral lift|shoulder tap/.test(name))notes.push('Μετέφερε μόνο το άκρο που περιγράφει η φάση. Κράτησε τα υπόλοιπα σημεία στήριξης ακίνητα και τη λεκάνη οριζόντια· μην αφήσεις τη μεταφορά βάρους να προκαλέσει πτώση ή στροφή του κορμού.');
 if(/step.up|step up|step to|lateral step|side step|sled march|march/.test(name))notes.push('Τοποθέτησε ολόκληρο το πέλμα στο step ή στο δάπεδο πριν μεταφέρεις βάρος. Πίεσε από το πόδι που οδηγεί, κράτησε γόνατο στην κατεύθυνση των δακτύλων και ολοκλήρωσε με ισορροπία πριν κατεβάσεις ή αλλάξεις πλευρά.');
 if(/cossack/.test(name))notes.push('Ξεκίνα σε πλατιά βάση. Κάθισε προς το ένα ισχίο λυγίζοντας το γόνατο της πλευράς αυτής, ενώ το άλλο πόδι μένει μακρύ με πέλμα σε επαφή με το έδαφος. Κράτησε τη λεκάνη ελεγχόμενη και ανέβασε πιέζοντας από το λυγισμένο πόδι.');
 if(/crab/.test(name))notes.push('Στη θέση crab, στήριξε παλάμες πίσω από τον κορμό και πέλματα στο έδαφος, με δάχτυλα χεριών στραμμένα όπως επιτρέπει άνετα ο καρπός. Πίεσε παλάμες και πέλματα για να σηκώσεις τη λεκάνη χωρίς να συμπιέζεις τον αυχένα.');
 if(/half.kneeling|kneeling|get.up|γονάτισ/.test(name))notes.push('Στο μισό γονάτισμα κράτησε το μπροστινό πέλμα ολόκληρο κάτω, το πίσω γόνατο σε μαλακή στήριξη και τη λεκάνη στραμμένη μπροστά. Για να σηκωθείς, πίεσε από το μπροστινό πέλμα και πέρασε σε σταθερή όρθια βάση χωρίς να στρίψεις το γόνατο.');
 if(/walkout|walk out/.test(name))notes.push('Από όρθια θέση, λύγισε ισχία και γόνατα όσο χρειάζεται ώστε οι παλάμες να ακουμπήσουν στο έδαφος. Περπάτησε τα χέρια μπροστά με μικρά βήματα μέχρι ψηλή σανίδα, διατήρησε κορμό και λεκάνη σταθερά και επέστρεψε με την ίδια σειρά.');
 if(/quadruped|beast/.test(name))notes.push('Σε τετραποδική βάση, παλάμες κάτω από ώμους και γόνατα κάτω από ισχία. Για αιώρηση beast, πίεσε τις παλάμες, ενεργοποίησε κοιλιά και σήκωσε τα γόνατα λίγο από το στρώμα χωρίς να στρογγυλέψεις ή να βυθίσεις τη μέση.');
 if(/balance|ισορροπ/.test(name))notes.push('Στην ισορροπία, κράτησε το πέλμα στήριξης σταθερό, το γόνατο μαλακό και τη λεκάνη οριζόντια. Το ελεύθερο πόδι αιωρείται χωρίς να ακουμπά και ο κορμός δεν γέρνει για αντιστάθμιση.');
 if(/sled/.test(name))notes.push('Πιάσε τις λαβές του sled με δύο χέρια, κορμό σταθερό και ώμους μακριά από τα αυτιά. Κάνε μικρά ελεγχόμενα βήματα και πίεσε το sled χωρίς να καμπουριάζεις ή να κλειδώνεις τους αγκώνες.');
 if(/καθοδο|lower|descend|χαμήλω|κατέβα|επιστροφ|return|reset/.test(phase))notes.push('Αυτή είναι ελεγχόμενη φάση επιστροφής: χαμήλωσε ή επανάφερε το σώμα και τον εξοπλισμό στην αντίστροφη τροχιά, χωρίς πτώση, αναπήδηση ή αλλαγή στήριξης.');
 else if(/άνοδο|rise|press|drive|ώθη|push|pull|έλξη|κορυφ|hold|ισορροπ|τελικό/.test(phase))notes.push('Στο τελικό σημείο ολοκλήρωσε τη συγκεκριμένη κίνηση χωρίς να κλειδώνεις βίαια τις αρθρώσεις· κράτησε ισορροπία και έλεγχο πριν από την επόμενη φάση.');
 else if(!notes.length)notes.push('Πριν κινηθείς, έλεγξε ότι η βάση στήριξης είναι σταθερή, ο εξοπλισμός βρίσκεται στη θέση που ορίζουν οι οδηγίες και ο κορμός παραμένει ελεγχόμενος.');
 return notes.join(' ');
}
function detailedCue(exercise, cue, label){
 const detail=techniqueDetails(exercise,cue,label);
 return `${clean(cue)} Τεχνική σώματος: ${detail}`;
}
function bridgeCount(exercise,phaseCount){
 const identity=norm([exercise.name,exercise.instructions,exercise.patterns?.join?.(' ')].filter(Boolean).join(' '));
 if(/man maker|burpee|snatch|clean|box jump|wall ball|walkout|crawl|turkish get.up|complex|flow/.test(identity))return 5;
 if(exercise.custom||/\+| to | and |thruster|windmill|woodchop|kickthrough/.test(identity)||phaseCount>=6)return 4;
 return 3;
}
function changeBetween(exercise,from,to,step,total){
 const legacy=String(exercise.id||'').startsWith('hybrid-')?exercise.instructions:'';
 const identity=norm([exercise.name,exercise.patterns?.join?.(' '),from,to,legacy].filter(Boolean).join(' '));
 const stage=step===1?'Πρώτη μικρή μετατόπιση':step===total?'Τελική προσέγγιση στην επόμενη στάση':'Ενδιάμεση μετατόπιση';
 let change='Μετακίνησε μόνο τα μέρη του σώματος που απαιτεί η επόμενη φάση. Κράτησε σταθερά τα υπόλοιπα σημεία στήριξης, τον κορμό και τη θέση του εξοπλισμού· μην προσθέσεις νέο βήμα ή αλλαγή λαβής.';
 if(/squat|κάθισ|καθισ|thruster|goblet/.test(identity))change='Μετακίνησε τη λεκάνη σταδιακά πίσω και κάτω, λύγισε ισχία και γόνατα μαζί και άφησε τις κνήμες να κινηθούν όσο επιτρέπει η ισορροπία. Τα πέλματα μένουν ολόκληρα κάτω, τα γόνατα ακολουθούν τα δάκτυλα και ο κορμός γέρνει ως ενιαίο, ουδέτερο σύνολο.';
 else if(/lunge|split squat|προβολ|step.back|knee drive/.test(identity))change='Μετακίνησε το πόδι που περιγράφει η φάση προς τα εμπρός ή πίσω και πάτησε ολόκληρο το πέλμα πριν μεταφέρεις βάρος. Έπειτα λύγισε σταδιακά τα γόνατα ή ξεκίνα την άνοδο, με λεκάνη στραμμένη μπροστά και γόνατο στην κατεύθυνση των δακτύλων.';
 else if(/hinge|deadlift|rdl|άρση|swing/.test(identity))change='Στείλε τη λεκάνη προς τα πίσω, κράτησε τα γόνατα μαλακά και κλίνε τον κορμό από τα ισχία σαν ενιαίο σύνολο. Τα χέρια και το φορτίο ακολουθούν κοντά στους μηρούς· μην καμπουριάσεις και μην αλλάξεις την καμπύλη της μέσης.';
 else if(/row|κωπηλα|pull|έλξ/.test(identity))change='Κράτησε ακίνητο τον κορμό και μετακίνησε τους βραχίονες: οι αγκώνες οδηγούν προς τα πίσω κοντά στα πλευρά, οι ωμοπλάτες συγκλίνουν χωρίς ανασήκωμα ώμων και το φορτίο ακολουθεί την ίδια τροχιά.';
 else if(/press|push.up|push up|πιέσ|ώθησ|thruster/.test(identity))change='Οδήγησε παλάμες ή φορτίο προοδευτικά προς την κατεύθυνση της πίεσης. Οι αγκώνες εκτείνονται ομαλά, οι καρποί παραμένουν ευθείς πάνω από τους πήχεις και πλευρά/λεκάνη μένουν στοιβαγμένες χωρίς υπερέκταση της μέσης.';
 else if(/curl|δικέφα|κάμψη αγκώ/.test(identity))change='Κράτησε τον βραχίονα δίπλα στον κορμό και κάμψε τον αγκώνα σταδιακά ώστε το φορτίο να πλησιάσει τον ώμο. Ο καρπός μένει ουδέτερος, ο ώμος δεν προχωρά μπροστά και ο κορμός δεν αιωρείται.';
 else if(/plank|σανίδ|bear|crawl|beast|bird dog|quadruped|kickthrough/.test(identity))change='Μετέφερε ελεγχόμενα το άκρο ή το σημείο στήριξης που ορίζει η φάση. Πίεσε το έδαφος με τις υπόλοιπες παλάμες και τα πέλματα, κράτησε λεκάνη και θώρακα χωρίς πτώση ή στροφή και διατήρησε τον αυχένα στην ίδια γραμμή.';
 else if(/rotation|rotat|twist|περιστροφ|woodchop/.test(identity))change='Άρχισε μικρή, ελεγχόμενη στροφή από τον θώρακα προς την κατεύθυνση της επόμενης στάσης. Τα πέλματα παραμένουν σταθερά, η λεκάνη δεν στρίβει απότομα και ο εξοπλισμός κινείται μαζί με τα χέρια χωρίς να τραβά τη μέση.';
 else if(/jump|bound|άλμα|burpee|slam/.test(identity))change='Φόρτισε τα ισχία και τα γόνατα προοδευτικά ή ξεκίνησε την ώθηση όπως ορίζει η φάση. Κράτησε γόνατα στην κατεύθυνση των δακτύλων· αν ακολουθεί προσγείωση, απορρόφησέ την με αστράγαλο, γόνατο και ισχίο πριν συνεχίσεις.';
 else if(/step.up|step up|lateral step|side step|march|βάδισμα/.test(identity))change='Μετακίνησε πρώτα το πόδι που οδηγεί και τοποθέτησε όλο το πέλμα στο νέο σημείο στήριξης. Έπειτα μετέφερε σταδιακά το βάρος, κράτησε γόνατο και δάκτυλα στην ίδια κατεύθυνση και σταθεροποίησε πριν σηκώσεις το άλλο πόδι.';
 else if(/calf raise|γάμπ/.test(identity))change='Ανύψωσε τις φτέρνες σταδιακά χωρίς να μετακινηθούν τα γόνατα ή να κυλήσουν οι αστράγαλοι προς τα έξω ή μέσα. Η πίεση μένει μοιρασμένη στη βάση του μεγάλου και του μικρού δακτύλου.';
 else if(/hip thrust|glute bridge|γέφυρα/.test(identity))change='Πίεσε τα πέλματα στο έδαφος και ανύψωσε τη λεκάνη από τους γλουτούς. Κράτησε πλευρά και λεκάνη ελεγχόμενες και σταμάτησε πριν η μέση υπερεκταθεί.';
 return `${stage} (${step}/${total} της διαδρομής προς το επόμενο καρέ): ${change}`;
}
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
   `Αλλαγή από το προηγούμενο καρέ: ${phase.changeFromPrevious}`,
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
 const base=[{label:'Αρχική θέση',poseDescription:detailedCue(exercise,start,'Αρχική θέση')},...distinct.map((x,i)=>({label:x.label||`Φάση ${i+1}`,poseDescription:detailedCue(exercise,x.cue,x.label)}))];
 if(base.length===1)base.push({label:'Κύρια στάση',poseDescription:detailedCue(exercise,'Εκτέλεσε την περιγραφόμενη κίνηση μέχρι το ελεγχόμενο τελικό σημείο: '+clean(exercise.instructions||exercise.description),'Κύρια στάση')});
 const expanded=[];
 const startPhase={...base[0],changeFromPrevious:'Αρχική θέση της επανάληψης. Δεν έχει προηγηθεί κίνηση. Σταθεροποίησε πρώτα πέλματα ή σημεία στήριξης, κορμό και λαβή εξοπλισμού.'};
 expanded.push(startPhase);
 const bridgeBudget=Math.max(1,Math.floor((99-base.length)/Math.max(1,base.length-1)));
 const bridges=Math.min(bridgeCount(exercise,base.length),bridgeBudget);
 for(let i=1;i<base.length;i++){
  const previous=base[i-1],next=base[i];
  for(let step=1;step<=bridges;step++){
   const delta=changeBetween(exercise,previous.poseDescription,next.poseDescription,step,bridges);
   const cue=`${delta} Η στάση μετακινείται ομαλά από το προηγούμενο καρέ προς την επόμενη καταγεγραμμένη θέση.`;
   expanded.push({label:`${previous.label} → ${next.label} · ενδιάμεσο ${step}/${bridges}`,poseDescription:detailedCue(exercise,cue,`${previous.label} ${next.label}`),changeFromPrevious:delta});
  }
  expanded.push({...next,changeFromPrevious:changeBetween(exercise,previous.poseDescription,next.poseDescription,bridges,bridges)});
 }
 const total=expanded.length+1;
 const frames=expanded.map((phase,i)=>({
   frame:i+1,label:phase.label,poseDescription:phase.poseDescription,changeFromPrevious:phase.changeFromPrevious,
   transitionDescription:phase.changeFromPrevious,
   referenceProfile:profile,referenceImage:reference.url,referenceSha256:reference.sha256,
   sameImageAs:null,
   prompt:promptFor(exercise,profile,phase,i,total,base[i-1]?.poseDescription,base[i+1]?.poseDescription)
 }));
 frames.push({frame:total,label:'Τελική επαναφορά — ίδια με την αρχική θέση',poseDescription:frames[0].poseDescription,changeFromPrevious:'Ολοκλήρωσε την αντίστροφη τροχιά και επέστρεψε ακριβώς στην αρχική θέση, με τα ίδια σημεία στήριξης, λαβή, εξοπλισμό και ουδέτερη στάση.',
   transitionDescription:'Επανάφερε το σώμα ακριβώς στην αρχική θέση. Δεν δημιουργείται νέα εικόνα· χρησιμοποιείται αυτούσια η εικόνα του Frame 1.',
   referenceProfile:profile,referenceImage:reference.url,referenceSha256:reference.sha256,sameImageAs:1,
   prompt:'REUSE THE EXACT IMAGE FILE GENERATED FOR FRAME 1. Do not generate or alter another model, pose, camera, equipment or background.'});
 return {version:2,referenceProfile:profile,referenceImage:reference.url,referenceSha256:reference.sha256,
   promptTemplate:'MANDATORY SOFIA VISUAL REFERENCE LOCK — attach this exact approved model-and-studio photo '+reference.url+' (SHA-256 '+reference.sha256+'). Use that person and that background only. Preserve the same identity, facial features, hair, proportions, clothes, shoes, camera, framing and studio in every frame. Generate one image for one frame from its poseDescription; never invent another model or background. If the reference image cannot be attached, stop. The final frame with sameImageAs must reuse the source image file exactly and must not be generated again.',
   fixedVisualContext:'Μοντέλο και περιβάλλον/φόντο παραμένουν ακριβώς όπως στην εγκεκριμένη φωτογραφία αναφοράς. Αλλάζει μόνο η στάση και η φάση της άσκησης που περιγράφεται σε κάθε καρέ.',
   frameCount:frames.length,closingFrameReuses:1,coachReviewRequired:Boolean(exercise.requiresCoachReview||exercise.newConcept||exercise.custom),
   frames};
}

export function ensureVisualization(exercise={}){
 const current=exercise.visualization;
 const complete= current?.version===2&&Array.isArray(current.frames)&&current.frames.length>=3&&
   current.frames.every(frame=>frame.prompt&&frame.referenceImage&&frame.referenceSha256&&'sameImageAs'in frame);
 if(complete)return exercise;
 if(current&&Array.isArray(current.frames)&&current.frames.length>=2)
   return {...exercise,visualization:buildVisualization(exercise,current.frames)};
 return {...exercise,visualization:buildVisualization(exercise)};
}
