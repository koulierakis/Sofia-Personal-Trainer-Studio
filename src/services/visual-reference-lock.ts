import { Exercise } from '../types';

export interface VisualReference {
  profile: 'female' | 'male';
  file: string;
  url: string;
  sha256: string;
  athleteName: string;
  athleteTitleGreek: string;
  outfitGreek: string;
  studioDescriptionGreek: string;
}

export const VISUAL_REFERENCES: Record<'female' | 'male', VisualReference> = Object.freeze({
  female: Object.freeze({
    profile: 'female' as const,
    file: 'athletico-female-reference.jpg',
    url: '/images/athletes/athletico-female-reference.jpg',
    sha256: '59c9c2fc50bf64bc9e7e462084b068d2bf2272741b84e0138426b63b4df081c6',
    athleteName: 'Athletico Female Athlete (Sofia Approved)',
    athleteTitleGreek: 'Γυναίκα Αθλήτρια ATHLETICO (Επίσημη Αναφορά)',
    outfitGreek: 'Μαύρο αθλητικό τοπ & μαύρο σορτς, λευκά αθλητικά παπούτσια',
    studioDescriptionGreek: 'Studio ATHLETICO Fitness Boutique (φωτεινός χώρος, σκούρο μάρμαρο, ξύλινα πάνελ & επιγραφή ATHLETICO)',
  }),
  male: Object.freeze({
    profile: 'male' as const,
    file: 'athletico-male-reference.jpg',
    url: '/images/athletes/athletico-male-reference.jpg',
    sha256: '132c39d363c91a4d49e117c408471bfcfa99d018e003b26ccec6519261569bd5',
    athleteName: 'Athletico Male Athlete (Sofia Approved)',
    athleteTitleGreek: 'Άνδρας Αθλητής ATHLETICO (Επίσημη Αναφορά)',
    outfitGreek: 'Μαύρο t-shirt & γκρι αθλητικό σορτς, λευκά αθλητικά παπούτσια',
    studioDescriptionGreek: 'Studio ATHLETICO Fitness Boutique (φωτεινός χώρος, σκούρο μάρμαρο, ξύλινα πάνελ & επιγραφή ATHLETICO)',
  }),
});

/**
 * ΑΥΣΤΗΡΗ ΕΠΙΣΗΜΗ ΟΔΗΓΙΑ ΚΛΕΙΔΩΜΑΤΟΣ & ΑΣΦΑΛΙΣΤΙΚΗ ΔΙΚΛΕΙΔΑ:
 * Όποιος επιχειρήσει ή έχει εντολή ή εξουσιοδότηση να προβεί σε αλλαγές
 * υποχρεούται αυστηρά και απαρέγκλιτα να χρησιμοποιήσει αποκλειστικά το ανατεθειμένο
 * μοντέλο αναφοράς, τα ίδια ρούχα, τον ίδιο χώρο studio ATHLETICO και τη σταθερή
 * λήψη στις 45 μοίρες (στη μέση λοξά). Διαφορετικά η οπτικοποίηση μπλοκάρεται αυτόματα.
 */
