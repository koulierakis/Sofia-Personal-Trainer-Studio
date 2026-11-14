import { Exercise, FrameItem, VisualizationSequence } from '../types';
import { VISUAL_REFERENCES, modelProfileFor, lockedVisualPrompt } from './visual-reference-lock';

const COMPLETE_BODY =
  'Πλήρες σώμα μέσα στο κάδρο. Σταθερή λήψη κάμερας στις 45 μοίρες (στη μέση λοξά, ούτε τελείως πλάγια ούτε από μπροστά) για να έχει ο θεατής ιδανική οπτική γωνία σε όλο το βάθος και τις γωνίες της κίνησης. Ίδια φωτεινότητα, ίδιο περιβάλλον studio ATHLETICO Fitness Boutique, ίδια ρούχα, ίδια παπούτσια και το ίδιο μοντέλο αναφοράς. Δείξε καθαρά και αναλυτικά κάθε μετατόπιση, μεταφορά και αλλαγή κάθε μέλους του σώματος από το προηγούμενο καρέ χωρίς καμία προπονητική ορολογία.';

const clean = (s: any): string => String(s ?? '').replace(/\s+/g, ' ').trim();
const norm = (s: any): string =>
  clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('el-GR');
const sentences = (s: any): string[] =>
  String(s ?? '').split(/(?<=[.!?])\s+|\n+/).map(clean).filter(Boolean);

export type MovementComplexity = 'simple' | 'moderate' | 'complex';

/**
 * Καθορίζει την κινησιολογική πολυπλοκότητα της άσκησης βάσει του μοτίβου κίνησης.
 */
export function classifyExerciseComplexity(exercise: Partial<Exercise>): MovementComplexity {
  const text = norm([
    exercise.name,
    exercise.title,
    exercise.patterns?.join?.(' '),
    exercise.instructions,
    exercise.description,
  ].filter(Boolean).join(' '));

  // Complex multi-pattern combo markers
  if (
    /\b(to|and|\+|walkout|get-up|get up|burpee|man maker|flow|complex|kickthrough|clean|snatch)\b/.test(text) ||
    /συνδυασμ|ροή|πολυαρθρωτικ|άλμα και|σανίδα σε/i.test(text)
  ) {
    return 'complex';
  }

  // Moderate unilateral, stepped, or asymmetrical movements
  if (
    /lunge|split squat|προβολ|step-up|step up|bird dog|dead bug|pallof|cossack|single-leg|μονοποδικ|rotation|twist|περιστροφ|diagonal|reach|tap/.test(text)
  ) {
    return 'moderate';
  }

  // Simple basic movements
  return 'simple';
}

/**
 * Αναλυτικές προπονητικές οδηγίες για αρχάριους ανά φάση της κίνησης με αναλυτική περιγραφή
 * ολόκληρου του σώματος από την κορυφή έως τα νύχια (κεφάλι, βλέμμα, χέρια, παλάμες, λαβή,
 * ώμοι, στήθος, κορμός, κοιλιά, λεκάνη, γόνατα, γωνίες και πέλματα) χωρίς ακαδημαϊκή ορολογία.
 */
