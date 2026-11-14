import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Exercise, Program, ReviewMap, ReviewStatus, AppState } from './types';
import { buildOriginalConcepts } from './services/advanced-catalog';
import { ensureVisualization } from './services/visualization-sequence';
import {
  REVIEW_KEY,
  sanitizeReviews,
  reviewConcept,
  reviewStatus,
  visibleConcepts,
  reviewCounts,
} from './services/review-system';
import { FramePlayer } from './components/FramePlayer';
import { PendingVisualBatch } from './components/PendingVisualBatch';
import { firstPendingVisualPlans, mirrorExerciseSequence } from './services/pending-visual-batch';
import { MotionValidation } from './components/MotionValidation';
import { VISUAL_REFERENCES, modelProfileFor } from './services/visual-reference-lock';
import { SofiaAICoach } from './components/SofiaAICoach';
import { HomeAICoachPanel } from './components/HomeAICoachPanel';
import { AppExperience } from './components/AppExperience';

const STORE_KEY = 'sofia_personal_trainer_v3';

const norm = (s: any): string =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('el-GR');

const getExerciseName = (x: Exercise): string => x.name || x.title || x.gr || x.greekName || 'Άσκηση χωρίς τίτλο';
const getEquipmentList = (x: Exercise): string[] => (Array.isArray(x.equipment) ? x.equipment : x.equipment ? [x.equipment] : []);
const getMusclesList = (x: Exercise): string[] =>
  [
    ...(Array.isArray(x.muscles) ? x.muscles : []),
    ...(Array.isArray(x.primaryMuscles) ? x.primaryMuscles : []),
    ...(Array.isArray(x.detailedMuscles) ? x.detailedMuscles : []),
  ].filter(Boolean);

const getDiscipline = (x: Exercise): 'functional' | 'pilates' =>
  x.discipline === 'pilates' || x.trainingType === 'reformer' ? 'pilates' : 'functional';

