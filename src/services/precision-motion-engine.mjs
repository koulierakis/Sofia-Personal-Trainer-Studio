const tidy = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const equipmentText = (exercise) => Array.isArray(exercise?.equipment) ? exercise.equipment.join(', ') : String(exercise?.equipment || 'βάρος σώματος');
const titleOf = (exercise) => exercise?.greekName || exercise?.gr || exercise?.name || exercise?.title || 'Άσκηση';

const templates = [
  { id: 'squat', match: /squat|καθισμα|καθισματα|goblet/, frames: [
    ['Αρχική θέση', 'Στεκόμαστε όρθιοι με τα δύο πέλματα ολόκληρα στο έδαφος, στο άνοιγμα των ισχίων. Γόνατα εκτεταμένα χωρίς υπερέκταση, λεκάνη ουδέτερη, κορμός όρθιος, κεφάλι σε συνέχεια της σπονδυλικής στήλης. Τα χέρια μένουν στη θέση που απαιτεί η άσκηση.', 'Και τα δύο πέλματα: πλήρης στήριξη στο έδαφος.', 'Γόνατα περίπου 0–10° κάμψης.'],
    ['Κάτω θέση καθίσματος', 'Η λεκάνη κινείται πίσω και κάτω, τα ισχία και τα γόνατα κάμπτονται συμμετρικά και οι αστράγαλοι επιτρέπουν πρόσθια μετατόπιση των γονάτων. Ο κορμός διατηρεί σταθερή, φυσική ευθυγράμμιση. Και τα δύο πέλματα παραμένουν ολόκληρα στο έδαφος.', 'Αριστερό και δεξί πέλμα: πλήρης επαφή· βάρος κατανεμημένο και στα δύο.', 'Στόχος γόνατα περίπου 80–110° κάμψης, ανάλογα με κινητικότητα και ανατομία.']
  ]},
  { id: 'reverse-lunge', match: /reverse lunge|backward lunge|πισω προβολ|οπισθια προβολ/, frames: [
    ['Αρχική θέση', 'Όρθια συμμετρική θέση, κορμός κατακόρυφος και λεκάνη σταθερή. Αριστερό και δεξί πέλμα ολόκληρα στο έδαφος.', 'Και τα δύο πέλματα στηρίζονται στο έδαφος.', 'Γόνατα σχεδόν εκτεταμένα.'],
    ['Βήμα προς τα πίσω', 'Το δεξί πόδι κάνει βήμα πίσω και ακουμπά στο έδαφος με το μπροστινό μέρος του πέλματος. Το αριστερό πόδι παραμένει μπροστά και σταθερό. Η λεκάνη κοιτάζει μπροστά.', 'Αριστερό: πέλμα ολόκληρο κάτω. Δεξί: δάκτυλα/πρόσθιο πέλμα κάτω, φτέρνα ανασηκωμένη.', 'Δύο διακριτά σημεία στήριξης· αρχίζει κάμψη και στα δύο γόνατα.'],
    ['Κάτω θέση προβολής', 'Το αριστερό γόνατο λυγίζει πάνω από το αριστερό πέλμα. Το δεξί γόνατο κατεβαίνει προς το έδαφος χωρίς να ακουμπήσει. Κορμός σταθερός και λεκάνη οριζόντια.', 'Αριστερό πέλμα ολόκληρο· δεξιά στήριξη στα δάκτυλα.', 'Και τα δύο γόνατα περίπου 80–100°· βάθος προσαρμόζεται άνετα.']
  ]},
  { id: 'hip-bridge', match: /glute bridge|hip bridge|γεφυρα|ανυψωση λεκανης/, frames: [
    ['Αρχική θέση στο έδαφος', 'Ύπτια θέση, κεφάλι και άνω ράχη στο στρώμα. Γόνατα λυγισμένα, πέλματα ολόκληρα στο έδαφος, παράλληλα και στο άνοιγμα των ισχίων. Λεκάνη ακουμπά στο στρώμα.', 'Κεφάλι, άνω ράχη και αμφότερα τα πέλματα στηρίζονται.', 'Γόνατα περίπου 90° κάμψης.'],
    ['Άνω θέση γέφυρας', 'Η λεκάνη ανυψώνεται με έκταση ισχίων μέχρι ώμοι, λεκάνη και γόνατα να σχηματίζουν περίπου ευθεία. Τα πλευρά μένουν χαμηλά και η μέση δεν υπερεκτείνεται.', 'Κεφάλι/ώμοι και δύο πέλματα παραμένουν σταθερά κάτω.', 'Ισχία σε έκταση· τα γόνατα παραμένουν λυγισμένα περίπου 90°.']
  ]},
  { id: 'push-up', match: /push.?up|press.?up|καμψεις|καμψης|πιεση στο εδαφος/, frames: [
    ['Άνω θέση σανίδας', 'Παλάμες στο έδαφος κάτω από τους ώμους, αγκώνες εκτεταμένοι. Κεφάλι, κορμός και λεκάνη ευθυγραμμισμένα. Πόδια τεντωμένα, στήριξη στα δάκτυλα.', 'Και οι δύο παλάμες και τα δάκτυλα των δύο πελμάτων στηρίζονται.', 'Αγκώνες περίπου 0–10°· σώμα σε ενιαία γραμμή.'],
    ['Κάτω θέση κάμψης', 'Ο κορμός κατεβαίνει ως ενιαίο σύνολο με κάμψη αγκώνων. Οι αγκώνες κινούνται διαγώνια πίσω, όχι κάθετα στο πλάι. Κεφάλι και λεκάνη δεν κρεμούν.', 'Ίδια τέσσερα σημεία στήριξης: δύο παλάμες και δύο πρόσθια πέλματα.', 'Αγκώνες περίπου 70–100°· βάθος μέχρι άνετη ελεγχόμενη θέση.']
  ]},
  { id: 'hinge', match: /deadlift|hip hinge|romanian|rdl|αρση θανατου|καμψη ισχιων/, frames: [
    ['Όρθια αρχική θέση', 'Όρθια στάση, πέλματα στο άνοιγμα ισχίων, βάρος κοντά στους μηρούς εφόσον υπάρχει. Γόνατα ελαφρά μαλακά, κορμός ουδέτερος.', 'Και τα δύο πέλματα ολόκληρα στο έδαφος.', 'Γόνατα περίπου 10–20° κάμψης.'],
    ['Κάτω θέση hip hinge', 'Η λεκάνη μετακινείται πίσω με κάμψη στα ισχία, ενώ τα γόνατα παραμένουν ελαφρά λυγισμένα. Ο κορμός γέρνει ως ενιαίο τμήμα, χωρίς στρογγύλεμα της οσφύος. Το φορτίο παραμένει κοντά στα πόδια.', 'Και τα δύο πέλματα πλήρως κάτω· βάρος στο μέσο πέλμα και φτέρνα.', 'Κάμψη ισχίων ανάλογη με κινητικότητα· δεν ορίζεται υποχρεωτική γωνία κορμού.']
  ]},
  { id: 'calf-raise', match: /calf raise|heel raise|αρσεις γαστροκνημιων|ανυψωση φτερνων/, frames: [
    ['Κάτω θέση', 'Όρθια στάση με τα δύο πέλματα παράλληλα. Γόνατα μαλακά, κορμός και λεκάνη σταθερά.', 'Και τα δύο πέλματα στηρίζονται ολόκληρα.', 'Αστράγαλοι σε ουδέτερη θέση.'],
    ['Άνω θέση στις μύτες', 'Και οι δύο φτέρνες ανυψώνονται συμμετρικά με πελματιαία κάμψη. Κορμός παραμένει κατακόρυφος χωρίς αναπήδηση ή κύλιση προς τα έξω.', 'Στήριξη στα πρόσθια μέρη και στα δάκτυλα και των δύο πελμάτων.', 'Αστράγαλοι σε άνετη πελματιαία κάμψη· ακριβής μοίρα διαφέρει ανά άτομο.']
  ]},
  { id: 'plank', match: /plank|σανιδα/, frames: [
    ['Θέση σανίδας', 'Παλάμες ή πήχεις στο έδαφος σύμφωνα με την περιγραφή της άσκησης, ώμοι πάνω από τα σημεία στήριξης. Κεφάλι, κορμός, λεκάνη και πόδια ευθυγραμμισμένα. Κοιλιά και γλουτοί ενεργοί.', 'Παλάμες/πήχεις και δάκτυλα πελμάτων στηρίζονται.', 'Ισομετρική θέση· δεν προστίθεται κίνηση που δεν περιγράφεται.']
  ]}
];