export const STRICT_VISUAL_LOCK_DIRECTIVE = `
ΑΥΣΤΗΡΟΣ ΚΑΝΟΝΑΣ ΑΠΟΛΥΤΟΥ ΟΠΤΙΚΟΥ ΚΛΕΙΔΩΜΑΤΟΣ & ΑΣΦΑΛΙΣΤΙΚΗ ΔΙΚΛΕΙΔΑ:
Όποιος χειρίζεται την εφαρμογή Sofia Personal Training Studio και επιχειρήσει ή έχει εντολή ή εξουσιοδότηση να προβεί σε αλλαγές ή παραγωγή εικόνων, ΥΠΟΧΡΕΟΥΤΑΙ ΑΥΣΤΗΡΑ ΚΑΙ ΑΠΟΚΛΕΙΣΤΙΚΑ να τηρεί απαρέγκλιτα τα εξής σε ΟΛΕΣ τις ασκήσεις:
1. ΜΟΝΤΕΛΟ: Χρησιμοποιείται ΜΟΝΟ ΤΟ ΕΓΚΕΚΡΙΜΕΝΟ ΜΟΝΤΕΛΟ ΑΝΑΦΟΡΑΣ που έχει ανατεθεί στην άσκηση (Athletico Female ή Athletico Male), και στις συνδυαστικές ασκήσεις και τα δύο.
2. ΕΝΔΥΜΑΣΙΑ & ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ: Αυστηρά τα ίδια ρούχα (μαύρο athletic outfit για γυναίκα, μαύρο t-shirt και γκρι shorts για άνδρα), λευκά sneakers, ίδια μαλλιά και φυσικά χαρακτηριστικά.
3. ΠΕΡΙΒΑΛΛΟΝ & ΦΩΤΕΙΝΟΤΗΤΑ: Το ίδιο ακριβώς φόντο του studio ATHLETICO Fitness Boutique με την ίδια φωτεινότητα, μάρμαρο, ξύλο και λογότυπο.
4. ΟΠΤΙΚΗ ΓΩΝΙΑ ΛΗΨΗΣ: Σταθερή λήψη στις 45 μοίρες (ούτε τελείως πλάγια, ούτε μετωπική από μπροστά, ακριβώς στη μέση λοξά) για ιδανική οπτική επαφή με το βάθος της κίνησης και τις ευθυγραμμίσεις.
ΑΣΦΑΛΙΣΤΙΚΗ ΔΙΚΛΕΙΔΑ: Απαγορεύεται ρητά οποιαδήποτε παρέκκλιση. Εάν δεν επιβεβαιωθεί η αυστηρή τήρηση του κλειδωμένου μοντέλου και των χαρακτηριστικών, η εφαρμογή μπλοκάρει υποχρεωτικά την έναρξη οπτικοποίησης.
`;

/**
 * Υπολογίζει με ντετερμινιστικό ψευδοτυχαίο τρόπο την κατανομή των δύο μοντέλων (50% άνδρας / 50% γυναίκα)
 * σε όλες τις ασκήσεις της βιβλιοθήκης.
 */
export function modelProfileFor(exercise: Partial<Exercise> = {}): 'female' | 'male' {
  if (exercise.modelProfile === 'female' || exercise.modelProfile === 'male') {
    return exercise.modelProfile;
  }
  const key = String(exercise.id || exercise.name || exercise.title || '');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 2 === 0 ? 'male' : 'female';
}

export function lockedVisualPrompt(
  exercise: Partial<Exercise> = {},
  phaseCue: string = '',
  profile: 'female' | 'male' = modelProfileFor(exercise)
): string {
  const ref = VISUAL_REFERENCES[profile];
  if (!ref) throw new Error('No approved Sofia model reference selected');
  const equipment = Array.isArray(exercise.equipment)
    ? exercise.equipment.join(', ')
    : String(exercise.equipment || 'Bodyweight');

  return [
    'MANDATORY SOFIA VISUAL REFERENCE LOCK — DO NOT OVERRIDE.',
    'Attach and use this exact approved image as the sole athlete identity, clothing, lighting and studio reference: ' +
      ref.url +
      ' (SHA-256 ' +
      ref.sha256 +
      ').',
    'Use only the person shown in that attached reference. Preserve the exact same face, hair, body proportions, skin tone, clothing and shoes.',
    'Use only the ATHLETICO studio/background visible in that same reference. Preserve its exact lighting, illumination, marble, wood, furnishings and ATHLETICO sign. Do not invent, replace or alter the model, setting, lighting, logo, text or props.',
    'CAMERA ANGLE: Strictly locked at a 45-degree angle (three-quarter semi-profile view, neither straight-on front nor fully side profile) positioned halfway in between so the viewer has optimal line of sight of all joint depths, limb angles and posture.',
    'Show one athlete only. If the reference cannot be attached and followed, STOP and do not generate.',
    'If a ready-made exercise image is supplied, use it only for pose, movement and equipment. Replace its person and background with the approved reference model and studio.',
    'Exercise: ' +
      String(exercise.name || exercise.title || 'Custom exercise') +
      '. Equipment: ' +
      equipment +
      '. Movement phase: ' +
      String(phaseCue || exercise.instructions || 'Follow the exercise instructions exactly.'),
    'Show the complete body and equipment from the locked 45-degree angle. Keep the same camera, 45-degree framing, lighting and studio across every frame. Do not invent transitions.',
  ].join(' ');
}