function getPhaseSpecificCoaching(
  exercise: Partial<Exercise>,
  phaseType: 'initial' | 'descent' | 'apex' | 'ascent' | 'final',
  rawCue: string = ''
): { pose: string; change: string } {
  const name = norm([exercise.name, exercise.title, exercise.patterns?.join?.(' ')].filter(Boolean).join(' '));
  const eq = norm(Array.isArray(exercise.equipment) ? exercise.equipment.join(' ') : String(exercise.equipment || ''));
  const isSquat = /squat|καθισ|goblet|thrust/.test(name);
  const isLunge = /lunge|split|προβολ/.test(name);
  const isTRX = /trx|ιμαντ/.test(name) || /trx|ιμαντ/.test(eq);
  const isHinge = /hinge|deadlift|rdl|άρση/.test(name);
  const isPush = /push|press|πίεσ|κάμψ/.test(name);
  const isPull = /pull|row|έλξ|κωπηλα/.test(name);
  const isPlank = /plank|σανίδ|bear|beast|quadruped/.test(name);

  if (phaseType === 'initial') {
    let specific = '';
    if (isTRX) {
      specific = 'Κεφάλι και βλέμμα στραμμένα ευθεία μπροστά στον ορίζοντα προς το σημείο πρόσδεσης του ιμάντα, χωρίς σκύψιμο. Χέρια κρατούν τις λαβές TRX με τις παλάμες να κοιτάνε αντικριστά (η μία την άλλη), αγκώνες ελαφρώς λυγισμένοι δίπλα στα πλευρά, με ήπια τάση στους ιμάντες χωρίς να κρεμόμαστε προς τα πίσω. Κορμός στητός, στήθος ανοιχτό και ψηλό, ώμοι τραβηγμένοι πίσω και κάτω μακριά από τα αυτιά, κοιλιά σφιγμένη. Λεκάνη οριζόντια και ευθυγραμμισμένη. Πόδια όρθια, πέλματα παράλληλα στο άνοιγμα των ισχίων, πατώντας ολόκληρα σταθερά στο πάτωμα.';
    } else if (isSquat) {
      specific = 'Κεφάλι και βλέμμα κοιτάζουν ευθεία μπροστά στον ορίζοντα. Χέρια τοποθετημένα μπροστά στο στήθος με τους αγκώνες λυγισμένους και τις παλάμες απαλά ενωμένες για ισορροπία. Κορμός ίσιος, στήθος ανοιχτό και ψηλό, ώμοι χαμηλά πίσω και κάτω, κοιλιά ενεργοποιημένη και σφιχτή. Λεκάνη ουδέτερη και στραμμένη ευθεία. Πόδια όρθια στο άνοιγμα των ώμων με τα δάχτυλα ελαφρώς στραμμένα προς τα έξω (10-15 μοίρες), και τα δύο πέλματα πατούν ολόκληρα (φτέρνα, μέσο, δάχτυλα) κολλημένα στο δάπεδο.';
    } else if (isLunge) {
      specific = 'Κεφάλι και βλέμμα σταθερά ευθεία μπροστά. Χέρια ενωμένα μπροστά στο στήθος με λυγισμένους αγκώνες για σταθερότητα και αντίβαρο. Κορμός ίσιος και κατακόρυφος, στήθος ψηλό, ώμοι μακριά από τα αυτιά, κοιλιά σφιχτή. Λεκάνη οριζόντια και ευθυγραμμισμένη. Πόδια παράλληλα στο άνοιγμα των ισχίων σαν σε δύο ράγες, με τα πέλματα να πατούν ολόκληρα στο έδαφος.';
    } else if (isHinge) {
      specific = 'Κεφάλι και αυχένας σε ευθεία γραμμή με την πλάτη, βλέμμα διαγώνια εμπρός. Χέρια τεντωμένα με έλεγχο κρατώντας το βάρος μπροστά στους μηρούς, ώμοι τραβηγμένοι πίσω και κάτω, στήθος ανοιχτό. Κοιλιά ενεργή και σφιχτή. Λεκάνη οριζόντια, πόδια στο άνοιγμα των ισχίων με τα γόνατα ελαφρώς μαλακά και λυγισμένα, πέλματα πατούν ολόκληρα στο έδαφος.';
    } else if (isPlank) {
      specific = 'Κεφάλι και αυχένας σε ευθεία με τη ράχη, βλέμμα στραμμένο στο στρώμα ανάμεσα στα χέρια. Χέρια με παλάμες ακριβώς κάτω από τους ώμους, δάχτυλα ανοιχτά στο έδαφος, αγκώνες σταθεροί. Κορμός, στήθος και κοιλιά σε μία απόλυτη ευθεία γραμμή, σφιχτή κοιλιά χωρίς βύθιση της μέσης. Λεκάνη παράλληλη με το πάτωμα. Πόδια τεντωμένα πίσω, στηριζόμενα στα δάχτυλα των πελμάτων στο άνοιγμα των ισχίων.';
    } else if (isPush) {
      specific = 'Κεφάλι σε φυσική ευθεία, βλέμμα σταθερό στην κατεύθυνση της κίνησης. Χέρια τοποθετημένα στο κατάλληλο άνοιγμα, παλάμες σε ευθεία με τους πήχεις, ώμοι σταθεροποιημένοι κάτω και πίσω. Κορμός ίσιος, στήθος ανοιχτό, κοιλιά σφιχτή. Λεκάνη σταθερή και πόδια ακλόνητα με τα πέλματα να πατούν ολόκληρα στο δάπεδο.';
    } else if (isPull) {
      specific = 'Κεφάλι ψηλά, βλέμμα ευθεία μπροστά. Χέρια τεντωμένα με έλεγχο κρατώντας τη λαβή, ώμοι τραβηγμένοι πίσω και κάτω, στήθος προτεταμένο. Κορμός στητός, κοιλιά σφιχτή. Λεκάνη οριζόντια και πόδια σταθερά στο άνοιγμα των ώμων με πέλματα κολλημένα στο δάπεδο.';
    } else {
      specific = 'Κεφάλι και βλέμμα κοιτάζουν ευθεία μπροστά στον ορίζοντα. Χέρια χαλαρά δίπλα στο σώμα ή ενωμένα μπροστά στο στήθος για ισορροπία. Κορμός ίσιος, στήθος ψηλό, ώμοι πίσω και κάτω μακριά από τα αυτιά, κοιλιά σφιχτή. Λεκάνη οριζόντια και ευθεία. Πόδια όρθια με πέλματα παράλληλα στο άνοιγμα των ισχίων, πατώντας ολόκληρα στο πάτωμα.';
    }

    return {
      pose: `Αρχική θέση προετοιμασίας: ${specific} ${rawCue ? `[Οδηγία άσκησης: ${clean(rawCue)}]` : ''}`,
      change: 'Αρχική σταθεροποίηση του σώματος πριν από την έναρξη της επανάληψης. Όλα τα μέλη του σώματος είναι τοποθετημένα στη σταθερή ουδέτερη βάση.',
    };
  }

  if (phaseType === 'descent') {
    let specific = '';
    if (isTRX) {
      specific = 'Κεφάλι ψηλά, βλέμμα σταθερό μπροστά. Χέρια κρατούν τις λαβές TRX με παλάμες αντικριστά και εκτείνονται απαλά μπροστά υποβοηθώντας την ισορροπία χωρίς να τραβούν με δύναμη. Κορμός ίσιος με μικρή φυσική κλίση από τα ισχία, στήθος ανοιχτό, κοιλιά σφιχτή. Λεκάνη μετατοπίζεται ελεγχόμενα προς την πλευρά κίνησης. Το ένα πόδι λυγίζει στο γόνατο καθώς κατεβαίνουμε, ενώ το αντίθετο πόδι παραμένει τεντωμένο με ολόκληρο το πέλμα στο δάπεδο.';
    } else if (isSquat) {
      specific = 'Κεφάλι ψηλά, βλέμμα σταθερά ευθεία. Χέρια παραμένουν ενωμένα μπροστά στο στήθος λειτουργώντας ως αντίβαρο. Κορμός ίσιος με φυσική ήπια κλίση προς τα εμπρός από τα ισχία, στήθος ψηλό, κοιλιά σφιχτή. Η λεκάνη στέλνεται πίσω και κάτω σαν να καθόμαστε σε καρέκλα. Τα γόνατα λυγίζουν στις 45 μοίρες στην κατεύθυνση των δακτύλων. Και τα δύο πέλματα μένουν απόλυτα κολλημένα στο έδαφος χωρίς ανασήκωμα της φτέρνας.';
    } else if (isLunge) {
      specific = 'Κεφάλι στητό, βλέμμα ευθεία μπροστά. Χέρια παραμένουν μπροστά στο στήθος για ισορροπία. Κορμός απόλυτα κατακόρυφος, στήθος ανοιχτό, κοιλιά σφιχτή. Η λεκάνη χαμηλώνει κατακόρυφα προς το δάπεδο χωρίς να στρίβει. Το πίσω πόδι πατάει σταθερά στα δάχτυλα με τη φτέρνα ψηλά, ενώ το μπροστινό πόδι πατάει ολόκληρο με το γόνατο να λυγίζει ακριβώς πάνω από τον αστράγαλο.';
    } else if (isHinge) {
      specific = 'Κεφάλι και αυχένας σε ευθεία γραμμή με την πλάτη, βλέμμα προς το έδαφος λίγα μέτρα μπροστά. Χέρια οδηγούν το βάρος κοντά κατά μήκος των μηρών. Κορμός ίσιος σαν ενιαίο μπλοκ χωρίς καμπούριασμα, στήθος ανοιχτό. Η λεκάνη ταξιδεύει ευθεία προς τα πίσω, τα γόνατα μένουν με μαλακή ελαφριά κάμψη, και τα πέλματα πατούν ολόκληρα στο πάτωμα.';
    } else if (isPlank) {
      specific = 'Κεφάλι ουδέτερο, βλέμμα στο πάτωμα. Χέρια σταθερά κάτω από τους ώμους. Κορμός, στήθος και λεκάνη παραμένουν σε απόλυτη ευθεία γραμμή χωρίς να βουλιάζει η μέση ή να σηκώνεται η λεκάνη ψηλά.';
    } else {
      specific = 'Κεφάλι ευθυγραμμισμένο, βλέμμα εμπρός. Χέρια σε σταθερή θέση ελέγχου. Κορμός και στήθος διατηρούν την ευθεία τους στάση, ενώ οι αρθρώσεις κάμπτονται ελεγχόμενα προς το βάθος της κίνησης.';
    }

    return {
      pose: `Φάση καθόδου / προετοιμασίας: ${specific} ${rawCue ? `[Οδηγία: ${clean(rawCue)}]` : ''}`,
      change: 'Μετάβαση από την αρχική όρθια θέση προς το βάθος της κίνησης. Οι αρθρώσεις κάμπτονται ομαλά χωρίς απότομες μετατοπίσεις ή απώλεια ισορροπίας.',
    };
  }

  if (phaseType === 'apex') {
    let specific = '';
    if (isTRX) {
      specific = 'Κεφάλι ψηλά, βλέμμα σταθερό μπροστά στον ορίζοντα. Χέρια απλωμένα μπροστά κρατώντας τις λαβές TRX με παλάμες αντικριστά για στήριξη. Κορμός ίσιος, στήθος ανοιχτό, κοιλιά σφιχτή. Λεκάνη χαμηλωμένη προς τη μία πλευρά, οριζόντια χωρίς να στρίβει. Το λυγισμένο πόδι σχηματίζει γωνία 90 μοιρών στο γόνατο με το πέλμα να πατάει ολόκληρο κάτω, ενώ το άλλο πόδι είναι απόλυτα τεντωμένο στο πλάι με ολόκληρο το πέλμα στο έδαφος.';
    } else if (isSquat) {
      specific = 'Κεφάλι στητό, βλέμμα σταθερά ευθεία μπροστά στον ορίζοντα. Χέρια σταθερά ενωμένα μπροστά στο στήθος. Κορμός διατηρεί την ίσια φυσική του γραμμή, στήθος ψηλό και ανοιχτό, κοιλιά ενεργή. Η λεκάνη βρίσκεται στο ύψος των γονάτων με τους μηρούς παράλληλους στο δάπεδο. Τα γόνατα σχηματίζουν γωνία 90 μοιρών πάνω από τα δάχτυλα. Και τα δύο πέλματα πατούν ολόκληρα και σταθερά στο πάτωμα με το βάρος ομοιόμορφα μοιρασμένο.';
    } else if (isLunge) {
      specific = 'Κεφάλι ψηλά, βλέμμα ευθεία μπροστά. Χέρια στο στήθος. Κορμός όρθιος και κατακόρυφος, στήθος ανοιχτό, κοιλιά σφιχτή. Λεκάνη οριζόντια και στραμμένη μπροστά. Και τα δύο γόνατα σχηματίζουν γωνία 90 μοιρών: το μπροστινό πέλμα πατάει ολόκληρο στο πάτωμα με το γόνατο πάνω από τον αστράγαλο, και το πίσω γόνατο αιωρείται λίγα εκατοστά πάνω από το έδαφος με το πίσω πέλμα στα δάχτυλα.';
    } else if (isHinge) {
      specific = 'Κεφάλι και αυχένας σε μία ευθεία με τη ράχη, βλέμμα στραμμένο λοξά κάτω. Χέρια σταθερά με το βάρος ακριβώς κάτω από τα γόνατα, ώμοι πίσω. Κορμός σε κλίση 45 μοιρών με την πλάτη απόλυτα ίσια. Λεκάνη στο μέγιστο πίσω σημείο, γόνατα με μαλακή κάμψη και πέλματα κολλημένα στο δάπεδο.';
    } else if (isPush) {
      specific = 'Κεφάλι ίσιο, βλέμμα μπροστά. Χέρια στο μέγιστο ελεγχόμενο σημείο ώθησης, καρποί σταθεροί. Κορμός, στήθος και κοιλιά απόλυτα σταθερά χωρίς κύρτωση της μέσης.';
    } else if (isPull) {
      specific = 'Κεφάλι ψηλά, βλέμμα μπροστά. Αγκώνες οδηγημένοι πίσω κοντά στα πλευρά, ωμοπλάτες πλησιάζουν μεταξύ τους, στήθος προτεταμένο, κοιλιά σφιχτή.';
    } else if (isPlank) {
      specific = 'Κεφάλι σε ευθεία, βλέμμα στο στρώμα. Χέρια στηρίζουν σταθερά. Κορμός, στήθος, κοιλιά και λεκάνη σχηματίζουν μία αδιάσπαστη ευθεία γραμμή σαν σανίδα, με σφιχτή κοιλιά και γλουτούς.';
    } else {
      specific = 'Κεφάλι στητό, βλέμμα εμπρός. Χέρια σε σταθερή θέση. Κορμός ίσιος, στήθος ανοιχτό, κοιλιά σφιχτή, λεκάνη σταθερή και πόδια στο μέγιστο λειτουργικό εύρος της κίνησης.';
    }

    return {
      pose: `Βασική θέση της κίνησης: ${specific} Στιγμιαία παύση ελέγχου στο σημείο μέγιστης φόρτισης πριν από την έναρξη της επιστροφής. ${rawCue ? `[Στόχος: ${clean(rawCue)}]` : ''}`,
      change: 'Ολοκλήρωση της κύριας φάσης της κίνησης. Το σώμα έχει φτάσει στο μέγιστο ελεγχόμενο βάθος και προετοιμάζεται για την ώθηση επιστροφής.',
    };
  }

  if (phaseType === 'ascent') {
    let specific = '';
    if (isTRX) {
      specific = 'Κεφάλι ευθυγραμμισμένο, βλέμμα εμπρός. Χέρια κρατούν τις λαβές TRX με παλάμες αντικριστά, αγκώνες επιστρέφουν σε ελαφριά κάμψη δίπλα στα πλευρά καθοδηγώντας το σώμα χωρίς απότομο τράβηγμα. Κορμός όρθιος, στήθος ψηλό, κοιλιά σφιχτή. Λεκάνη επανέρχεται στο κέντρο. Πιέζουμε δυναμικά από το λυγισμένο πέλμα για να τεντώσουν τα πόδια και να επανέλθουν στο κέντρο.';
    } else if (isSquat) {
      specific = 'Κεφάλι και βλέμμα παραμένουν σταθερά ευθεία μπροστά στον ορίζοντα. Χέρια παραμένουν ενωμένα μπροστά στο στήθος. Κορμός διατηρείται ίσιος, στήθος ψηλά, κοιλιά σφιχτή. Πιέζουμε δυναμικά ολόκληρο το πέλμα στο δάπεδο (εστιάζοντας στις φτέρνες). Τα γόνατα και τα ισχία εκτείνονται ταυτόχρονα με ενιαίο ρυθμό καθώς το σώμα ανυψώνεται ομαλά προς την όρθια στάση.';
    } else if (isLunge) {
      specific = 'Κεφάλι ψηλά, βλέμμα μπροστά. Χέρια μπροστά στο στήθος. Κορμός όρθιος και στητός, στήθος ανοιχτό. Πιέζουμε δυναμικά από το μπροστινό πέλμα, η λεκάνη ανυψώνεται κατακόρυφα και το πίσω πόδι οδηγείται μπροστά για να ενωθεί με το άλλο.';
    } else if (isHinge) {
      specific = 'Κεφάλι σε ευθεία με την πλάτη. Χέρια οδηγούν το βάρος κοντά στους μηρούς. Σφίγγουμε τους γλουτούς και οδηγούμε τη λεκάνη εμπρός στην όρθια θέση, με τον κορμό να ισιώνει κατακόρυφα χωρίς υπερέκταση της μέσης.';
    } else {
      specific = 'Κεφάλι ευθυγραμμισμένο, βλέμμα μπροστά. Χέρια σε σταθερή θέση. Κορμός ίσιος και ενεργός, ενώ οι αρθρώσεις εκτείνονται ελεγχόμενα επαναφέροντας το σώμα προς την αρχική θέση.';
    }

    return {
      pose: `Φάση επιστροφής: ${specific} Η κίνηση εκτελείται με απόλυτο κινητικό έλεγχο και σταθερή αναπνοή.`,
      change: 'Επιστροφή από το τελικό σημείο προς τη βάση. Οι αρθρώσεις επανέρχονται ομαλά στην ουδέτερη όρθια στάση.',
    };
  }

  // Final return to initial position
  const initial = getPhaseSpecificCoaching(exercise, 'initial', rawCue);
  return {
    pose: initial.pose,
    change: 'Πλήρης ολοκλήρωση της επανάληψης και επαναφορά στην αρχική θέση. Η σωματική στάση, τα σημεία στήριξης, η ευθυγράμμιση, τα χέρια και τα πόδια είναι απόλυτα ταυτόσημα με το Καρέ 1.',
  };
}