function familyLaterality(exercise, frame) {
  const text = tidy([exercise?.name, exercise?.title, exercise?.gr, exercise?.greekName].join(' '));
  if (/reverse lunge|backward lunge|πισω προβολ|οπισθια προβ/.test(text)) return 'Η αριστερή πλευρά είναι η μπροστινή/στηρικτική και η δεξιά το πόδι που κινείται προς τα πίσω, σύμφωνα με την παραδοχή της ανάλυσης.';
  if (/squat|καθισμα|glute bridge|hip bridge|γεφυρα|calf raise|heel raise|deadlift|hip hinge|rdl|push.?up|καμψεις/.test(text)) return 'Αριστερό και δεξί άκρο κινούνται συμμετρικά όπως περιγράφεται· οι δύο πλευρές διατηρούν ίδιες επαφές και γωνίες. Ποτέ κατοπτρισμός.';
  return 'Διατήρησε ρητά την ανατομική αριστερή και δεξιά πλευρά· ποτέ κατοπτρισμός.';
}

function promptFor(frame, index, exercise, identityLock) {
  const unchanged = index === 0 ? 'Καμία προηγούμενη στάση.' : 'Κεφάλι, βλέμμα, αυχένας, κορμός, λεκάνη και τα μέλη που δεν αναφέρονται ως κινητά διατηρούν την περιγραφόμενη ουδέτερη ευθυγράμμιση.';
  const sideNote = familyLaterality(exercise, frame);
  return [
    'FRAME ' + (index + 1) + ' — ' + frame.label + '.',
    'Άσκηση: ' + titleOf(exercise) + '. Στατική εικόνα μίας χρονικής στιγμής.',
    'Πλήρης στάση: ' + frame.pose,
    'Αριστερά/δεξιά: ' + sideNote,
    'Αρθρώσεις/γωνίες στόχοι: ' + frame.angles,
    'Σημεία στήριξης: ' + frame.support,
    'Μεταβολή από το προηγούμενο καρέ: ' + (frame.change || 'Αρχική θέση της επανάληψης.'),
    'Αμετάβλητα τμήματα: ' + unchanged,
    'Εξοπλισμός: ' + equipmentText(exercise) + '. Μην προσθέσεις αντικείμενα ή επαφές που δεν αναφέρονται.',
    'GLOBAL IDENTITY LOCK: ' + (identityLock || 'Χρησιμοποίησε αποκλειστικά εγκεκριμένη φωτογραφία αναφοράς μοντέλου και studio· η αναφορά πρέπει να επισυναφθεί από την εφαρμογή.') ,
    'Αρνητικοί περιορισμοί: χωρίς αλλαγή προσώπου, σώματος, ρούχων, παπουτσιών, εξοπλισμού, φόντου, φωτισμού, κάμερας ή σημείου πρόσδεσης; χωρίς κατοπτρισμό, swapping αριστερά/δεξιά, teleportation, επιπλέον άκρα, κρυμμένα πέλματα ή αδύνατες αρθρώσεις.',
    'Ανεξάρτητο prompt: Φωτορεαλιστική εκπαιδευτική απεικόνιση πλήρους σώματος για το ακριβές frame ' + (index + 1) + '. ' + frame.pose + ' Διατήρησε ακριβώς τα σταθερά στοιχεία και τα σημεία στήριξης όπως ορίζονται παραπάνω.'
  ].join('\n');
}