export const App: React.FC = () => {
  // Application Data States
  const [baseExercises, setBaseExercises] = useState<Exercise[]>([]);
  const [basePrograms, setBasePrograms] = useState<Program[]>([]);
  const [userState, setUserState] = useState<AppState>({ exercises: [], programs: [] });
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [conceptExercises, setConceptExercises] = useState<Exercise[]>([]);

  // Navigation and View States
  const [mode, setMode] = useState<'functional' | 'pilates' | null>(null);
  const [tab, setTab] = useState<'exercises' | 'programs' | 'stretches' | 'data'>('exercises');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // Filters & Controls
  const [showConcepts, setShowConcepts] = useState<boolean>(true);
  const [queueOnly, setQueueOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [limit, setLimit] = useState<number>(20);

  // Status Notice
  const [notice, setNotice] = useState<string>('');
  const noticeTimerRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotice = (msg: string, keep = false) => {
    setNotice(msg);
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
    if (!keep) {
      noticeTimerRef.current = window.setTimeout(() => {
        setNotice('');
        noticeTimerRef.current = null;
      }, 7000);
    }
  };

  // Initialize reviews & concepts on mount
  useEffect(() => {
    try {
      const storedReviews = JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}');
      setReviews(sanitizeReviews(storedReviews));
    } catch {
      setReviews({});
    }

    try {
      const storedState = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (storedState && Array.isArray(storedState.exercises) && Array.isArray(storedState.programs)) {
        setUserState(storedState);
      }
    } catch {
      showNotice('Πρόβλημα ανάγνωσης τοπικών δεδομένων.');
    }

    try {
      const generated = buildOriginalConcepts();
      setConceptExercises(generated);
    } catch (err: any) {
      console.error('Error generating original concepts', err);
    }
  }, []);

  // Fetch built-in exercise and program sets
  useEffect(() => {
    async function loadBuiltIn() {
      const paths = [
        'functional-01.json',
        'functional-02.json',
        'functional-03.json',
        'functional-04.json',
        'functional-programs.json',
      ];
      try {
        const data = await Promise.all(
          paths.map(async (path) => {
            const res = await fetch('/data/' + path, { cache: 'no-cache' });
            if (!res.ok) throw new Error(path + ' HTTP ' + res.status);
            return res.json();
          })
        );

        if (data.slice(0, 4).some((x) => !Array.isArray(x) || x.length !== 25) || !Array.isArray(data[4]) || data[4].length !== 10) {
          throw new Error('Μη αναμενόμενος αριθμός εγγραφών');
        }

        let originalExercises: Exercise[] = [];
        try {
          const originalResponse = await fetch('/data/custom-sequences.json', { cache: 'no-cache' });
          if (originalResponse.ok) {
            originalExercises = await originalResponse.json();
          }
        } catch {
          originalExercises = [];
        }

        const exercises: Exercise[] = (data.slice(0, 4).flat() as Exercise[]).map(ensureVisualization);
        const programs: Program[] = data[4];

        setBaseExercises([...exercises, ...originalExercises.map(ensureVisualization)]);
        setBasePrograms(programs);

        const totalCustom = originalExercises.length + 208;
        showNotice(
          `Φορτώθηκαν 100 κανονικές ασκήσεις, ${totalCustom} Custom ασκήσεις και τα 10 προγράμματα των 60 λεπτών.`
        );
      } catch (err: any) {
        showNotice('Σφάλμα φόρτωσης αρχικής βιβλιοθήκης: ' + err.message + ' — δοκίμασε ανανέωση.', true);
      }
    }

    loadBuiltIn();
  }, []);

  // Sync user state to localStorage
  const saveUserState = (nextState: AppState): boolean => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(nextState));
      setUserState(nextState);
      return true;
    } catch (e: any) {
      showNotice('Αδυναμία αποθήκευσης: ' + e.message + ' · Εξαγάγετε αντίγραφο και ελέγξτε τη χωρητικότητα.');
      return false;
    }
  };

  const handleGeneratedExerciseSave = (exercise: Exercise) => {
    const normalized = ensureVisualization({
      ...exercise,
      custom: true,
      newConcept: true,
      requiresCoachReview: true,
      reviewStatus: 'pending',
    });
    const nextState: AppState = {
      ...userState,
      exercises: [...userState.exercises.filter((item) => item.id !== normalized.id), normalized],
    };
    if (!saveUserState(nextState)) return;
    setMode(normalized.discipline === 'pilates' || normalized.trainingType === 'reformer' ? 'pilates' : 'functional');
    const stretchText = norm([normalized.category, normalized.name, normalized.goal].join(' '));
    setTab(/stretch|mobility|διατα|κινητικο/.test(stretchText) ? 'stretches' : 'exercises');
    setSelectedProgramId(null);
    setQueueOnly(false);
    setShowConcepts(true);
    setSelectedExerciseId(normalized.id);
    showNotice('Η νέα άσκηση αποθηκεύτηκε σε αναμονή έγκρισης, με τα καρέ και τα prompts της.');
  };

  // Sync reviews to localStorage
  const saveReviews = (nextReviews: ReviewMap): boolean => {
    try {
      localStorage.setItem(REVIEW_KEY, JSON.stringify(nextReviews));
      setReviews(nextReviews);
      return true;
    } catch (e: any) {
      showNotice('Αποτυχία αποθήκευσης αξιολόγησης: ' + e.message);
      return false;
    }
  };

  const handleReviewDecision = (id: string, status: ReviewStatus) => {
    try {
      const nextReviews = reviewConcept(id, status, reviews);
      if (!saveReviews(nextReviews)) return;
      setSelectedExerciseId(null);
      showNotice(
        status === 'approved'
          ? 'Εγκρίθηκε η άσκηση και οι περιγραφές των καρέ.'
          : 'Απορρίφθηκε η άσκηση και αφαιρέθηκε από τον κατάλογο αυτού του browser.'
      );
    } catch (e: any) {
      showNotice('Σφάλμα αξιολόγησης: ' + e.message);
    }
  };

  // Compute combined saved exercises
  const savedExercises = useMemo(() => {
    const items = new Map<string, Exercise>(baseExercises.map((x) => [x.id, x]));
    for (const x of userState.exercises) {
      items.set(x.id, { ...items.get(x.id), ...x });
    }
    return [...items.values()]
      .filter((x) => !x.requiresCoachReview || reviewStatus(x.id, reviews) !== 'rejected')
      .map((x) =>
        x.requiresCoachReview
          ? {
              ...x,
              reviewStatus: reviewStatus(x.id, reviews),
              requiresCoachReview: reviewStatus(x.id, reviews) !== 'approved',
            }
          : x
      );
  }, [baseExercises, userState.exercises, reviews]);

  // Compute combined saved programs
  const savedPrograms = useMemo(() => {
    const items = new Map<string, Program>(basePrograms.map((p) => [p.id, p]));
    for (const p of userState.programs) {
      items.set(p.id, { ...items.get(p.id), ...p });
    }
    return [...items.values()];
  }, [basePrograms, userState.programs]);

  // Full Active Catalog
  const currentCatalog = useMemo(() => {
    if (mode !== 'functional') {
      return savedExercises;
    }
    if (queueOnly) {
      const pendingCustom = savedExercises.filter((x) => x.custom && x.reviewStatus === 'pending');
      const pendingConcepts = visibleConcepts(conceptExercises, reviews, true).filter(
        (x) => x.reviewStatus === 'pending'
      );
      return [...pendingCustom, ...pendingConcepts];
    }
    const standardAndCustom = savedExercises.filter((x) => !x.custom || showConcepts);
    const visibleOriginalConcepts = visibleConcepts(conceptExercises, reviews, showConcepts);
    return [...standardAndCustom, ...visibleOriginalConcepts];
  }, [savedExercises, conceptExercises, mode, queueOnly, showConcepts, reviews]);

  // Dynamic Muscle Groups and Equipment for currently active mode
  const { availableMuscles, availableEquipment } = useMemo(() => {
    const list = currentCatalog.filter((x) => getDiscipline(x) === mode);
    const muscleSet = new Set<string>();
    const equipSet = new Set<string>();

    list.forEach((x) => {
      getMusclesList(x).forEach((m) => muscleSet.add(m));
      if (x.category) muscleSet.add(x.category);
      getEquipmentList(x).forEach((eq) => equipSet.add(eq));
    });

    return {
      availableMuscles: [...muscleSet].sort((a, b) => a.localeCompare(b, 'el')),
      availableEquipment: [...equipSet].sort((a, b) => a.localeCompare(b, 'el')),
    };
  }, [currentCatalog, mode]);

  // Filtered Exercises for the results view
  const filteredExercises = useMemo(() => {
    const q = norm(searchQuery.trim());
    return currentCatalog.filter((x) => {
      if (getDiscipline(x) !== mode) return false;
      if (selectedLevel && x.level !== selectedLevel) return false;
      if (selectedEquipment && !getEquipmentList(x).includes(selectedEquipment)) return false;
      if (
        selectedMuscle &&
        !getMusclesList(x).includes(selectedMuscle) &&
        x.category !== selectedMuscle
      )
        return false;

      if (tab === 'stretches') {
        const stretchText = norm([x.category, getExerciseName(x), x.goal, x.discipline].join(' '));
        if (!/stretch|mobility|διατα|κινητικο/.test(stretchText)) return false;
      }

      if (q) {
        const textContent = norm(
          [getExerciseName(x), x.category, x.instructions, ...getMusclesList(x), ...getEquipmentList(x)].join(' ')
        );
        if (!textContent.includes(q)) return false;
      }

      return true;
    });
  }, [currentCatalog, mode, selectedLevel, selectedEquipment, selectedMuscle, tab, searchQuery]);

  // Review counts for functional custom concepts
  const activeReviewCounts = useMemo(() => {
    const allCustom = [...conceptExercises, ...baseExercises.filter((x) => x.custom)];
    return reviewCounts(allCustom, reviews);
  }, [conceptExercises, baseExercises, reviews]);

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotice(
        'Η φωνητική αναγνώριση δεν υποστηρίζεται εδώ. Δοκίμασε Chrome σε ασφαλές περιβάλλον HTTPS ή πληκτρολόγησε.'
      );
      return;
    }

    if (!mode) {
      setMode('functional');
    }

    const recognizer = new SpeechRecognition();
    recognizer.lang = 'el-GR';
    recognizer.onresult = (event: any) => {
      const speech = event.results[0][0].transcript;
      const spoken = norm(speech);

      const match = spoken.match(/\b(\d+)\b/);
      const n = match ? Math.min(100, Number(match[1])) : 20;

      const levels: [string, string][] = [
        ['advanced', 'Advanced'],
        ['προχωρημεν', 'Advanced'],
        ['intermediate', 'Intermediate'],
        ['beginner', 'Beginner'],
        ['αρχαρι', 'Beginner'],
      ];
      const foundLevel = levels.find(([word]) => spoken.includes(word))?.[1] || '';
      setSelectedLevel(foundLevel);

      let group = '';
      for (const g of ['Πόδια & Γλουτοί', 'Πλάτη', 'Ώμοι', 'Κορμός', 'Στήθος']) {
        if (
          (g === 'Πόδια & Γλουτοί' && /ποδ|γλουτ/.test(spoken)) ||
          (g === 'Πλάτη' && /πλατ/.test(spoken)) ||
          (g === 'Ώμοι' && /ωμ/.test(spoken)) ||
          (g === 'Κορμός' && /κορμ|κοιλ/.test(spoken)) ||
          (g === 'Στήθος' && /στηθ/.test(spoken))
        ) {
          group = g;
          break;
        }
      }
      setSelectedMuscle(availableMuscles.includes(group) ? group : '');

      let foundEq = '';
      for (const eq of availableEquipment) {
        if (spoken.includes(norm(eq))) {
          foundEq = eq;
          break;
        }
      }
      setSelectedEquipment(foundEq);

      setSearchQuery('');
      setTab('exercises');
      setLimit(n);
      showNotice(`Φωνητική αναζήτηση: "${speech}" · αποτελέσματα από την τοπική βιβλιοθήκη.`);
    };

    recognizer.onerror = (e: any) => {
      showNotice('Σφάλμα μικροφώνου: ' + (e.error || 'άγνωστο'));
    };

    try {
      recognizer.start();
      showNotice('Ακρόαση... Μιλήστε τώρα στα ελληνικά (π.χ. "Squat για αρχάριους", "Πόδια με kettlebell").', true);
    } catch (e: any) {
      showNotice('Αδυναμία χρήσης μικροφώνου: ' + e.message);
    }
  };

  // JSON Validation
  const validateJson = (data: any): any => {
    if (!data || !Array.isArray(data.exercises) || !Array.isArray(data.programs)) {
      throw new Error('Το JSON πρέπει να περιέχει πίνακες exercises και programs.');
    }
    const exerciseIds = new Set<string>();
    const programIds = new Set<string>();

    for (const x of data.exercises) {
      if (
        !x ||
        typeof x.id !== 'string' ||
        !x.id.trim() ||
        !(typeof (x.name || x.title || x.gr) === 'string' && (x.name || x.title || x.gr).trim()) ||
        exerciseIds.has(x.id)
      ) {
        throw new Error('Άκυρο ή διπλό ID άσκησης: ' + x?.id);
      }
      exerciseIds.add(x.id);
    }

    for (const p of data.programs) {
      if (!p || typeof p.id !== 'string' || !p.id.trim() || programIds.has(p.id) || !Array.isArray(p.blocks)) {
        throw new Error('Άκυρο πρόγραμμα: ' + p?.id);
      }
      if (
        p.blocks.some(
          (b: any) =>
            !b ||
            typeof b.activity !== 'string' ||
            !b.activity.trim() ||
            !Number.isFinite(Number(b.minutes)) ||
            Number(b.minutes) <= 0
        )
      ) {
        throw new Error('Μη έγκυρο τμήμα προγράμματος ' + p.id);
      }
      const minutes = p.blocks.reduce((a: number, b: any) => a + Number(b.minutes || 0), 0);
      if (Math.abs(minutes - 60) > 0.001) {
        throw new Error('Το πρόγραμμα ' + p.id + ' δεν είναι 60 λεπτών.');
      }
      programIds.add(p.id);
    }

    return {
      ...data,
      exercises: data.exercises.map((e: any) => ensureVisualization(e)),
    };
  };

  // JSON Import
  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      const data = validateJson(raw);

      if (data.sofiaReviews) {
        const importedReviews = sanitizeReviews(data.sofiaReviews);
        if (!saveReviews({ ...reviews, ...importedReviews })) return;
      }

      const exerciseMap = new Map(userState.exercises.map((x) => [x.id, x]));
      const programMap = new Map(userState.programs.map((p) => [p.id, p]));

      for (const x of data.exercises) {
        exerciseMap.set(x.id, { ...exerciseMap.get(x.id), ...x });
      }
      for (const p of data.programs) {
        programMap.set(p.id, { ...programMap.get(p.id), ...p });
      }

      const nextState: AppState = {
        exercises: [...exerciseMap.values()],
        programs: [...programMap.values()],
      };

      if (!saveUserState(nextState)) return;
      showNotice(
        `Εισήχθησαν ${data.exercises.length} ασκήσεις και ${data.programs.length} προγράμματα, με συγχώνευση IDs.`
      );
    } catch (err: any) {
      showNotice('Η εισαγωγή ακυρώθηκε: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // JSON Export
  const handleExportJson = () => {
    const exportObject = {
      schemaVersion: 4,
      exercises: savedExercises,
      programs: savedPrograms,
      sofiaReviews: reviews,
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sofia_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    showNotice('Το αρχείο αντιγράφου ασφαλείας JSON δημιουργήθηκε και ξεκίνησε η λήψη.');
  };

  // Prompts TXT Export
  const handleExportPrompts = (exercise: Exercise) => {
    const sequence = ensureVisualization(exercise).visualization;
    if (!sequence) return;
    const lines = [
      sequence.promptTemplate,
      ...sequence.frames.map((frame) => `FRAME ${frame.frame} — ${frame.label}\n${frame.prompt}`),
    ].join('\n\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(exercise.id || 'exercise').replace(/^hybrid-/, 'custom-')}-visualization-frames.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    showNotice('Τα prompts των καρέ αποθηκεύτηκαν σε αρχείο κειμένου.');
  };

  // Selected exercise for detail view
  const currentSelectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null;
    const found = currentCatalog.find((x) => x.id === selectedExerciseId);
    if (!found) return null;
    const normalized = ensureVisualization(found);
    // Detail prompts, progress, thumbnails and player must share ONE sequence.
    // In pending Custom / Advanced exercises the original authored prompts
    // are preserved while return frames are strict image aliases.
    if ((normalized.id.startsWith('hybrid-') || ['sofia-original-001', 'sofia-original-002'].includes(normalized.id)) && normalized.visualization && reviewStatus(normalized.id, reviews) === 'pending') {
      return { ...normalized, visualization: mirrorExerciseSequence(normalized.visualization) };
    }
    return normalized;
  }, [selectedExerciseId, currentCatalog, reviews]);

  // Selected program for detail view
  const currentSelectedProgram = useMemo(() => {
    if (!selectedProgramId) return null;
    return savedPrograms.find((p) => p.id === selectedProgramId) || null;
  }, [selectedProgramId, savedPrograms]);

  const openMode = (nextMode: 'functional' | 'pilates') => {
    setSelectedExerciseId(null);
    setSelectedProgramId(null);
    setMode(nextMode);
    setTab('exercises');
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedMuscle('');
    setSelectedEquipment('');
    setLimit(20);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToHome = () => {
    setSelectedExerciseId(null);
    setSelectedProgramId(null);
    setMode(null);
    setTab('exercises');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const jumpToExerciseFromProgram = (exId: string) => {
    setTab('exercises');
    setSelectedExerciseId(exId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div id="app" className="max-w-[1250px] mx-auto p-4 md:p-6 w-full">
      {/* Top Header */}
      <header id="appHeader" className={selectedExerciseId ? 'hidden' : 'flex items-center justify-between gap-4 border-b border-[#323232] pb-4 mb-4'}>
        <div className="brand flex min-w-0 cursor-pointer items-center gap-3" onClick={handleBackToHome} title="Μπέμπα μου Personal AI Studio">
          <img
            src="/images/bemba-mou-app-icon-192.jpg"
            alt=""
            width="48"
            height="48"
            className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-amber-300/70"
          />
          <div className="min-w-0">
            <small className="tracking-widest text-[#a4a4a4] font-medium uppercase text-xs">MPEMPA MOU · AI STUDIO</small>
            <h1 className="truncate font-extrabold text-white">Μπέμπα μου</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode && (
            <button
              id="back"
              type="button"
              onClick={handleBackToHome}
              className="flex items-center gap-1.5"
            >
              ← Αρχική
            </button>
          )}

          <button
            id="voice"
            type="button"
            title="Φωνητική αναζήτηση"
            onClick={handleVoiceSearch}
            className="flex items-center gap-1.5 bg-[#313131] border-[#636363] text-white hover:border-[#b2b2b2]"
          >
            <span aria-hidden="true">🎙</span><span className="hidden sm:inline"> Αναζήτηση με φωνή</span>
          </button>
        </div>
      </header>

      {!selectedExerciseId && <AppExperience />}

      {/* Notice Message Area */}
      {notice && !selectedExerciseId && (
        <div
          id="notice"
          role="status"
          aria-live="polite"
          className="p-3 my-3 bg-[#212121] border border-[#484848] rounded-xl text-[#c4c4c4] text-sm font-medium transition-all"
        >
          {notice}
        </div>
      )}

      {/* Compact global reference lock notice */}
      {!selectedExerciseId && <details className="reference-lock-notice">
        <summary><span aria-hidden="true">🔒</span><span>ATHLETICO reference · 45°</span><span className="reference-lock-state">Ενεργό</span></summary>
        <div className="reference-lock-details">
          <strong>Κλειδωμένη οπτική αναφορά</strong>
          <p>Χρησιμοποίησε αποκλειστικά το εγκεκριμένο μοντέλο ATHLETICO για κάθε άσκηση, με τα ίδια χαρακτηριστικά, ρούχα, παπούτσια, studio, φωτισμό και κάμερα 45°. Στις συνδυαστικές ασκήσεις χρησιμοποιούνται και τα δύο εγκεκριμένα μοντέλα.</p>
        </div>
      </details>}

      <main className="mt-2">
        {/* WELCOME SECTION */}
        {!mode && (
          <section id="welcome" className="py-4">
            <HomeAICoachPanel onSaveExercise={handleGeneratedExerciseSave} />
            <h2 className="text-2xl font-bold text-white mb-1">Επίλεξε προπόνηση</h2>
            <p className="muted text-slate-400 mb-6">
              Δύο ξεχωριστές βιβλιοθήκες. Οι ασκήσεις εμφανίζονται μόνο μετά από αναζήτηση.
            </p>

            <div className="homegrid">
              <button
                type="button"
                className="big-mode-card"
                data-mode="functional"
                onClick={() => openMode('functional')}
              >
                <strong>Functional</strong>
                <span>Ασκήσεις · Έτοιμα προγράμματα · Διατάσεις</span>
              </button>

              <button
                type="button"
                className="big-mode-card"
                data-mode="pilates"
                onClick={() => openMode('pilates')}
              >
                <strong>Pilates</strong>
                <span>Δική του βιβλιοθήκη και προγράμματα</span>
              </button>
            </div>
          </section>
        )}

        {/* STUDIO SECTION */}
        {mode && (
          <section id="studio">
            {!selectedExerciseId && (
              <>
                <h2 id="studioTitle" className="text-2xl font-bold text-white mb-4">
                  {mode === 'functional' ? 'Functional Training' : 'Pilates'}
                </h2>

                {/* Section Navigation Tabs */}
                <nav className="tabs flex flex-wrap gap-2 mb-6" aria-label="Ενότητες">
                  <button
                    type="button"
                    data-tab="exercises"
                    className={tab === 'exercises' ? 'selected' : ''}
                    onClick={() => {
                      setTab('exercises');
                      setLimit(20);
                    }}
                  >
                    Ασκήσεις
                  </button>

                  <button
                    type="button"
                    data-tab="programs"
                    className={tab === 'programs' ? 'selected' : ''}
                    onClick={() => {
                      setTab('programs');
                      setLimit(20);
                    }}
                  >
                    Προγράμματα
                  </button>

                  <button
                    type="button"
                    data-tab="stretches"
                    className={tab === 'stretches' ? 'selected' : ''}
                    onClick={() => {
                      setTab('stretches');
                      setLimit(20);
                    }}
                  >
                    Διατάσεις
                  </button>

                  <button
                    type="button"
                    data-tab="data"
                    className={tab === 'data' ? 'selected' : ''}
                    onClick={() => setTab('data')}
                  >
                    Εισαγωγή / Εξαγωγή JSON
                  </button>
                </nav>

                {mode === 'functional' && tab === 'exercises' && (
                  <PendingVisualBatch
                    concepts={[...baseExercises.filter((ex) => ex.id.startsWith('hybrid-')), ...conceptExercises.filter((ex) => ['sofia-original-001', 'sofia-original-002'].includes(ex.id))]}
                    reviews={reviews}
                    onOpenExercise={jumpToExerciseFromProgram}
                  />
                )}

                {/* Functional Concept Review Toggles */}
                {mode === 'functional' && (
                  <div className="bg-[#1d1d1d] border border-[#3a3a3a] rounded-xl p-3 mb-5 space-y-2">
                    <label id="conceptsLabel" className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                      <input
                        id="concepts"
                        type="checkbox"
                        checked={showConcepts}
                        onChange={(e) => {
                          setShowConcepts(e.target.checked);
                          setLimit(20);
                          showNotice(
                            e.target.checked
                              ? 'Οι custom ασκήσεις εμφανίζονται ως προχωρημένες προτάσεις και απαιτούν αξιολόγηση προπονητή.'
                              : 'Εμφανίζονται μόνο αποθηκευμένες ασκήσεις.'
                          );
                        }}
                        className="w-4 h-4 rounded text-sky-500"
                      />
                      <span>Εμφάνιση 208 πρωτότυπων συνδυασμών (υπό αξιολόγηση)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                      <input
                        id="queueOnly"
                        type="checkbox"
                        checked={queueOnly}
                        onChange={(e) => {
                          setQueueOnly(e.target.checked);
                          setLimit(20);
                          setTab('exercises');
                        }}
                        className="w-4 h-4 rounded text-sky-500"
                      />
                      <span>Μόνο ασκήσεις που περιμένουν έγκριση</span>
                    </label>

                    {activeReviewCounts.pending > 0 && (
                      <p id="reviewCounts" className="muted text-xs text-[#bfbfbf] pt-1" role="status">
                        Custom ασκήσεις: {activeReviewCounts.pending} σε αναμονή · {activeReviewCounts.approved} εγκεκριμένες · {activeReviewCounts.rejected} απορρίφθηκαν
                      </p>
                    )}
                  </div>
                )}

                {/* Search & Filter Panel (for exercises & stretches) */}
                {(tab === 'exercises' || tab === 'stretches') && (
                  <section id="searchPanel" className="bg-[#1f1f1f] p-4 rounded-xl border border-[#414141] mb-6">
                    <div className="filters grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <label className="text-xs text-slate-300 font-medium">
                        Μυϊκή ομάδα
                        <select
                          id="muscle"
                          value={selectedMuscle}
                          onChange={(e) => {
                            setSelectedMuscle(e.target.value);
                            setLimit(20);
                          }}
                          className="w-full mt-1.5 p-2.5 rounded-lg bg-[#161616] border border-[#4a4a4a] text-white text-sm"
                        >
                          <option value="">Όλες</option>
                          {availableMuscles.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-slate-300 font-medium">
                        Εξοπλισμός
                        <select
                          id="equipment"
                          value={selectedEquipment}
                          onChange={(e) => {
                            setSelectedEquipment(e.target.value);
                            setLimit(20);
                          }}
                          className="w-full mt-1.5 p-2.5 rounded-lg bg-[#161616] border border-[#4a4a4a] text-white text-sm"
                        >
                          <option value="">Όλος ο εξοπλισμός</option>
                          {availableEquipment.map((eq) => (
                            <option key={eq} value={eq}>
                              {eq}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-slate-300 font-medium">
                        Επίπεδο
                        <select
                          id="level"
                          value={selectedLevel}
                          onChange={(e) => {
                            setSelectedLevel(e.target.value);
                            setLimit(20);
                          }}
                          className="w-full mt-1.5 p-2.5 rounded-lg bg-[#161616] border border-[#4a4a4a] text-white text-sm"
                        >
                          <option value="">Όλα</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </label>
                    </div>

                    <label className="text-xs text-slate-300 font-medium block">
                      Αναζήτηση άσκησης
                      <input
                        id="query"
                        type="search"
                        placeholder="Όνομα, μυϊκή ομάδα, kettlebell, squat..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setLimit(20);
                        }}
                        className="w-full mt-1.5 p-3 rounded-lg bg-[#161616] border border-[#4a4a4a] text-white text-sm"
                      />
                    </label>

                    <p id="count" className="muted text-xs text-slate-400 mt-2">
                      {filteredExercises.length} αποτελέσματα ·{' '}
                      {currentCatalog.filter((x) => getDiscipline(x) === mode).length} στη βιβλιοθήκη
                    </p>
                  </section>
                )}
              </>
            )}

            {/* RESULTS: EXERCISES LIST */}
            {(tab === 'exercises' || tab === 'stretches') && !selectedExerciseId && (
              <section id="results">
                <div id="cards" className="cards">
                  {filteredExercises.slice(0, limit).map((x) => {
                    const equipStr = getEquipmentList(x).join(' · ') || 'Βάρος σώματος';
                    const isPendingReview = x.custom && x.requiresCoachReview;
                    const cardProfile = modelProfileFor(x);
                    const cardAthleteRef = VISUAL_REFERENCES[cardProfile];
                    return (
                      <article key={x.id} className="card flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`badge ${isPendingReview ? 'warning-badge' : ''}`}>
                              {x.custom ? 'CUSTOM · ADVANCED' : x.requiresCoachReview ? 'ΥΠΟ ΑΞΙΟΛΟΓΗΣΗ' : x.level || '—'}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                              45° λοξά
                            </span>
                          </div>
                          <h3>{getExerciseName(x)}</h3>
                          <p>{x.custom ? (x.category || 'Full Body') + ' · ' : ''}{equipStr}</p>
                          {isPendingReview && (
                            <small className="warning text-xs text-amber-300 font-medium block my-1">
                              Υπό αξιολόγηση προπονητή
                            </small>
                          )}

                          {/* ΕΝΣΩΜΑΤΩΜΕΝΟ ΜΟΝΤΕΛΟ ΑΝΑΦΟΡΑΣ */}
                          <div className="athlete-reference">
                            <img
                              src={cardAthleteRef.url}
                              alt={cardAthleteRef.athleteTitleGreek}
                              className="athlete-reference-image"
                            />
                            <div className="athlete-reference-copy">
                              <span className="athlete-reference-title" title={cardAthleteRef.athleteTitleGreek}>
                                {cardProfile === 'female' ? 'Αθλήτρια ATHLETICO' : 'Αθλητής ATHLETICO'}
                              </span>
                              <span className="athlete-reference-caption">
                                Επίσημη αναφορά
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedExerciseId(x.id);
                            window.scrollTo({ top: 0, behavior: 'instant' });
                          }}
                          className="mt-3 w-full"
                        >
                          Προβολή άσκησης
                        </button>
                      </article>
                    );
                  })}
                </div>

                {filteredExercises.length > limit && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setLimit((prev) => prev + 20)}
                      className="px-6 py-3 font-medium bg-[#323232] border-[#666666]"
                    >
                      Περισσότερες ασκήσεις
                    </button>
                  </div>
                )}

                {filteredExercises.length === 0 && (
                  <div className="p-8 text-center bg-[#1f1f1f] rounded-xl border border-[#363636] text-slate-300">
                    Δεν βρέθηκαν ασκήσεις. Αλλάξτε κριτήρια ή εισαγάγετε αρχείο JSON.
                  </div>
                )}
              </section>
            )}

            {/* DETAILED EXERCISE VIEW */}
            {selectedExerciseId && currentSelectedExercise && (
              <article id="detail" className="card max-w-[980px] mx-auto p-6 bg-[#202020] border border-[#434343] rounded-2xl">
                {/* Visualization Sequence and Frame Player */}
                {currentSelectedExercise.visualization && (() => {
                  const rawProf = currentSelectedExercise.visualization.referenceProfile;
                  const detailProfile: 'female' | 'male' =
                    rawProf === 'male' || rawProf === 'female' ? rawProf : modelProfileFor(currentSelectedExercise);
                  const detailAthleteRef = VISUAL_REFERENCES[detailProfile];

                  return (
                    <section className="visualization-sequence mt-0">


                      {/* Interactive Frame Player with Visual Image Support */}
                      <FramePlayer
                        sequence={currentSelectedExercise.visualization}
                        exerciseId={currentSelectedExercise.id}
                      />
                      <button type="button" onClick={() => { setSelectedExerciseId(null); window.scrollTo({ top: 0, behavior: 'instant' }); }} className="bg-[#4f4f4f] hover:bg-[#656565] border-[#9a9a9a] text-white font-medium my-3">
                        ← Επιστροφή στις ασκήσεις
                      </button>
                    {/* Collapsible details for each frame */}
                    <div className="space-y-2 my-6">
                      <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                        Αναλυτικά καρέ & Prompts
                      </h4>
                      {currentSelectedExercise.visualization.frames.map((frame) => (
                        <details key={frame.frame}>
                          <summary>
                            Frame {frame.frame} — {frame.label}
                          </summary>
                          <p>
                            <strong>Στάση σώματος: </strong>
                            {frame.poseDescription}
                          </p>
                          <p>
                            <strong>Αλλαγή από το προηγούμενο καρέ: </strong>
                            {frame.changeFromPrevious || frame.transitionDescription}
                          </p>
                          {frame.sameImageAs && (
                            <p className="text-amber-300 font-medium">
                              Δεν παράγεται νέα εικόνα. Χρησιμοποιείται αυτούσια η εικόνα του Frame {frame.sameImageAs}.
                            </p>
                          )}
                          <details className="mt-2 bg-[#131313] border-[#2d2d2d]">
                            <summary className="text-xs text-sky-300">Πλήρες prompt για το AI</summary>
                            <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{frame.prompt}</p>
                          </details>
                        </details>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExportPrompts(currentSelectedExercise)}
                      className="bg-[#383838] border-[#6e6e6e] text-white hover:border-sky-300"
                    >
                      Λήψη prompts όλων των καρέ (.txt)
                    </button>                      {/* ΕΝΣΩΜΑΤΩΜΕΝΗ ΚΑΡΤΑ ΑΝΑΦΟΡΑΣ ΜΟΝΤΕΛΟΥ & ΑΣΦΑΛΙΣΤΙΚΗ ΔΙΚΛΕΙΔΑ */}
                      <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-[#171717] via-[#222222] to-[#171717] border-2 border-amber-500 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center gap-5">
                          <div className="relative shrink-0 w-36 h-48 rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-black">
                            <img
                              src={detailAthleteRef.url}
                              alt={detailAthleteRef.athleteTitleGreek}
                              className="w-full h-full object-cover object-top"
                            />
                            <div className="absolute top-1 left-1 right-1 bg-black/90 text-[10px] text-amber-300 font-extrabold px-1.5 py-0.5 rounded text-center tracking-wider uppercase">
                              Επίσημη Αναφορά
                            </div>
                            <div className="absolute bottom-1 left-1 right-1 bg-black/85 text-[10px] text-sky-200 font-bold px-1 py-0.5 rounded text-center">
                              📐 Λήψη 45°
                            </div>
                          </div>

                          <div className="flex-1 space-y-2 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-950 text-amber-200 border border-amber-600">
                                {detailAthleteRef.athleteName}
                              </span>
                              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-950 text-sky-200 border border-sky-700">
                                Studio ATHLETICO
                              </span>
                              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-950 text-emerald-200 border border-emerald-600">
                                45° Λοξή Οπτική Γωνία
                              </span>
                            </div>

                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                              <strong className="text-amber-300 font-extrabold uppercase">ΥΠΟΧΡΕΩΤΙΚΟ ΜΟΝΤΕΛΟ ΑΝΑΦΟΡΑΣ:</strong> Στην άσκηση αυτή έχει ανατεθεί ως σημείο αναφοράς αποκλειστικά το συγκεκριμένο μοντέλο ({detailProfile === 'male' ? 'Άνδρας Αθλητής' : 'Γυναίκα Αθλήτρια'}). Οποιοσδήποτε χειριστής επιχειρήσει ή εξουσιοδοτηθεί να προβεί σε αλλαγές ή παραγωγή εικόνων, υποχρεούται αυστηρά να χρησιμοποιήσει αποκλειστικά αυτό το μοντέλο, με τα ίδια ρούχα ({detailAthleteRef.outfitGreek}), στον ίδιο χώρο studio ATHLETICO και με σταθερή λήψη 45 μοιρών (στη μέση λοξά).
                            </p>

                            <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/40 text-[11px] text-amber-200 font-semibold flex items-center gap-2">
                              <span className="text-base select-none">🛡️</span>
                              <span>
                                <strong>Ασφαλιστική Δικλείδα:</strong> Εάν δεν τηρείται αυτό το μοντέλο και τα παραπάνω χαρακτηριστικά, η εφαρμογή μπλοκάρει υποχρεωτικά τη συνέχεια της οπτικοποίησης.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="muted text-xs text-slate-400 mb-1">
                        {currentSelectedExercise.visualization.fixedVisualContext}
                      </p>

                      <p className="warning text-xs text-amber-300 font-mono mb-2">
                        Κλειδωμένη αναφορά μοντέλου/φόντου: {currentSelectedExercise.visualization.referenceImage} · SHA-256{' '}
                        {currentSelectedExercise.visualization.referenceSha256}
                      </p>

                      <p className="muted text-xs text-slate-400 mb-2">
                        {currentSelectedExercise.visualization.promptTemplate}
                      </p>

                      <p className="muted text-xs text-slate-400 mb-4 italic">
                        Ο player αναπαράγει έως 30 βήματα, με έως 15 μοναδικές εικόνες. Η επιστροφή επαναχρησιμοποιεί τα καρέ ανάποδα και το τελευταίο βήμα δείχνει την ίδια αρχική θέση.
                      </p>

                      <MotionValidation frames={currentSelectedExercise.visualization.frames} exerciseId={currentSelectedExercise.id} />


                  </section>
                );
              })()}

                <h2 className="text-2xl font-bold text-white mb-1">
                  {getExerciseName(currentSelectedExercise)}
                </h2>

                <p className="text-slate-300 text-sm mb-4">
                  {currentSelectedExercise.custom ? 'Custom · ' : ''}
                  {currentSelectedExercise.level || ''} · {currentSelectedExercise.category || 'Functional'}
                </p>


              

                <div className="space-y-4 my-4">
                  <div>
                    <h3 className="text-base font-semibold text-sky-200 mb-1">Περιγραφή άσκησης</h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {currentSelectedExercise.instructions || currentSelectedExercise.description || 'Δεν υπάρχει ακόμη περιγραφή.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-sky-200 mb-1">Μυϊκές ομάδες</h3>
                    <p className="text-slate-300 text-sm">
                      {getMusclesList(currentSelectedExercise).join(', ') || 'Δεν έχουν καταχωριστεί.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-sky-200 mb-1">Αναπνοή</h3>
                    <p className="text-slate-300 text-sm">
                      {currentSelectedExercise.breathing || 'Δεν έχει καταχωριστεί.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-sky-200 mb-1">Προφυλάξεις</h3>
                    <p className="text-slate-300 text-sm">
                      {currentSelectedExercise.safety || 'Δεν έχουν καταχωριστεί.'}
                    </p>
                  </div>
                </div>

                {currentSelectedExercise.requiresCoachReview && (
                  <p className="p-3 bg-amber-950/60 border border-amber-600 rounded-lg text-amber-200 text-xs font-medium my-4">
                    ⚠️ Πρόταση υπό αξιολόγηση προπονητή.
                  </p>
                )}

                {/* Review Actions for Custom / New Concepts */}
                {(currentSelectedExercise.custom || currentSelectedExercise.newConcept) && (
                  <div className="exercise-review-actions my-4">
                    <p className="w-full text-slate-300 text-sm font-medium">
                      {reviewStatus(currentSelectedExercise.id, reviews) === 'approved'
                        ? 'Η άσκηση έχει εγκριθεί.'
                        : 'Αξιολόγηση άσκησης και περιγραφών καρέ.'}
                    </p>

                    {reviewStatus(currentSelectedExercise.id, reviews) !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleReviewDecision(currentSelectedExercise.id, 'approved')}
                        className="bg-emerald-800 border-emerald-600 hover:bg-emerald-700 text-white font-medium"
                      >
                        ✓ Έγκριση άσκησης
                      </button>
                    )}

                    {reviewStatus(currentSelectedExercise.id, reviews) !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Να απορριφθεί ολόκληρη η άσκηση και οι περιγραφές των καρέ;')) {
                            handleReviewDecision(currentSelectedExercise.id, 'rejected');
                          }
                        }}
                        className="bg-red-900 border-red-700 hover:bg-red-800 text-white font-medium"
                      >
                        × Απόρριψη άσκησης
                      </button>
                    )}
                  </div>
                )}

                <SofiaAICoach exercise={currentSelectedExercise} />

</article>
            )}

            {/* PROGRAMS PANEL */}
            {tab === 'programs' && (
              <section id="programPanel">
                {!selectedProgramId ? (
                  <div id="programCards" className="cards">
                    {savedPrograms
                      .filter((p) => (p.discipline || 'functional') === mode)
                      .map((p) => {
                        const totalMins =
                          p.durationMinutes || (p.blocks || []).reduce((a, b) => a + Number(b.minutes || 0), 0);
                        return (
                          <article key={p.id} className="card">
                            <h3>{p.name || p.title || p.id}</h3>
                            <p>{p.level || ''} · {totalMins} λεπτά</p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProgramId(p.id);
                                window.scrollTo({ top: 0, behavior: 'instant' });
                              }}
                              className="mt-auto"
                            >
                              Προβολή προγράμματος
                            </button>
                          </article>
                        );
                      })}

                    {savedPrograms.filter((p) => (p.discipline || 'functional') === mode).length === 0 && (
                      <p className="text-slate-400 p-6">Δεν υπάρχουν αποθηκευμένα προγράμματα σε αυτή την ενότητα.</p>
                    )}
                  </div>
                ) : (
                  currentSelectedProgram && (
                    <article id="programDetail" className="card max-w-[900px] mx-auto p-6 bg-[#202020]">
                      <button
                        type="button"
                        onClick={() => setSelectedProgramId(null)}
                        className="bg-[#4f4f4f] hover:bg-[#656565] text-white mb-6"
                      >
                        ← Επιστροφή στα προγράμματα
                      </button>

                      <h2 className="text-2xl font-bold text-white mb-1">
                        {currentSelectedProgram.name || currentSelectedProgram.title || currentSelectedProgram.id}
                      </h2>
                      <p className="muted text-sm mb-6">
                        {currentSelectedProgram.level || ''} · {currentSelectedProgram.durationMinutes || 60} λεπτά
                      </p>

                      <ol className="space-y-4 list-decimal list-inside text-slate-200">
                        {(currentSelectedProgram.blocks || []).map((b, idx) => {
                          const matchedId = b.activity.match(/\bfunctional-\d{3}\b/)?.[0];
                          const refExercise = matchedId ? savedExercises.find((x) => x.id === matchedId) : null;
                          return (
                            <li key={idx} className="p-3 bg-[#1b1b1b] rounded-lg border border-[#333333]">
                              <span className="font-semibold text-sky-300">{b.minutes}′</span> — {b.activity}
                              {refExercise && (
                                <div className="mt-2 pl-4">
                                  <button
                                    type="button"
                                    onClick={() => jumpToExerciseFromProgram(refExercise.id)}
                                    className="text-xs py-1.5 px-3 bg-[#323232] border-[#5d5d5d] text-sky-200 hover:text-white"
                                  >
                                    Προβολή άσκησης και περιγραφών καρέ ({refExercise.name})
                                  </button>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    </article>
                  )
                )}
              </section>
            )}

            {/* DATA PANEL (IMPORT / EXPORT) */}
            {tab === 'data' && (
              <section id="dataPanel" className="bg-[#202020] border border-[#414141] rounded-2xl p-6 max-w-[700px] mx-auto">
                <h3 className="text-xl font-bold text-white mb-3">Διαχείριση Δεδομένων & Αντιγράφων</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Εισαγωγή του αρχείου με τις 100 ασκήσεις και τα 10 προγράμματα. Συγχώνευση βάσει ID, χωρίς διαγραφή υπαρχόντων.
                </p>

                <div className="flex flex-wrap gap-4 items-center mb-6">
                  <button
                    id="export"
                    type="button"
                    onClick={handleExportJson}
                    className="bg-[#3e3e3e] hover:bg-[#4f4f4f] text-white font-medium"
                  >
                    Εξαγωγή αντιγράφου JSON
                  </button>

                  <label className="file-btn inline-flex items-center gap-2 cursor-pointer bg-[#252525] hover:border-[#b2b2b2]">
                    <span>Εισαγωγή JSON</span>
                    <input
                      ref={fileInputRef}
                      id="import"
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="muted text-xs text-slate-400">
                  Τα δεδομένα αποθηκεύονται τοπικά στον browser. Για άλλη συσκευή απαιτείται ξεχωριστή εισαγωγή.
                </p>
              </section>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

