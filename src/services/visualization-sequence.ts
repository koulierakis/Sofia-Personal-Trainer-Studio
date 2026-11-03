import { Exercise, FrameItem, VisualizationSequence } from '../types';
import { VISUAL_REFERENCES, modelProfileFor, lockedVisualPrompt } from './visual-reference-lock';

const COMPLETE_BODY =
  'Πλήρες σώμα μέσα στο κάδρο. Δείξε καθαρά πέλματα και σημεία στήριξης, προσανατολισμό των γονάτων, θέση ισχίων και κορμού, αυχένα, ώμους, αγκώνες, καρπούς και λαβή. Δείξε τη διαδρομή και τον προσανατολισμό του εξοπλισμού. Ακολούθησε μόνο τις γωνίες και τις θέσεις που τεκμηριώνει η περιγραφή· μην επινοήσεις αριθμητικές γωνίες ή τεχνική.';

const clean = (s: any): string => String(s ?? '').replace(/\s+/g, ' ').trim();
const norm = (s: any): string =>
  clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('el-GR');
const sentences = (s: any): string[] =>
  String(s ?? '').split(/(?<=[.!?])\s+|\n+/).map(clean).filter(Boolean);

export type MovementComplexity = 'simple' | 'moderate' | 'complex';

/**
 * Καθορίζει την κινησιολογική πολυπλοκότητα της άσκησης βάσει του μοτίβου κίνησης.
 * - simple: Μονοδιάστατη / βασική άσκηση (π.χ. Squat, Push-up, Biceps Curl, Plank) -> 3 καρέ.
 * - moderate: Μονοποδική ή ασύμμετρη κίνηση (π.χ. Lunge, Bird Dog, Step-up, Pallof Press) -> 4-5 καρέ.
 * - complex: Σύνθετη ροή ή συνδυασμός μοτίβων (π.χ. Zevara, Combo + Reach, Burpee, Walkout) -> 6-8 καρέ (μέγιστο 15).
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

  // Simple basic movements (Squats, Pushups, Hinges, Rows, Curls, Presses, Bridges, Planks)
  return 'simple';
}

/**
 * Αναλυτικές προπονητικές οδηγίες για αρχάριους ανά φάση της κίνησης με υψηλή κινησιολογική ακρίβεια.
 */