export function analyzeExercise(exercise, { identityLock = '', mode = 'image' } = {}) {
  const fullText = tidy([exercise?.name, exercise?.title, exercise?.gr, exercise?.greekName, exercise?.instructions, exercise?.description, ...(exercise?.patterns || [])].filter(Boolean).join(' '));
  const family = templates.find((item) => item.match.test(fullText));
  if (!family) return {
    status: 'UNCERTAIN', confidence: 'low', exercise: titleOf(exercise), mode,
    issues: ['Δεν αναγνωρίστηκε ασφαλώς υποστηριζόμενο κινητικό μοτίβο. Απαιτείται ακριβέστερη περιγραφή αρχικής θέσης, κίνησης και επιστροφής.'],
    frames: [], videoPrompt: '', masterPrompt: '', validation: { anatomy: 'NOT_ASSESSED', continuity: 'NOT_ASSESSED', imageEvidence: 'NOT_PROVIDED', coachApproval: 'REQUIRED' }
  };

  const specs = family.frames;
  const frames = specs.map((entry, index) => ({
    frame: index + 1, label: entry[0], phase: index === 0 ? 'initial' : (family.id === 'hip-bridge' || family.id === 'calf-raise' ? 'concentric' : family.id === 'plank' ? 'isometric' : 'eccentric_or_transition'),
    pose: entry[1], support: entry[2], angles: entry[3],
    change: index === 0 ? 'Αφετηρία.' : (index === specs.length - 1 ? 'Αλλαγή κατεύθυνσης ή κορυφαία θέση της κίνησης.' : 'Εμφανίζεται το επόμενο διακριτό κινητικό γεγονός.'),
    poseSpec: { phase: index === 0 ? 'initial' : 'key_position', laterality: 'left_right_explicit', posture: entry[1], support: entry[2], targetAngles: entry[3], equipment: equipmentText(exercise), uncertainty: 'Angle targets are approximate and must be adapted to individual anatomy.' }
  }));
  const start = frames[0];
  const closing = { frame: frames.length + 1, label: 'Επιστροφή στην αρχική θέση', phase: 'return', pose: start.pose, support: start.support, angles: start.angles, change: 'Ελεγχόμενη επιστροφή στην αρχική θέση· κλείσιμο μίας πλήρους επανάληψης.', poseSpec: { ...start.poseSpec, phase: 'return_to_start', reusedImage: 1 } };
  const uniqueFrames = [...frames, { ...closing, sameImageAs: 1 }];
  for (let i = 0; i < uniqueFrames.length; i++) uniqueFrames[i].prompt = uniqueFrames[i].sameImageAs ? 'Reuse Frame 1 image byte-for-byte for the matching closing pose; do not generate a new image.' : promptFor(uniqueFrames[i], i, exercise, identityLock);

  const videoPrompt = [
    'VIDEO MODE — μία συνεχής, πλήρης επανάληψη: ' + titleOf(exercise) + '.',
    'Σειρά στάσεων: ' + uniqueFrames.map((f) => f.label).join(' → ') + '.',
    ...uniqueFrames.map((f) => f.label + ': ' + f.pose + ' Στήριξη: ' + f.support),
    'Κίνηση ομαλή και ανατομικά συνεχής, με σαφή φορά και ελεγχόμενη αντιστροφή κατεύθυνσης. Καμία τηλεμεταφορά, ανταλλαγή αριστερού/δεξιού άκρου ή μετακίνηση σταθερού εξοπλισμού.',
    'Κλείσε την επανάληψη στην αρχική στάση. GLOBAL IDENTITY LOCK: ' + (identityLock || 'επισύναψε εγκεκριμένο reference και κλείδωσε πρόσωπο, σώμα, ρουχισμό, εξοπλισμό, studio, φωτισμό και κάμερα.') ,
    'Χρόνος: μη καθορισμένος· να προσαρμοστεί στο tempo του coach. Μην επινοήσεις ρυθμό ή εύρος κίνησης.'
  ].join('\n');

  const issues = family.id === 'reverse-lunge' ? ['Η προδιαγραφή δεν καθορίζει πλευρά· εφαρμόστηκε προσωρινή παραδοχή: αριστερό πόδι μπροστά, δεξί πόδι κινείται πίσω. Επιβεβαίωση προπονητή απαιτείται.'] : [];
  if (family.id === 'plank') issues.push('Η σανίδα είναι ισομετρική θέση· δεν τεκμηριώνει επαναληπτικό κύκλο χωρίς περιγραφή της επιπλέον κίνησης.');
  return {
    status: issues.length ? 'UNCERTAIN' : 'PROMPTS_READY', confidence: issues.length ? 'medium' : 'rule_based',
    exercise: titleOf(exercise), family: family.id, mode, frames: uniqueFrames, issues,
    masterPrompt: uniqueFrames.filter((f) => !f.sameImageAs).map((f, i) => promptFor(f, i, exercise, identityLock)).join('\n\n'),
    videoPrompt,
    validation: { anatomy: 'RULE_CHECKS_ONLY', order: 'STRUCTURALLY_COMPLETE', laterality: 'EXPLICIT', support: 'DESCRIBED', visualContinuity: 'NOT_VERIFIED', imageEvidence: 'NOT_PROVIDED', coachApproval: 'REQUIRED' }
  };
}