/**
 * Δημιουργεί το πλήρες prompt εικόνας για κάθε καρέ διατηρώντας απαρέγκλιτα το visual reference lock.
 */
function promptFor(
  exercise: Partial<Exercise>,
  profile: 'female' | 'male',
  phase: { label: string; poseDescription: string; changeFromPrevious?: string },
  index: number,
  total: number
): string {
  return [
    lockedVisualPrompt(exercise, phase.poseDescription, profile),
    `Frame ${index + 1} of ${total}. ${phase.label}.`,
    `Σταθερή λήψη στις 45 μοίρες (στη μέση λοξά, ούτε τελείως πλάγια ούτε από μπροστά) για ιδανική οπτική γωνία των αρθρώσεων και του βάθους.`,
    `Ακριβής στάση του σώματος σε αυτό το στιγμιότυπο: ${phase.poseDescription}`,
    `Αναλυτική μετατόπιση, μεταφορά και αλλαγή κάθε μέλους από το προηγούμενο καρέ: ${phase.changeFromPrevious}`,
    COMPLETE_BODY,
    `Οδηγίες άσκησης: ${clean(exercise.instructions || exercise.description)}`,
    `Μυϊκές ομάδες: ${(exercise.muscles || exercise.primaryMuscles || []).join?.(', ') || 'σύμφωνα με την περιγραφή'}.`,
    'Μία μόνο φωτογραφική στάση από γωνία 45 μοιρών, χωρίς κολάζ, βέλη, λεζάντες ή πρόσθετα άκρα. Ίδια φωτεινότητα, ίδιο περιβάλλον, ίδια ρούχα και το ίδιο μοντέλο αναφοράς.',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Κατασκευάζει την ολοκληρωμένη κινησιολογική αλληλουχία καρέ (VisualizationSequence)
 */
export function buildVisualization(
  exercise: Partial<Exercise> = {},
  sourceFrames: any[] | null = null
): VisualizationSequence {
  const profile = modelProfileFor(exercise);
  const reference = VISUAL_REFERENCES[profile];
  const complexity = classifyExerciseComplexity(exercise);
  const name = norm([exercise.name, exercise.title, exercise.id].filter(Boolean).join(' '));

  interface RawPhase {
    label: string;
    poseDescription: string;
    changeFromPrevious: string;
    phaseType: 'initial' | 'descent' | 'apex' | 'ascent' | 'final';
    imageUrl?: string;
    reuseFrame?: number;
  }

  const generatedPhases: RawPhase[] = [];

  // Ειδική μεταχείριση για το Squat: Ακριβώς 5 καρέ όπως ζητήθηκε
  const isSquat = /squat|καθισ/i.test(name) || exercise.id === 'functional-001';
  // Ειδική μεταχείριση για Ruvexa (TRX πλάγια προβολή): Ακριβώς 7 καρέ με αναλυτική περιγραφή TRX
  const isRuvexa = exercise.id === 'hybrid-ruv' || /ruvexa|ρουβεξα/i.test(name);

  if (isSquat) {
    // 5 καρέ για το Squat:
    // 1: Αρχική όρθια θέση
    // 2: Έναρξη καθόδου (μισή κάθοδος)
    // 3: Βασική θέση κάθισμα / Βάθος (παράλληλο κάθισμα 90 μοιρών)
    // 4: Φάση ανόδου (ώθηση επιστροφής)
    // 5: Τελική θέση — Πλήρης επαναφορά στην αρχική θέση (sameImageAs: 1)
    generatedPhases.push(
      {
        label: 'Αρχική θέση — Όρθια στάση',
        poseDescription: 'Αρχική θέση: Κεφάλι ψηλά με το βλέμμα σταθερό στον ορίζοντα. Χέρια τοποθετημένα μπροστά στο στήθος με τους αγκώνες λυγισμένους και τις παλάμες απαλά ενωμένες για ισορροπία. Κορμός ίσιος και στητός, στήθος ανοιχτό, ώμοι τραβηγμένοι πίσω και κάτω μακριά από τα αυτιά, κοιλιά σφιχτή. Λεκάνη οριζόντια και ουδέτερη. Πόδια όρθια στο άνοιγμα των ώμων με τα δάχτυλα ελαφρώς στραμμένα προς τα έξω (10-15 μοίρες), με ολόκληρα τα πέλματα κολλημένα στο δάπεδο.',
        changeFromPrevious: 'Αρχική τοποθέτηση του σώματος σε σταθερή όρθια θέση προετοιμασίας.',
        phaseType: 'initial',
      },
      {
        label: 'Έναρξη καθόδου',
        poseDescription: 'Έναρξη καθόδου: Κεφάλι στητό με το βλέμμα ευθεία μπροστά. Χέρια μένουν ενωμένα μπροστά στο στήθος ως αντίβαρο. Κορμός ίσιος με φυσική ήπια κλίση από τα ισχία, στήθος ψηλό, κοιλιά σφιχτή. Η λεκάνη ταξιδεύει πίσω και κάτω σαν να πάμε να καθίσουμε σε μακρινή καρέκλα. Τα γόνατα λυγίζουν στις 45 μοίρες ακολουθώντας την κατεύθυνση των δακτύλων. Και τα δύο πέλματα πατούν ολόκληρα στο δάπεδο χωρίς να σηκώνονται οι φτέρνες.',
        changeFromPrevious: 'Μετατόπιση της λεκάνης πίσω και κάτω, με κάμψη των γονάτων στις 45 μοίρες.',
        phaseType: 'descent',
      },
      {
        label: 'Βασική θέση — Παράλληλο κάθισμα',
        poseDescription: 'Βασική θέση (Βάθος καθίσματος): Κεφάλι στητό, βλέμμα κοιτάζει σταθερά ευθεία μπροστά στον ορίζοντα. Χέρια σταθερά μπροστά στο στήθος για μέγιστη ισορροπία. Κορμός ίσιος χωρίς καμπούριασμα, στήθος ανοιχτό, κοιλιά ενεργή. Η λεκάνη έχει κατέβει στο ύψος των γονάτων και οι μηροί είναι παράλληλοι με το έδαφος. Τα γόνατα σχηματίζουν γωνία 90 μοιρών πάνω από τα δάχτυλα των ποδιών. Και τα δύο πέλματα πατούν ολόκληρα και σταθερά στο πάτωμα.',
        changeFromPrevious: 'Ολοκλήρωση της καθόδου έως ότου οι μηροί γίνουν παράλληλοι με το έδαφος και τα γόνατα φτάσουν στις 90 μοίρες.',
        phaseType: 'apex',
      },
      {
        label: 'Φάση ανόδου — Ώθηση επιστροφής',
        poseDescription: 'Φάση ανόδου: Κεφάλι και βλέμμα σταθερά στον ορίζοντα. Χέρια παραμένουν στο στήθος. Κορμός διατηρείται ίσιος, στήθος ψηλό, κοιλιά σφιχτή. Πιέζουμε δυναμικά ολόκληρο το πέλμα στο δάπεδο (εστιάζοντας σε φτέρνες και μέσο πέλμα). Τα ισχία και τα γόνατα εκτείνονται ταυτόχρονα με ενιαίο ρυθμό καθώς το σώμα σηκώνεται ομαλά.',
        changeFromPrevious: 'Δυναμική πίεση από τα πέλματα και ταυτόχρονη έκταση γονάτων και ισχίων προς τα επάνω.',
        phaseType: 'ascent',
      },
      {
        label: 'Τελική θέση — Επαναφορά στην αρχική θέση',
        poseDescription: 'Τελική θέση: Πλήρης επαναφορά στην αρχική όρθια στάση. Κεφάλι και βλέμμα ευθεία μπροστά, χέρια μπροστά στο στήθος, στήθος ψηλό και ανοιχτό, ώμοι πίσω και κάτω, κοιλιά ενεργή, λεκάνη ουδέτερη, πέλματα ολόκληρα στο δάπεδο στο άνοιγμα των ώμων. Η στάση είναι απόλυτα ταυτόσημη με το Καρέ 1.',
        changeFromPrevious: 'Πλήρης ολοκλήρωση του καθίσματος και επιστροφή στην όρθια στάση, απόλυτα ταυτόσημη με το Καρέ 1.',
        phaseType: 'final',
      }
    );
  } else if (isRuvexa) {
    // 7 καρέ για το Ruvexa (TRX Πλάγια Προβολή):
    // 1: Αρχή — Όρθιος κρατώντας τους ιμάντες TRX
    // 2: Κίνηση 1 — Πλάγια προβολή αριστερά
    // 3: Κίνηση 2 — Επιστροφή στο κέντρο
    // 4: Κορύφωση — Πλάγια προβολή δεξιά
    // 5: Επιστροφή 1 — Επιστροφή στο κέντρο
    // 6: Επιστροφή 2 — Πλάγια προβολή αριστερά
    // 7: Τέλος / Αρχική — Όρθιος κρατώντας τους ιμάντες TRX (sameImageAs: 1)
    generatedPhases.push(
      {
        label: 'Θέση 1 (Αρχή) — Όρθιος κρατώντας τους ιμάντες TRX',
        poseDescription: 'Αρχική θέση (Θέση 1): Κεφάλι σε ίσια ευθεία, βλέμμα στραμμένο σταθερά μπροστά στον ορίζοντα προς το σημείο πρόσδεσης του TRX, χωρίς σκύψιμο. Χέρια κρατούν τις λαβές του TRX σταθερά, με τις παλάμες να κοιτάνε αντικριστά (η μία την άλλη), οι αγκώνες είναι ελαφρώς λυγισμένοι δίπλα στα πλευρά σε απόσταση περίπου 25 εκατοστών από το στήθος, με ήπια τάση στους ιμάντες χωρίς να κρεμόμαστε προς τα πίσω. Κορμός απόλυτα όρθιος και στητός, στήθος ανοιχτό και ψηλό, ώμοι τραβηγμένοι πίσω και κάτω μακριά από τα αυτιά, κοιλιά σφιγμένη για σταθερότητα. Λεκάνη οριζόντια και ευθυγραμμισμένη. Πόδια όρθια, πέλματα παράλληλα στο άνοιγμα των ισχίων, πατώντας ολόκληρα σταθερά στο πάτωμα.',
        changeFromPrevious: 'Αρχική σταθεροποίηση σε όρθια στάση κρατώντας τις λαβές TRX με παλάμες αντικριστά.',
        phaseType: 'initial',
      },
      {
        label: 'Θέση 2 (Κίνηση 1) — Πλάγια προβολή αριστερά',
        poseDescription: 'Κίνηση 1 (Θέση 2): Κεφάλι ψηλά, βλέμμα σταθερό ευθεία μπροστά στον ορίζοντα χωρίς να κοιτάμε κάτω. Χέρια κρατούν τις λαβές TRX με παλάμες αντικριστά και εκτείνονται απαλά μπροστά υποβοηθώντας την ισορροπία χωρίς να τραβούν με δύναμη. Κορμός ίσιος με πολύ μικρή φυσική κλίση εμπρός από τα ισχία, στήθος ανοιχτό, ώμοι σταθεροί, κοιλιά σφιχτή. Λεκάνη μετατοπίζεται προς τα αριστερά και πίσω (σαν να καθόμαστε σε καρέκλα προς την αριστερή πλευρά), παραμένοντας παράλληλη με το έδαφος χωρίς να στρίβει. Το αριστερό πόδι ανοίγει στο πλάι με σταθερό βήμα και το γόνατο λυγίζει στις 90 μοίρες ακριβώς πάνω από τα δάχτυλα, με ολόκληρο το αριστερό πέλμα κολλημένο στο πάτωμα. Το δεξί πόδι παραμένει απόλυτα τεντωμένο με ολόκληρο το πέλμα κάτω.',
        changeFromPrevious: 'Πλάγιο βήμα αριστερά, κάμψη αριστερού γονάτου στις 90 μοίρες, τέντωμα δεξιού ποδιού και ήπια έκταση χεριών στο TRX.',
        phaseType: 'descent',
      },
      {
        label: 'Θέση 3 (Κίνηση 2) — Επιστροφή στο κέντρο',
        poseDescription: 'Κίνηση 2 (Θέση 3): Κεφάλι σε ευθεία, βλέμμα σταθερά μπροστά. Χέρια με παλάμες αντικριστά στις λαβές TRX, αγκώνες επανέρχονται σε ελαφριά κάμψη δίπλα στα πλευρά καθοδηγώντας το σώμα χωρίς απότομο τράβηγμα. Κορμός επανέρχεται σε πλήρη κατακόρυφη στάση, στήθος ανοιχτό, ώμοι χαμηλά πίσω και κάτω, κοιλιά σφιχτή. Λεκάνη οριζόντια και ευθυγραμμισμένη στο κέντρο. Πιέζουμε δυναμικά από το αριστερό πέλμα για να σηκωθούμε. Και τα δύο πόδια έρχονται ξανά τεντωμένα με τα πέλματα παράλληλα στο άνοιγμα των ισχίων, πατώντας ολόκληρα στο δάπεδο.',
        changeFromPrevious: 'Ώθηση από το αριστερό πέλμα, επαναφορά των ποδιών στο κέντρο και επιστροφή στην όρθια στάση TRX.',
        phaseType: 'ascent',
      },
      {
        label: 'Θέση 4 (Κορύφωση) — Πλάγια προβολή δεξιά',
        poseDescription: 'Κορύφωση (Θέση 4): Κεφάλι ψηλά, βλέμμα κοιτάζει σταθερά ευθεία μπροστά στον ορίζοντα. Χέρια κρατούν τις λαβές TRX με παλάμες αντικριστά, απλώνοντας απαλά μπροστά για καθοδήγηση και στήριξη. Κορμός ίσιος με ήπια κλίση από τα ισχία, στήθος ανοιχτό, ώμοι πίσω και κάτω, κοιλιά σφιχτή. Λεκάνη μετατοπίζεται προς τα δεξιά και πίσω, παραμένοντας σταθερή και οριζόντια χωρίς να στρίβει. Το δεξί πόδι ανοίγει δεξιά και λυγίζει στο γόνατο στις 90 μοίρες ακριβώς πάνω από τα δάχτυλα, με ολόκληρο το δεξί πέλμα στο πάτωμα. Το αριστερό πόδι μένει απόλυτα τεντωμένο με ολόκληρο το πέλμα κολλημένο στο δάπεδο.',
        changeFromPrevious: 'Πλάγιο βήμα δεξιά, κάμψη του δεξιού γονάτου στις 90 μοίρες, πλήρες τέντωμα του αριστερού ποδιού και άνοιγμα χεριών στο TRX.',
        phaseType: 'apex',
      },
      {
        label: 'Θέση 5 (Επιστροφή 1) — Επιστροφή στο κέντρο',
        poseDescription: 'Επιστροφή 1 (Θέση 5): Κεφάλι ίσιο, βλέμμα οριζόντια μπροστά. Χέρια κρατούν τις λαβές TRX με παλάμες αντικριστά, αγκώνες μαλακά λυγισμένοι δίπλα στα πλευρά. Κορμός ίσιος και στητός, στήθος ψηλό, ώμοι χαλαροί πίσω και κάτω, κοιλιά ενεργή. Λεκάνη οριζόντια στο κέντρο βάρους. Πιέζουμε από το δεξί πέλμα, και τα δύο πόδια τεντώνουν και τα πέλματα έρχονται παράλληλα στο άνοιγμα των ισχίων με πλήρη επαφή στο έδαφος.',
        changeFromPrevious: 'Ώθηση από το δεξί πέλμα και επαναφορά στο κέντρο σε σταθερή όρθια στάση.',
        phaseType: 'ascent',
      },
      {
        label: 'Θέση 6 (Επιστροφή 2) — Πλάγια προβολή αριστερά',
        poseDescription: 'Επιστροφή 2 (Θέση 6): Κεφάλι ψηλά, βλέμμα ευθεία μπροστά στον ορίζοντα. Χέρια με παλάμες αντικριστά στο TRX απλωμένα εμπρός για ομαλή υποστήριξη. Κορμός ίσιος με ελαφριά κλίση από τα ισχία, ώμοι μακριά από τα αυτιά, στήθος ανοιχτό, κοιλιά σφιχτή. Λεκάνη μετατοπισμένη πίσω και αριστερά. Το αριστερό γόνατο λυγισμένο στις 90 μοίρες πάνω από το αριστερό πέλμα που πατάει ολόκληρο, δεξί πόδι τεντωμένο με πέλμα στο έδαφος.',
        changeFromPrevious: 'Δεύτερη πλάγια προβολή αριστερά με κάμψη του γονάτου στις 90 μοίρες για ολοκλήρωση του κινητικού κύκλου.',
        phaseType: 'descent',
      },
      {
        label: 'Θέση 7 (Τέλος / Αρχική) — Πλήρης επαναφορά στην αρχική θέση',
        poseDescription: 'Τέλος / Αρχική (Θέση 7): Κεφάλι ευθυγραμμισμένο με το βλέμμα ευθεία μπροστά προς το σημείο πρόσδεσης. Χέρια κρατούν τις λαβές TRX με παλάμες αντικριστά, αγκώνες ελαφρώς λυγισμένοι δίπλα στα πλευρά, ήπια τάση στους ιμάντες χωρίς κρέμασμα. Κορμός στητός, στήθος περήφανο και ανοιχτό, ώμοι τραβηγμένοι πίσω και κάτω, σπονδυλική στήλη ευθεία, κοιλιά ενεργή. Λεκάνη σταθερή και οριζόντια. Πόδια όρθια, πέλματα παράλληλα στο άνοιγμα των ισχίων, πατώντας ολόκληρα σταθερά στο πάτωμα. Η στάση είναι απόλυτα ταυτόσημη με το Καρέ 1.',
        changeFromPrevious: 'Ώθηση από το αριστερό πέλμα και πλήρης επαναφορά στην αρχική θέση TRX, απόλυτα ταυτόσημη με το Καρέ 1.',
        phaseType: 'final',
      }
    );
  } else if (complexity === 'simple') {
    // Βασικές απλές ασκήσεις: 3 καρέ (αρχική -> βασική -> επαναφορά)
    const init = getPhaseSpecificCoaching(exercise, 'initial');
    const apex = getPhaseSpecificCoaching(exercise, 'apex');
    const reset = getPhaseSpecificCoaching(exercise, 'final');

    generatedPhases.push(
      {
        label: 'Αρχική θέση',
        poseDescription: init.pose,
        changeFromPrevious: init.change,
        phaseType: 'initial',
      },
      {
        label: 'Βασική θέση της κίνησης',
        poseDescription: apex.pose,
        changeFromPrevious: apex.change,
        phaseType: 'apex',
      },
      {
        label: 'Επιστροφή στην αρχική θέση',
        poseDescription: reset.pose,
        changeFromPrevious: reset.change,
        phaseType: 'final',
      }
    );
  } else if (complexity === 'moderate') {
    // 4 έως 5 καρέ
    const init = getPhaseSpecificCoaching(exercise, 'initial');
    const descent = getPhaseSpecificCoaching(exercise, 'descent');
    const apex = getPhaseSpecificCoaching(exercise, 'apex');
    const ascent = getPhaseSpecificCoaching(exercise, 'ascent');
    const reset = getPhaseSpecificCoaching(exercise, 'final');

    generatedPhases.push(
      {
        label: 'Αρχική θέση',
        poseDescription: init.pose,
        changeFromPrevious: init.change,
        phaseType: 'initial',
      },
      {
        label: 'Φάση καθόδου / προετοιμασίας',
        poseDescription: descent.pose,
        changeFromPrevious: descent.change,
        phaseType: 'descent',
      },
      {
        label: 'Κύρια θέση της κίνησης',
        poseDescription: apex.pose,
        changeFromPrevious: apex.change,
        phaseType: 'apex',
      },
      {
        label: 'Φάση επιστροφής',
        poseDescription: ascent.pose,
        changeFromPrevious: ascent.change,
        phaseType: 'ascent',
      },
      {
        label: 'Επιστροφή στην αρχική θέση',
        poseDescription: reset.pose,
        changeFromPrevious: reset.change,
        phaseType: 'final',
      }
    );
  } else {
    // Complex flow / combos (5 έως 7 καρέ, max 15)
    const sourceList = Array.isArray(sourceFrames) && sourceFrames.length > 0 ? sourceFrames : [];

    if (sourceList.length >= 3 && sourceList.length <= 14) {
      const cleanList = sourceList.filter(
        (f) => !norm(f.label || '').includes('ενδιαμεσο') && !norm(f.label || '').includes('ενδιάμεσο')
      );

      const init = getPhaseSpecificCoaching(exercise, 'initial', cleanList[0]?.poseDescription || cleanList[0]?.sourceCue);
      generatedPhases.push({
        label: 'Αρχική θέση',
        poseDescription: init.pose,
        changeFromPrevious: init.change,
        phaseType: 'initial',
      });

      const intermediates = cleanList.slice(1, cleanList.length - 1);
      const allowedIntermediates = intermediates.slice(0, 13);

      for (let i = 0; i < allowedIntermediates.length; i++) {
        const item = allowedIntermediates[i];
        const cue = clean(item.poseDescription || item.sourceCue || item.cue || item.label);
        const apexCoach = getPhaseSpecificCoaching(exercise, 'apex', cue);

        generatedPhases.push({
          label: clean(item.label) || `Στάδιο κίνησης ${i + 1}`,
          poseDescription: `${cue}. ${apexCoach.pose}`,
          changeFromPrevious: `Μετάβαση στο στάδιο ${i + 1}: ${apexCoach.change}`,
          phaseType: 'apex',
        });
      }

      const reset = getPhaseSpecificCoaching(exercise, 'final');
      generatedPhases.push({
        label: 'Επιστροφή στην αρχική θέση',
        poseDescription: reset.pose,
        changeFromPrevious: reset.change,
        phaseType: 'final',
      });
    } else {
      const rawSentences = sentences(exercise.instructions || exercise.description).filter(
        (s) => s.length > 15 && !norm(s).includes('αποφυγετε') && !norm(s).includes('προσοχη')
      );
      const intermediateSentences = rawSentences.slice(1, Math.min(rawSentences.length, 6));

      const init = getPhaseSpecificCoaching(exercise, 'initial', rawSentences[0]);
      generatedPhases.push({
        label: 'Αρχική θέση',
        poseDescription: init.pose,
        changeFromPrevious: init.change,
        phaseType: 'initial',
      });

      if (intermediateSentences.length === 0) {
        const apex = getPhaseSpecificCoaching(exercise, 'apex');
        generatedPhases.push({
          label: 'Κορυφαία θέση σύνθετης κίνησης',
          poseDescription: apex.pose,
          changeFromPrevious: apex.change,
          phaseType: 'apex',
        });
      } else {
        intermediateSentences.forEach((sentence, i) => {
          const coach = getPhaseSpecificCoaching(exercise, i === intermediateSentences.length - 1 ? 'apex' : 'descent', sentence);
          generatedPhases.push({
            label: `Στάδιο κίνησης ${i + 1}`,
            poseDescription: `${sentence}. ${coach.pose}`,
            changeFromPrevious: `Μετάβαση προς το στάδιο ${i + 1}: ${coach.change}`,
            phaseType: 'apex',
          });
        });
      }

      const reset = getPhaseSpecificCoaching(exercise, 'final');
      generatedPhases.push({
        label: 'Επιστροφή στην αρχική θέση',
        poseDescription: reset.pose,
        changeFromPrevious: reset.change,
        phaseType: 'final',
      });
    }
  }

  // Κρατάμε τις μοναδικές εικόνες μόνο στην έξοδο της κίνησης και φτιάχνουμε
  // την επιστροφή ως aliases των ίδιων καρέ, με ανάποδη σειρά.
  const aliasFrame = (source: RawPhase, targetFrame: number, label: string): RawPhase => ({
    ...source,
    label: targetFrame === 1 ? 'Επιστροφή στην αρχική θέση (επαναφορά)' : 'Επιστροφή · ' + label,
    changeFromPrevious: targetFrame === 1
      ? 'Επιστροφή στην αρχική θέση με επαναχρησιμοποίηση του ίδιου ακριβώς καρέ 1.'
      : 'Επιστροφή με επαναχρησιμοποίηση του ίδιου ακριβώς καρέ ' + targetFrame + '.',
    reuseFrame: targetFrame,
  });

  let playbackPhases: RawPhase[];
  if (isRuvexa && generatedPhases.length >= 7) {
    const phases = generatedPhases;
    playbackPhases = [
      phases[0],
      phases[1],
      aliasFrame(phases[0], 1, 'Επιστροφή στο κέντρο'),
      phases[3],
      aliasFrame(phases[0], 1, 'Επιστροφή στο κέντρο'),
      aliasFrame(phases[1], 2, phases[1].label),
      aliasFrame(phases[0], 1, 'Τελική αρχική θέση'),
    ];
  } else {
    const outbound = generatedPhases.filter((phase, index) => {
      if (index === 0) return true;
      const label = norm(phase.label);
      return phase.phaseType !== 'final' &&
        phase.phaseType !== 'ascent' &&
        !label.includes('επιστροφ') &&
        !label.includes('return') &&
        !label.includes('επαναφορα');
    }).slice(0, 15);

    playbackPhases = [...outbound];
    for (let i = outbound.length - 2; i >= 1; i -= 1) {
      playbackPhases.push(aliasFrame(outbound[i], i + 1, outbound[i].label));
    }
    if (outbound.length > 0) {
      playbackPhases.push(aliasFrame(outbound[0], 1, 'Τελική αρχική θέση'));
    }
  }

  // Το πολύ 15 μοναδικές εικόνες και έως 29 βήματα αναπαραγωγής.
  while (playbackPhases.length > 29) {
    const removable = playbackPhases.findIndex((phase, index) =>
      index > 0 && index < playbackPhases.length - 1 && !phase.reuseFrame
    );
    if (removable < 0) break;
    playbackPhases.splice(removable, 1);
  }

  const total = playbackPhases.length;

  const frames: FrameItem[] = playbackPhases.map((phase, i) => {
    const sameImageAs = phase.reuseFrame || null;
    return {
      frame: i + 1,
      label: phase.label,
      poseDescription: phase.poseDescription,
      changeFromPrevious: phase.changeFromPrevious,
      transitionDescription: phase.changeFromPrevious,
      referenceProfile: profile,
      referenceImage: reference.url,
      referenceSha256: reference.sha256,
      sameImageAs,
      imageUrl: sameImageAs
        ? (playbackPhases[sameImageAs - 1]?.imageUrl || phase.imageUrl)
        : phase.imageUrl,
      prompt: sameImageAs
        ? `REUSE THE EXACT IMAGE FILE from frame ${sameImageAs}. ΜΗΝ ΠΑΡΑΓΕΙΣ ΝΕΑ ΕΙΚΟΝΑ. Επαναχρησιμοποίησε αυτούσιο το αρχείο εικόνας του καρέ ${sameImageAs}. Χωρίς κατοπτρισμό.`
        : promptFor(exercise, profile, phase, i, total),
    };
  });

  return {
    version: 3,
    referenceProfile: profile,
    referenceImage: reference.url,
    referenceSha256: reference.sha256,
    promptTemplate:
      'MANDATORY SOFIA VISUAL REFERENCE LOCK — attach this exact approved model-and-studio photo ' +
      reference.url +
      ' (SHA-256 ' +
      reference.sha256 +
      '). Use that person and that background only. Preserve the exact same identity, facial features, hair, proportions, clothes, shoes, studio lighting and framing in every frame. Camera angle is strictly locked at 45 degrees oblique (neither straight-on front nor fully side profile). Generate one image for one frame from its poseDescription; never invent another model, lighting or background. Generate new images only for unique outward movement frames. Every return phase must reuse the same outward frame images in reverse order via sameImageAs; never generate a new return image. The final frame must reuse Frame 1 exactly.',
    fixedVisualContext:
      'Μοντέλο, ρούχα, παπούτσια, φωτεινότητα, περιβάλλον και γωνία λήψης 45 μοιρών (στη μέση λοξά, ούτε τελείως πλάγια ούτε από μπροστά) παραμένουν ακριβώς απαράλλαχτα όπως στην εγκεκριμένη φωτογραφία αναφοράς. Αλλάζει μόνο η αναλυτική στάση και η μετατόπιση των μελών του σώματος που περιγράφεται σε κάθε καρέ.',
    frameCount: frames.length,
    closingFrameReuses: frames.filter((frame) => frame.sameImageAs === 1).length,
    coachReviewRequired: Boolean(exercise.requiresCoachReview || exercise.newConcept || exercise.custom),
    frames,
  };
}

export function ensureVisualization(exercise: Partial<Exercise> = {}): Exercise {
  const current = exercise.visualization;
  const isValid =
    current?.version === 3 &&
    Array.isArray(current.frames) &&
    current.frames.length >= 3 &&
    current.frames.length <= 30 &&
    (current.frames[current.frames.length - 1].sameImageAs === 1 ||
      (current.frames.length === 4 && current.frames.every((frame) => frame.imageUrl))) &&
    current.frames.every((frame) => frame.prompt && frame.referenceImage && frame.referenceSha256);

  if (isValid) return exercise as Exercise;

  if (current && Array.isArray(current.frames) && current.frames.length >= 2) {
    return { ...exercise, visualization: buildVisualization(exercise, current.frames) } as Exercise;
  }
  return { ...exercise, visualization: buildVisualization(exercise) } as Exercise;
}