function getPhaseSpecificCoaching(
  exercise: Partial<Exercise>,
  phaseType: 'initial' | 'descent' | 'apex' | 'ascent' | 'final',
  rawCue: string = ''
): { pose: string; change: string } {
  const name = norm([exercise.name, exercise.title, exercise.patterns?.join?.(' ')].filter(Boolean).join(' '));
  const isSquat = /squat|καθισ|goblet|thrust/.test(name);
  const isLunge = /lunge|split|προβολ/.test(name);
  const isHinge = /hinge|deadlift|rdl|άρση/.test(name);
  const isPush = /push|press|πίεσ|κάμψ/.test(name);
  const isPull = /pull|row|έλξ|κωπηλα/.test(name);
  const isPlank = /plank|σανίδ|bear|beast|quadruped/.test(name);

  if (phaseType === 'initial') {
    let specific = 'Όρθια στάση με πέλματα παράλληλα στο άνοιγμα των ισχίων ή των ώμων. Το βάρος μοιράζεται ισόποσα στο τρίγωνο κάθε πέλματος (φτέρνα, βάση μεγάλου δακτύλου, βάση μικρού δακτύλου).';
    if (isSquat) {
      specific = 'Όρθια στάση, πέλματα στο άνοιγμα των ώμων με ελαφριά εξωτερική στροφή 10-15 μοιρών. Πέλματα ολόκληρα σε επαφή με το δάπεδο, γόνατα μαλακά, λεκάνη ουδέτερη και θώρακας περήφανος πάνω από τη λεκάνη. Χέρια μπροστά στο στήθος για αντίβαρο και ισορροπία.';
    } else if (isLunge) {
      specific = 'Όρθια σταθερή στάση, πέλματα στο άνοιγμα των ισχίων σαν σε δύο παράλληλες ράγες. Λεκάνη οριζόντια και στραμμένη ευθεία μπροστά, κορμός μακρύς και χέρια στη μέση ή μπροστά.';
    } else if (isHinge) {
      specific = 'Όρθια θέση, πέλματα στο άνοιγμα των ισχίων, γόνατα με μαλακή κάμψη (όχι κλειδωμένα). Ώμοι κάτω και πίσω, ωμοπλάτες σταθερές και ο εξοπλισμός σταθερός κοντά στους μηρούς.';
    } else if (isPlank) {
      specific = 'Σταθερή βάση στήριξης στο στρώμα: παλάμες ή πήχεις ακριβώς κάτω από τους ώμους, δάχτυλα ανοιχτά, πέλματα στο άνοιγμα των ισχίων, αυχένας μακρύς σε ευθεία με τη σπονδυλική στήλη.';
    } else if (isPush) {
      specific = 'Αρχική θέση ώθησης: ώμοι μακριά από τα αυτιά, καρποί σε ουδέτερη ευθεία με τους πήχεις, κορμός σταθερός και ενεργός χωρίς λόρδωση στη μέση.';
    } else if (isPull) {
      specific = 'Αρχική θέση έλξης: σταθερή βάση στήριξης, χέρια τεντωμένα με έλεγχο, ώμοι σταθεροποιημένοι, βλέμμα σταθερό στην τροχιά της κίνησης.';
    }

    return {
      pose: `Αρχική θέση προετοιμασίας: ${specific} Η σπονδυλική στήλη διατηρεί τα φυσικά της κυρτώματα, ο αυχένας είναι ουδέτερος και το βλέμμα εστιασμένο οριζόντια μπροστά. ${rawCue ? `[Οδηγία άσκησης: ${clean(rawCue)}]` : ''}`,
      change: 'Αρχική τοποθέτηση του σώματος πριν από την έναρξη της επανάληψης. Όλα τα μέλη του σώματος είναι σταθεροποιημένα στην ουδέτερη βάση.',
    };
  }

  if (phaseType === 'descent') {
    let specific = 'Ελεγχόμενη έναρξη της κίνησης: μετακίνησε ελεγχόμενα τις κύριες αρθρώσεις, διατηρώντας ακλόνητα τα σημεία στήριξης.';
    if (isSquat) {
      specific = 'Έναρξη καθόδου: τα ισχία ξεκινούν να κινούνται προς τα πίσω και κάτω, ενώ τα γόνατα λυγίζουν ταυτόχρονα και ανοίγουν προς την κατεύθυνση των δακτύλων. Τα πέλματα παραμένουν κολλημένα στο δάπεδο, ο κορμός γέρνει ελαφρά εμπρός διατηρώντας ίσια πλάτη, και τα χέρια παραμένουν προτεταμένα για ισορροπία.';
    } else if (isLunge) {
      specific = 'Βήμα πίσω σε προβολή: το πίσω πόδι πατά στα δάχτυλα με τη φτέρνα ψηλά, η λεκάνη μένει οριζόντια και χαμηλώνει κατακόρυφα, ενώ το μπροστινό γόνατο παραμένει ακριβώς πάνω από τον αστράγαλο χωρίς να συγκλίνει προς τα μέσα.';
    } else if (isHinge) {
      specific = 'Κάμψη ισχίων (hip hinge): στείλε τη λεκάνη ευθεία πίσω σαν να κλείνεις μια πόρτα με τους γλουτούς. Τα γόνατα διατηρούν ελαφρά σταθερή κάμψη, ο κορμός κλίνει από τα ισχία ως ενιαίο μπλοκ και το βάρος μένει κοντά στα πόδια.';
    } else if (isPlank) {
      specific = 'Μετάβαση ελέγχου: μετατόπισε ελαφρά το βάρος διατηρώντας τη λεκάνη απολύτως παράλληλη με το έδαφος, χωρίς βύθιση της μέσης ή ανασήκωμα των γλουτών.';
    }

    return {
      pose: `Φάση καθόδου / προετοιμασίας: ${specific} Τα κινούμενα τμήματα μετακινούνται ομαλά, ενώ ο πυρήνας και η σπονδυλική στήλη παραμένουν ενεργά σταθερά. ${rawCue ? `[Οδηγία: ${clean(rawCue)}]` : ''}`,
      change: 'Μετάβαση από την αρχική όρθια θέση προς το βάθος της κίνησης. Οι αρθρώσεις κάμπτονται προοδευτικά χωρίς απότομες μετατοπίσεις ή απώλεια ισορροπίας.',
    };
  }

  if (phaseType === 'apex') {
    let specific = 'Βασική θέση / κορυφαίο σημείο της κίνησης: ολοκλήρωσε το πλήρες ελεγχόμενο εύρος της άσκησης.';
    if (isSquat) {
      specific = 'Βασική θέση βαθύ καθίσματος (Squat Apex): οι μηροί φτάνουν παράλληλοι με το δάπεδο (ή στο μέγιστο άνετο εύρος). Τα γόνατα είναι σταθερά πάνω από τα δάχτυλα, οι φτέρνες πατούν σταθερά στο έδαφος χωρίς ανασήκωμα, η μέση παραμένει ουδέτερη χωρίς κύρτωση, και το στήθος παραμένει ψηλό με το βλέμμα ευθεία.';
    } else if (isLunge) {
      specific = 'Κύρια θέση προβολής (Lunge Depth): και τα δύο γόνατα σχηματίζουν γωνία περίπου 90 μοιρών. Το πίσω γόνατο βρίσκεται λίγο πάνω από το δάπεδο, η λεκάνη είναι ευθυγραμμισμένη και το μπροστινό πέλμα δέχεται ομοιόμορφα το φορτίο.';
    } else if (isHinge) {
      specific = 'Μέγιστη κάμψη ισχίων: ο κορμός έχει κλίση περίπου 45-60 μοιρών με την πλάτη απόλυτα ευθεία. Οι οπίσθιοι μηριαίοι φορτίζονται ενεργά, ο αυχένας παραμένει σε ευθεία με τον θώρακα και η λεκάνη βρίσκεται στο μέγιστο πίσω σημείο.';
    } else if (isPush) {
      specific = 'Τελικό σημείο πίεσης: οι αγκώνες φτάνουν στην προβλεπόμενη θέση χωρίς κλείδωμα, οι ώμοι μένουν σταθεροί και το στήθος παραμένει ανοιχτό.';
    } else if (isPull) {
      specific = 'Κορυφαία σύσπαση έλξης: οι αγκώνες έχουν οδηγηθεί πίσω κοντά στα πλευρά, οι ωμοπλάτες πλησιάζουν ελεγχόμενα χωρίς ανύψωση των τραπεζοειδών.';
    } else if (isPlank) {
      specific = 'Κύρια θέση στήριξης / αιώρησης: το σώμα σχηματίζει συμπαγή ευθεία γραμμή από την κορυφή του κεφαλιού έως τις φτέρνες. Κοιλιακοί και γλουτοί είναι σε ισομετρική σύσπαση.';
    }

    return {
      pose: `Βασική θέση της κίνησης: ${specific} Στιγμιαία παύση ελέγχου στο σημείο μέγιστης φόρτισης πριν από την εκκίνηση της επιστροφής. ${rawCue ? `[Στόχος: ${clean(rawCue)}]` : ''}`,
      change: 'Ολοκλήρωση της κύριας φάσης της κίνησης. Οι μοχλοί του σώματος έχουν φτάσει στο μέγιστο λειτουργικό εύρος και προετοιμάζονται για την επιστροφή.',
    };
  }

  if (phaseType === 'ascent') {
    let specific = 'Φάση επιστροφής / ανόδου: πίεσε από τα σημεία στήριξης για να επαναφέρεις το σώμα κατά μήκος της αντίστροφης τροχιάς.';
    if (isSquat) {
      specific = 'Άνοδος από το κάθισμα: πίεσε δυναμικά ολόκληρο το πέλμα στο δάπεδο (εστιάζοντας σε φτέρνα και μέσο πέλμα). Τα ισχία και τα γόνατα εκτείνονται ταυτόχρονα με τον ίδιο ρυθμό, διατηρώντας τον θώρακα ανοιχτό μέχρι την πλήρη έκταση.';
    } else if (isLunge) {
      specific = 'Ώθηση επιστροφής: πίεσε από το μπροστινό πέλμα, φέρε το πίσω πόδι μπροστά και σταθεροποίησε τη λεκάνη καθώς επανασυνδέεσαι με την αρχική στάση.';
    } else if (isHinge) {
      specific = 'Έκταση ισχίων: σφίξε τους γλουτούς και οδήγησε τη λεκάνη εμπρός στην αρχική όρθια θέση, χωρίς να υπερεκτείνεις τη μέση στην κορυφή.';
    }

    return {
      pose: `Φάση επιστροφής: ${specific} Η κίνηση εκτελείται αντίστροφα με απόλυτο κινησιολογικό έλεγχο και σταθερή αναπνοή.`,
      change: 'Επιστροφή από το τελικό σημείο προς τη βάση. Οι αρθρώσεις επανέρχονται ομαλά στην ουδέτερη θέση εκκίνησης.',
    };
  }

  // Final return to initial position
  const initial = getPhaseSpecificCoaching(exercise, 'initial', rawCue);
  return {
    pose: initial.pose,
    change: 'Πλήρης ολοκλήρωση της επανάληψης και επαναφορά στην αρχική θέση. Η σωματική στάση, τα σημεία στήριξης, η ευθυγράμμιση και η λαβή είναι απόλυτα ταυτόσημα με το Καρέ 1.',
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
    `Ακριβής στάση του σώματος σε αυτό το στιγμιότυπο: ${phase.poseDescription}`,
    `Αλλαγή από το προηγούμενο καρέ: ${phase.changeFromPrevious}`,
    COMPLETE_BODY,
    `Οδηγίες άσκησης: ${clean(exercise.instructions || exercise.description)}`,
    `Μυϊκές ομάδες: ${(exercise.muscles || exercise.primaryMuscles || []).join?.(', ') || 'σύμφωνα με την περιγραφή'}.`,
    'Μία μόνο φωτογραφική στάση, χωρίς κολάζ, βέλη, λεζάντες ή πρόσθετα άκρα.',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Κατασκευάζει την ολοκληρωμένη κινησιολογική αλληλουχία καρέ (VisualizationSequence)
 * διασφαλίζοντας:
 * 1. Ελάχιστο αριθμό καρέ ανάλογα με την πραγματική πολυπλοκότητα (3 καρέ για squat/απλές).
 * 2. Αυστηρό εύρος 3 έως 15 καρέ (καμία άσκηση > 15 καρέ).
 * 3. Πρώτο και τελευταίο καρέ με ταυτόσημη σωματική στάση (sameImageAs: 1).
 * 4. Καμία τεχνητή παραγωγή περιττών επαναλαμβανόμενων bridge frames.
 */
export function buildVisualization(
  exercise: Partial<Exercise> = {},
  sourceFrames: any[] | null = null
): VisualizationSequence {
  const profile = modelProfileFor(exercise);
  const reference = VISUAL_REFERENCES[profile];
  const complexity = classifyExerciseComplexity(exercise);

  interface RawPhase {
    label: string;
    poseDescription: string;
    changeFromPrevious: string;
    phaseType: 'initial' | 'descent' | 'apex' | 'ascent' | 'final';
  }

  const generatedPhases: RawPhase[] = [];

  if (complexity === 'simple') {
    // Απλή άσκηση (όπως squat): Ακριβώς 3 καρέ:
    // 1) Αρχική θέση
    // 2) Βασική θέση της κίνησης (apex/depth)
    // 3) Επιστροφή στην αρχική θέση (ταυτόσημη με το καρέ 1)
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
    // Μέτρια πολυπλοκότητα: 4 έως 5 καρέ (προετοιμασία -> κάθοδος/μετάβαση -> κύρια στάση -> επαναφορά -> αρχική)
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
    // Σύνθετη άσκηση (complex flow / combo):
    // Εξαγωγή των πραγματικών διακριτών σταδίων χωρίς τεχνητά bridge frames
    const sourceList = Array.isArray(sourceFrames) && sourceFrames.length > 0 ? sourceFrames : [];

    if (sourceList.length >= 3 && sourceList.length <= 14) {
      // Καθαρισμός από τυχόν παλιά bridge labels ("ενδιάμεσο")
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
      // Περιορισμός ενδιάμεσων ώστε το σύνολο να μην ξεπερνά τα 14 (συν το τελικό = 15)
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
      // Εξαγωγή από περιγραφή ή φάσεις του exercise
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

  // Αυστηρός έλεγχος διασφάλισης εύρους: 3 έως 15 καρέ
  while (generatedPhases.length > 15) {
    // Αφαίρεση περιττών ενδιάμεσων καρέ αν ξεπερνούν τα 15
    generatedPhases.splice(Math.floor(generatedPhases.length / 2), 1);
  }

  const total = generatedPhases.length;

  const frames: FrameItem[] = generatedPhases.map((phase, i) => {
    const isFirst = i === 0;
    const isLast = i === total - 1;

    return {
      frame: i + 1,
      label: phase.label,
      poseDescription: phase.poseDescription,
      changeFromPrevious: phase.changeFromPrevious,
      transitionDescription: phase.changeFromPrevious,
      referenceProfile: profile,
      referenceImage: reference.url,
      referenceSha256: reference.sha256,
      sameImageAs: isLast ? 1 : null,
      prompt: isLast
        ? 'REUSE THE EXACT IMAGE FILE GENERATED FOR FRAME 1. Do not generate or alter another model, pose, camera, equipment or background.'
        : promptFor(exercise, profile, phase, i, total),
    };
  });

  return {
    version: 2,
    referenceProfile: profile,
    referenceImage: reference.url,
    referenceSha256: reference.sha256,
    promptTemplate:
      'MANDATORY SOFIA VISUAL REFERENCE LOCK — attach this exact approved model-and-studio photo ' +
      reference.url +
      ' (SHA-256 ' +
      reference.sha256 +
      '). Use that person and that background only. Preserve the same identity, facial features, hair, proportions, clothes, shoes, camera, framing and studio in every frame. Generate one image for one frame from its poseDescription; never invent another model or background. The final frame with sameImageAs must reuse the source image file exactly.',
    fixedVisualContext:
      'Μοντέλο και περιβάλλον/φόντο παραμένουν ακριβώς όπως στην εγκεκριμένη φωτογραφία αναφοράς. Αλλάζει μόνο η στάση και η φάση της άσκησης που περιγράφεται σε κάθε καρέ.',
    frameCount: frames.length,
    closingFrameReuses: 1,
    coachReviewRequired: Boolean(exercise.requiresCoachReview || exercise.newConcept || exercise.custom),
    frames,
  };
}

export function ensureVisualization(exercise: Partial<Exercise> = {}): Exercise {
  const current = exercise.visualization;
  // Ελέγχουμε αν υπάρχει ήδη έγκυρη ακολουθία έκδοσης 2 με 3 έως 15 καρέ
  const isValid =
    current?.version === 2 &&
    Array.isArray(current.frames) &&
    current.frames.length >= 3 &&
    current.frames.length <= 15 &&
    current.frames[current.frames.length - 1].sameImageAs === 1 &&
    current.frames.every((frame) => frame.prompt && frame.referenceImage && frame.referenceSha256);

  if (isValid) return exercise as Exercise;

  if (current && Array.isArray(current.frames) && current.frames.length >= 2) {
    return { ...exercise, visualization: buildVisualization(exercise, current.frames) } as Exercise;
  }
  return { ...exercise, visualization: buildVisualization(exercise) } as Exercise;
}