export function localCoachReply(message, exercise) {
  const text = tidy(message);
  if (/αναλυ|frame|καρε|οπτικ|prompt|κινηση|ασκηση/.test(text)) {
    const plan = analyzeExercise(exercise || { name: message });
    if (plan.status === 'UNCERTAIN' && !plan.frames.length) return 'Χρειάζομαι το όνομα της άσκησης και περιγραφή αρχικής θέσης, κύριας κίνησης και επιστροφής. Δεν θα επινοήσω καρέ.';
    return 'Έφτιαξα ντετερμινιστική ανάλυση για ' + plan.exercise + ': ' + plan.frames.length + ' στάσεις μαζί με επιστροφή. Κατάσταση: ' + plan.status + '. ' + plan.issues.join(' ');
  }
  if (/πονο|τραυμα|ασφαλ/.test(text)) return 'Μπορώ να δώσω γενικές τεχνικές πληροφορίες, όχι διάγνωση ή εξατομικευμένη έγκριση ασφάλειας. Σταμάτησε αν υπάρχει πόνος και ζήτησε αξιολόγηση από επαγγελματία υγείας.';
  return 'Είμαι η Μπέμπα μου AI Coach. Μπορώ να αναλύσω την επιλεγμένη άσκηση, να φτιάξω prompts ανά καρέ ή να εξηγήσω τα σημεία στήριξης. Για ελεύθερη συζήτηση ενεργοποίησε προαιρετικά το τοπικό Ollama.';
}
