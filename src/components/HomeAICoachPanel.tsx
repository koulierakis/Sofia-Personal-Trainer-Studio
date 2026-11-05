import React, { useMemo, useState } from 'react';
// @ts-ignore JavaScript motion engine is tested independently.
import { analyzeExercise, localCoachReply } from '../services/precision-motion-engine.mjs';
import { lockedVisualPrompt, VISUAL_REFERENCES } from '../services/visual-reference-lock';

type ChatMessage = { role: 'user' | 'assistant'; text: string };
type MotionMode = 'image' | 'video';
type Profile = 'female' | 'male';
type Discipline = 'functional' | 'pilates';
type ExerciseKind = 'strength' | 'stretching' | 'pilates';
type Intent = 'analyze' | 'create';

interface HomeAICoachPanelProps {
  onSaveExercise?: (exercise: any) => void;
}

const normalizeText = (value: unknown) =>
  String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('el-GR').replace(/\s+/g, ' ').trim();

const systemPrompt = (referenceLock: string, intent: Intent, exerciseKind: ExerciseKind) => [
  'Είσαι ο κινησιολογικός generator του Sofia Personal Training Studio.',
  'Δημιούργησε τεχνικά ολοκληρωμένη περιγραφή, καρέ και prompts για την άσκηση/ροή. Χρησιμοποίησε αποκλειστικά ΕΝΑ από τα δύο εγκεκριμένα ATHLETICO μοντέλα που επιλέχθηκε και το ίδιο μοντέλο σε κάθε καρέ.',
  'Επέστρεψε αυστηρά ένα JSON object χωρίς markdown ή κείμενο εκτός JSON. Μην εφευρίσκεις πηγές ή ισχυρίζεσαι ότι άνοιξες συνδέσμους. Χρησιμοποίησε μόνο σημειώσεις που δόθηκαν.',
  'Αν λείπει κρίσιμη πληροφορία για αρχική θέση, σειρά, πλευρά, στήριξη ή επιστροφή, βάλε status=NEEDS_CLARIFICATION και εξήγησε τι λείπει.',
  'Για νέα άσκηση σχεδίασε μία συνεκτική άσκηση με τον εξοπλισμό που ζητήθηκε, πλήρη περιγραφή, κύριες μυϊκές ομάδες, αναπνοή, προφυλάξεις και κατηγορία. Δήλωσέ την ως μη επαληθευμένη και υπό έγκριση προπονητή.',
  'Κατηγορία χρήστη: ' + exerciseKind + '. Μην αλλάξεις κατηγορία: strength=Functional/δύναμη, stretching=Stretching στην καρτέλα διατάσεων, pilates=Pilates Reformer. Στο Reformer δήλωσε carriage, footbar, straps, λαβές και σημεία επαφής μόνο όταν τεκμηριώνονται· μη μαντεύεις ρυθμίσεις ελατηρίων.',
  'Χώρισε τη ροή σε αρχική θέση και ένα ή περισσότερα μονοπάτια που ξεκινούν από το κέντρο. Για κάθε μονοπάτι παρήγαγε μόνο τα νέα καρέ κίνησης προς μία κατεύθυνση. Η επιστροφή στο κέντρο επαναχρησιμοποιεί ακριβώς τα ίδια καρέ σε αντίστροφη σειρά, χωρίς νέες εικόνες. Για άλλη πλευρά δημιούργησε νέα, ειδικά καρέ· ποτέ κατοπτρισμό ή αντιγραφή των εικόνων της πρώτης πλευράς. Επέστρεψε από κάθε πλευρά με τα δικά της καρέ ανάποδα. Πρώτο και τελευταίο καρέ δείχνουν την ίδια αρχική εικόνα.',
  'Έως 15 μοναδικές στάσεις/εικόνες συνολικά μαζί με την αρχική και έως 30 βήματα αναπαραγωγής. Επίλεξε τα λιγότερα καρέ που δείχνουν κάθε ουσιαστική αλλαγή. Κάθε καρέ περιγράφει μία στατική στιγμή, πλήρες σώμα, ανατομική αριστερά/δεξιά, κεφάλι, κορμό, λεκάνη, άκρα, στήριξη, επαφές εξοπλισμού και αλλαγή από προηγούμενο.',
  'Κλείδωσε το ίδιο επιλεγμένο μοντέλο, ρούχα, studio ATHLETICO, φως, εξοπλισμό και κάμερα 45°. Αλλάζει μόνο η στάση. Χωρίς κείμενο, collage ή πρόσθετα άκρα.',
  'Κλειδωμένη οπτική αναφορά: ' + referenceLock,
  'JSON: {"status":"READY|NEEDS_CLARIFICATION","exercise":{"name":"...","greekName":"...","discipline":"functional|pilates","level":"...","category":"...","muscles":["..."],"equipment":["..."],"instructions":"...","breathing":"...","safety":"..."},"initialFrame":{"label":"...","poseDescription":"...","transitionDescription":"...","support":"...","angles":"...","prompt":"..."},"paths":[{"direction":"...","frames":[{"label":"...","poseDescription":"...","transitionDescription":"...","support":"...","angles":"...","prompt":"..."}],"returnMode":"reverse"}],"sources":["μόνο δοσμένες πηγές"],"assumptions":["..."],"clarifications":["..."],"videoPrompt":"..."}. Τα paths περιέχουν μόνο την κίνηση προς τα έξω· η εφαρμογή δημιουργεί τα reverse aliases.',
  intent === 'create' ? 'Λειτουργία: σχεδίασε νέα άσκηση μέσα στην επιλεγμένη κατηγορία και πλήρη οπτικοποίησή της.' : 'Λειτουργία: ανάλυσε την περιγραφόμενη άσκηση χωρίς να αλλάξεις την ταυτότητά της.'
].join('\n');

export const HomeAICoachPanel: React.FC<HomeAICoachPanelProps> = ({ onSaveExercise }) => {
  const [exerciseName, setExerciseName] = useState('');
  const [description, setDescription] = useState('');
  const [equipment, setEquipment] = useState('Βάρος σώματος');
  const [sourceNotes, setSourceNotes] = useState('');
  const [exerciseKind, setExerciseKind] = useState<ExerciseKind>('strength');
  const discipline: Discipline = exerciseKind === 'pilates' ? 'pilates' : 'functional';
  const [intent, setIntent] = useState<Intent>('analyze');
  const [mode, setMode] = useState<MotionMode>('image');
  const [profile, setProfile] = useState<Profile>('female');
  const [plan, setPlan] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('sofia_ollama_url') || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem('sofia_ollama_model') || 'qwen2.5:3b');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Γράψε την άσκηση ή μια ιδέα. Θα τη μετατρέψω σε συγκεκριμένα καρέ και prompts. Για άσκηση από βίντεο ή Reel, επικόλλησε σύνδεσμο και τις σχετικές οδηγίες/σημειώσεις· δεν προσποιούμαι ότι διάβασα περιεχόμενο που δεν μου έδωσες.' }
  ]);
  const reference = VISUAL_REFERENCES[profile];
  const exercise = useMemo(() => ({
    id: 'home-motion-draft',
    name: exerciseName.trim() || 'Νέα άσκηση',
    title: exerciseName.trim() || 'Νέα άσκηση',
    instructions: description.trim(),
    description: description.trim(),
    equipment: equipment.split(',').map((item) => item.trim()).filter(Boolean),
    discipline,
    modelProfile: profile
  }), [exerciseName, description, equipment, discipline, profile]);
  const identityLock = useMemo(() => lockedVisualPrompt(exercise as any, '', profile), [exercise, profile]);

  const openSearch = (provider: 'web' | 'youtube' | 'instagram') => {
    const query = [exerciseName, description, equipment, discipline === 'pilates' ? 'Pilates Reformer' : 'exercise movement'].filter(Boolean).join(' ');
    const encoded = encodeURIComponent(query);
    const url = provider === 'youtube'
      ? 'https://www.youtube.com/results?search_query=' + encoded
      : provider === 'instagram'
        ? 'https://www.google.com/search?q=' + encodeURIComponent('site:instagram.com/reel ' + query)
        : 'https://www.google.com/search?q=' + encoded;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const parseModelJson = (content: string) => {
    const cleaned = content.trim().replace(/^\x60{3}(?:json)?\s*/i, '').replace(/\s*\x60{3}$/i, '');
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Το Ollama δεν επέστρεψε JSON.');
    return JSON.parse(match[0]);
  };

  const buildPlan = (data: any, nextMode: MotionMode) => {
    const status = String(data.status || '').toUpperCase();
    const rawInitial = data.initialFrame || (Array.isArray(data.frames) ? data.frames[0] : null);
    const rawPaths = Array.isArray(data.paths)
      ? data.paths
      : [{ direction: 'Κύρια κατεύθυνση', frames: (Array.isArray(data.frames) ? data.frames : []).slice(1), returnMode: 'reverse' }];
    const paths = rawPaths.filter((path: any) => Array.isArray(path?.frames) && path.frames.length > 0);
    if (status === 'NEEDS_CLARIFICATION' || !rawInitial || paths.length === 0) {
      return {
        status: 'NEEDS_CLARIFICATION',
        confidence: 'needs clarification',
        exercise: data.exercise?.name || exerciseName || 'Νέα άσκηση',
        issues: [...(data.clarifications || []), ...(data.assumptions || [])],
        frames: [], videoPrompt: data.videoPrompt || '', masterPrompt: '',
        validation: { anatomy: 'NOT_ASSESSED', visualContinuity: 'NOT_VERIFIED', imageEvidence: 'NOT_PROVIDED', coachApproval: 'REQUIRED' },
        exerciseDraft: data.exercise || null, sources: data.sources || []
      };
    }

    const timeline: any[] = [];
    let uniqueImageCount = 1;
    let generatedUnique = 0;
    const makeFrame = (source: any, frameNumber: number, phaseLabel: string) => {
      const label = String(source.label || phaseLabel + ' ' + frameNumber).trim();
      const poseDescription = String(source.poseDescription || '').trim();
      const transitionDescription = String(source.transitionDescription || source.changeFromPrevious || '').trim();
      const support = String(source.support || 'Να δηλωθεί ρητά το πραγματικό σημείο στήριξης.').trim();
      const angles = String(source.angles || 'Χωρίς αριθμητική γωνία αν δεν τεκμηριώνεται.').trim();
      return {
        frame: frameNumber, label, poseDescription, transitionDescription,
        changeFromPrevious: transitionDescription, support, angles,
        referenceProfile: profile, referenceImage: reference.url, referenceSha256: reference.sha256,
        sameImageAs: null,
        prompt: [
          String(source.prompt || '').trim(),
          'Άσκηση: ' + (data.exercise?.name || exerciseName) + ' · ' + label + '.',
          'Ακριβής στάση: ' + poseDescription,
          'Μετάβαση: ' + transitionDescription,
          'Στήριξη και σημεία επαφής: ' + support,
          'Γωνίες/εύρος: ' + angles,
          'Εξοπλισμός: ' + equipment + '. Διατήρησε ακριβώς τα σημεία επαφής και τη θέση του εξοπλισμού.',
          'Κλείδωμα αναφοράς: ' + identityLock,
          'Μόνο η στάση αλλάζει. Ένα επιλεγμένο μοντέλο ATHLETICO, πλήρες σώμα, ίδια κάμερα 45°, φόντο, ρούχα και φως. Χωρίς κείμενο, collage ή επιπλέον άκρα.'
        ].filter(Boolean).join('\n')
      };
    };
    const initial = makeFrame(rawInitial, 1, 'Αρχική θέση');
    timeline.push(initial);
    for (const path of paths) {
      if (generatedUnique >= 14 || timeline.length >= 29) break;
      const outbound = path.frames.slice(0, 14 - generatedUnique).map((source: any) => {
        const frame = makeFrame(source, timeline.length + 1, String(path.direction || 'Κίνηση προς την κατεύθυνση'));
        timeline.push(frame);
        generatedUnique += 1;
        uniqueImageCount += 1;
        return frame;
      });
      for (let i = outbound.length - 2; i >= 0; i -= 1) {
        const source = outbound[i];
        timeline.push({
          ...source, frame: timeline.length + 1, label: 'Επιστροφή · ' + source.label,
          transitionDescription: 'Επιστροφή με το ίδιο ακριβώς καρέ σε αντίστροφη σειρά.',
          changeFromPrevious: 'Επιστροφή με επαναχρησιμοποίηση του ίδιου ακριβώς καρέ ' + source.frame + '.',
          sameImageAs: source.frame,
          prompt: 'ΜΗΝ ΠΑΡΑΓΕΙΣ ΝΕΑ ΕΙΚΟΝΑ. Επαναχρησιμοποίησε αυτούσιο το αρχείο εικόνας του καρέ ' + source.frame + '. Ακολούθησε αντίστροφη σειρά, χωρίς κατοπτρισμό.'
        });
      }
      timeline.push({
        ...initial, frame: timeline.length + 1, label: 'Επιστροφή στο κέντρο',
        transitionDescription: 'Επιστροφή στο κέντρο με την ίδια εικόνα αρχικής θέσης.',
        changeFromPrevious: 'Επιστροφή στην ίδια αρχική στάση.',
        sameImageAs: 1,
        prompt: 'ΜΗΝ ΠΑΡΑΓΕΙΣ ΝΕΑ ΕΙΚΟΝΑ. Επαναχρησιμοποίησε αυτούσιο το αρχείο εικόνας του καρέ 1.'
      });
    }
    if (timeline.length < 3) {
      return { status: 'NEEDS_CLARIFICATION', confidence: 'needs clarification', exercise: data.exercise?.name || exerciseName, issues: ['Χρειάζεται τουλάχιστον ένα καρέ κίνησης μετά την αρχική θέση.'], frames: [], videoPrompt: '', masterPrompt: '', validation: { anatomy: 'NOT_ASSESSED', visualContinuity: 'NOT_VERIFIED', imageEvidence: 'NOT_PROVIDED', coachApproval: 'REQUIRED' }, exerciseDraft: null, sources: data.sources || [] };
    }
    timeline[timeline.length - 1] = {
      ...timeline[timeline.length - 1], label: 'Τελική επαναφορά — ίδια ακριβώς με την αρχική',
      sameImageAs: 1,
      prompt: 'ΜΗΝ ΠΑΡΑΓΕΙΣ ΝΕΑ ΕΙΚΟΝΑ. Επαναχρησιμοποίησε αυτούσιο το αρχείο εικόνας του καρέ 1.'
    };
    const frames = timeline.slice(0, 30);
    const draft = {
      name: data.exercise?.name || exerciseName.trim() || 'Νέα άσκηση',
      greekName: data.exercise?.greekName || data.exercise?.name || exerciseName.trim() || 'Νέα άσκηση',
      discipline: exerciseKind === 'pilates' ? 'pilates' : 'functional',
      trainingType: exerciseKind === 'pilates' ? 'reformer' : 'functional',
      level: data.exercise?.level || 'Advanced',
      category: exerciseKind === 'stretching' ? 'Stretching' : exerciseKind === 'pilates' ? 'Reformer' : data.exercise?.category || 'Full Body',
      muscles: Array.isArray(data.exercise?.muscles) ? data.exercise.muscles : [],
      equipment: Array.isArray(data.exercise?.equipment) ? data.exercise.equipment : exercise.equipment,
      instructions: data.exercise?.instructions || description,
      breathing: data.exercise?.breathing || 'Σταθερή αναπνοή· μην κρατάς την αναπνοή.',
      safety: data.exercise?.safety || 'Μη επαληθευμένη πρόταση. Απαιτείται έλεγχος προπονητή.',
      sources: Array.isArray(data.sources) ? data.sources : []
    };
    const videoPrompt = data.videoPrompt || [
      'Μία πλήρης ακολουθία: ' + draft.name + '.',
      ...frames.map((frame: any) => frame.label + ': ' + frame.poseDescription),
      'Η επιστροφή χρησιμοποιεί τα ίδια καρέ με αντίστροφη σειρά. Κάθε πλευρά έχει δικά της καρέ. Πρώτο και τελευταίο καρέ είναι ίδια εικόνα.'
    ].join('\n');
    return {
      status: 'READY', confidence: 'AI draft · coach review required',
      exercise: draft.name, family: exerciseKind, mode: nextMode,
      uniqueImageCount, playbackFrameCount: frames.length,
      issues: [...(data.assumptions || []), 'Οι πηγές δεν αναζητήθηκαν αυτόματα. Οι εικόνες/ανατομία χρειάζονται έλεγχο προπονητή.'],
      frames, videoPrompt,
      masterPrompt: frames.filter((frame: any) => !frame.sameImageAs).map((frame: any) => frame.prompt).join('\n\n'),
      validation: { anatomy: 'AI_DRAFT_NOT_VERIFIED', order: 'STRUCTURALLY_COMPLETE', visualContinuity: 'NOT_VERIFIED', imageEvidence: 'NOT_PROVIDED', coachApproval: 'REQUIRED' },
      exerciseDraft: draft, sources: draft.sources
    };
  };
  const generate = async (nextMode: MotionMode, nextIntent: Intent = intent) => {
    setMode(nextMode);
    setIntent(nextIntent);
    if (!exerciseName.trim() || !description.trim()) {
      setPlan({ status: 'NEEDS_CLARIFICATION', exercise: exerciseName || 'Νέα άσκηση', issues: ['Συμπλήρωσε όνομα/ιδέα και περιγραφή αρχικής θέσης, κύριας κίνησης και επιστροφής.'], frames: [], videoPrompt: '', masterPrompt: '' });
      return;
    }
    setBusy(true);
    localStorage.setItem('sofia_ollama_url', ollamaUrl);
    localStorage.setItem('sofia_ollama_model', ollamaModel);
    const userInput = JSON.stringify({
      task: nextIntent === 'create' ? 'Σχεδίασε μια νέα άσκηση και την πλήρη οπτικοποίησή της.' : 'Ανάλυσε την άσκηση και δημιούργησε πλήρη ακολουθία καρέ.',
      name: exerciseName.trim(),
      description: description.trim(),
      equipment: exercise.equipment,
      discipline,
      exerciseKind,
      requiredModelCount: 1,
      placement: exerciseKind === 'stretching' ? 'Stretching tab' : exerciseKind === 'pilates' ? 'Pilates Reformer exercises' : 'Functional exercises',
      referenceProfile: profile,
      sourceLinksAndNotes: sourceNotes.trim() || 'Δεν δόθηκαν ακόμη. Μην ισχυριστείς ότι έγινε διαδικτυακή αναζήτηση.'
    });
    try {
      const response = await fetch(ollamaUrl.replace(/\/$/, '') + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          stream: false,
          format: 'json',
          options: { temperature: 0.2 },
          messages: [
            { role: 'system', content: systemPrompt(identityLock, nextIntent, exerciseKind) },
            { role: 'user', content: userInput }
          ]
        })
      });
      if (!response.ok) throw new Error('Ollama HTTP ' + response.status);
      const result = await response.json();
      const content = result.message?.content || '';
      setPlan(buildPlan(parseModelJson(content), nextMode));
    } catch (error: any) {
      if (nextIntent === 'analyze') {
        const fallback = analyzeExercise(exercise, { identityLock, mode: nextMode });
        setPlan({
          ...fallback,
          frames: (fallback.frames || []).map((frame: any, index: number) => ({
            ...frame,
            frame: frame.frame || index + 1,
            poseDescription: frame.poseDescription || frame.pose || '',
            transitionDescription: frame.transitionDescription || frame.change || '',
            support: frame.support || 'Δεν προσδιορίστηκε από την εφεδρική ανάλυση.',
            angles: frame.angles || 'Δεν προσδιορίστηκαν από την εφεδρική ανάλυση.',
          })),
          issues: [...(fallback.issues || []), 'Το τοπικό AI δεν συνδέθηκε. Η ντετερμινιστική εφεδρεία καλύπτει μόνο γνωστά βασικά μοτίβα.'],
          validation: { ...fallback.validation, imageEvidence: 'NOT_PROVIDED', coachApproval: 'REQUIRED' }
        });
      } else {
        setPlan({ status: 'NEEDS_CLARIFICATION', exercise: exerciseName, issues: ['Δεν συνδέθηκε τοπικό Ollama (' + error.message + '). Για σχεδίαση νέας σύνθετης άσκησης απαιτείται ενεργό γλωσσικό μοντέλο.'], frames: [], videoPrompt: '', masterPrompt: '' });
      }
      setMessages((current) => [...current, { role: 'assistant', text: 'Δεν συνδέθηκε το AI generator. Έλεγξε το Ollama URL, το μοντέλο και ότι επιτρέπεται η σύνδεση από το Studio.' }]);
    } finally {
      setBusy(false);
    }
  };

  const buildExerciseRecord = () => {
    if (!plan?.exerciseDraft || !plan?.frames?.length) return null;
    const vizFrames = plan.frames.map((frame: any) => ({
      frame: frame.frame,
      label: frame.label,
      poseDescription: frame.poseDescription,
      transitionDescription: frame.transitionDescription,
      changeFromPrevious: frame.changeFromPrevious,
      referenceProfile: profile,
      referenceImage: reference.url,
      referenceSha256: reference.sha256,
      sameImageAs: frame.sameImageAs || null,
      prompt: frame.prompt,
      imageUrl: undefined
    }));
    return {
      id: 'ai-custom-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36)),
      name: plan.exerciseDraft.name,
      title: plan.exerciseDraft.name,
      greekName: plan.exerciseDraft.greekName,
      discipline: plan.exerciseDraft.discipline,
      trainingType: plan.exerciseDraft.discipline === 'pilates' ? 'reformer' : 'functional',
      level: plan.exerciseDraft.level,
      category: plan.exerciseDraft.category,
      muscles: plan.exerciseDraft.muscles,
      equipment: plan.exerciseDraft.equipment,
      instructions: plan.exerciseDraft.instructions,
      description: 'AI draft από την ιδέα/περιγραφή του χρήστη. Απαιτείται έλεγχος προπονητή.',
      breathing: plan.exerciseDraft.breathing,
      safety: plan.exerciseDraft.safety,
      phases: vizFrames.map((frame: any, index: number) => ({ label: frame.label, cue: frame.poseDescription, sequenceIndex: index + 1, sameImageAs: frame.sameImageAs || null })),
      custom: true,
      newConcept: true,
      source: 'ai-generated-unverified',
      requiresCoachReview: true,
      reviewStatus: 'pending',
      modelProfile: profile,
      visualization: {
        version: 2,
        referenceProfile: profile,
        referenceImage: reference.url,
        referenceSha256: reference.sha256,
        promptTemplate: identityLock,
        fixedVisualContext: 'Ίδιο εγκεκριμένο ATHLETICO reference, περιβάλλον, ρουχισμός και κάμερα. Αλλάζει μόνο η κίνηση.',
        frameCount: vizFrames.length,
        closingFrameReuses: 1,
        coachReviewRequired: true,
        frames: vizFrames
      }
    };
  };

  const saveAsPendingExercise = () => {
    const record = buildExerciseRecord();
    if (!record) return;
    onSaveExercise?.(record);
  };

  const exportPlan = () => {
    if (!plan) return;
    const record = buildExerciseRecord();
    const payload = record
      ? { schemaVersion: 4, exercises: [record], programs: [], sofiaReviews: {} }
      : plan;
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = (exerciseName.trim() || 'exercise').toLowerCase().replace(/[^a-z0-9-]+/g, '-') + (record ? '-sofia-exercise.json' : '-motion-prompts.json');
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || busy) return;
    setChatInput('');
    setMessages((current) => [...current, { role: 'user', text: question }]);
    setBusy(true);
    localStorage.setItem('sofia_ollama_url', ollamaUrl);
    localStorage.setItem('sofia_ollama_model', ollamaModel);
    try {
      const response = await fetch(ollamaUrl.replace(/\/$/, '') + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          stream: false,
          messages: [
            { role: 'system', content: 'Είσαι η Μπέμπα μου AI Coach. Απαντάς στα ελληνικά. Για κινησιολογικά prompts περιγράφεις ολοκληρωμένη ακολουθία καρέ, ακριβή σημεία στήριξης, πλευρές, εξοπλισμό και επιστροφή στην ίδια αρχική θέση. Δεν ισχυρίζεσαι ότι αναζήτησες URL αν δεν σου δόθηκαν τα περιεχόμενά του. Δεν πιστοποιείς ασφάλεια. Άσκηση: ' + exercise.name + '. Περιγραφή: ' + (description || 'δεν δόθηκε ακόμη') + '. Πηγές/σημειώσεις: ' + (sourceNotes || 'δεν δόθηκαν') },
            ...messages.slice(-8).map((message) => ({ role: message.role, content: message.text })),
            { role: 'user', content: question }
          ]
        })
      });
      if (!response.ok) throw new Error('Ollama HTTP ' + response.status);
      const data = await response.json();
      setMessages((current) => [...current, { role: 'assistant', text: data.message?.content || 'Το τοπικό μοντέλο επέστρεψε κενή απάντηση.' }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: localCoachReply(question, exercise) + ' (Τοπικοί κανόνες: δεν συνδέθηκε Ollama.)' }]);
    } finally {
      setBusy(false);
    }
  };

  const dictate = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setMessages((current) => [...current, { role: 'assistant', text: 'Η αναγνώριση φωνής δεν υποστηρίζεται σε αυτόν τον browser.' }]);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'el-GR';
    recognition.onresult = (event: any) => setChatInput((value) => value + event.results[0][0].transcript);
    recognition.onerror = () => setMessages((current) => [...current, { role: 'assistant', text: 'Δεν αναγνωρίστηκε η φωνή. Έλεγξε την άδεια μικροφώνου.' }]);
    recognition.start();
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'el-GR';
    window.speechSynthesis.speak(utterance);
  };

  return <section id="home-ai-studio" className="home-ai-panel" aria-labelledby="home-ai-title">
    <div className="home-ai-heading">
      <div>
        <p className="home-ai-eyebrow">SOFIA PERSONAL TRAINER · MOTION DESIGNER</p>
        <h2 id="home-ai-title">Sofia AI Coach · Άσκηση, καρέ &amp; prompts</h2>
        <p>Περιέγραψε κίνηση ή δώσε ιδέα. Το τοπικό AI οργανώνει τις απαιτούμενες στάσεις, ένα prompt ανά καρέ και επιστροφή στην αρχική θέση.</p>
      </div>
      <span className="home-ai-lock">🔒 Reference ATHLETICO · 45°</span>
    </div>

    <div className="home-ai-form">
      <div className="home-ai-actions" role="group" aria-label="Τύπος εργασίας">
        <button type="button" aria-pressed={intent === 'analyze'} onClick={() => setIntent('analyze')}>Ανάλυση άσκησης</button>
        <button type="button" aria-pressed={intent === 'create'} onClick={() => setIntent('create')}>Νέα άσκηση από ιδέα</button>
      </div>
      <label>Όνομα άσκησης ή ιδέας
        <input value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} placeholder="π.χ. Reformer Mermaid ή σύνθετο kick-through" />
      </label>
      <label>Περιγραφή ή ζητούμενο κίνησης
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Αρχική θέση, σειρά κινήσεων, πλευρά, σημεία στήριξης και πώς τελειώνει μία επανάληψη. Για νέα άσκηση γράψε τι θέλεις να συνδυάσει." />
      </label>
      <div className="home-ai-actions">
        <label>Εξοπλισμός
          <input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="Βάρος σώματος, μονόζυγο, TRX, Reformer..." />
        </label>
        <label>Κατηγορία άσκησης
          <select value={exerciseKind} onChange={(event) => setExerciseKind(event.target.value as ExerciseKind)}>
            <option value="strength">Functional · Δύναμη / σύνθετη άσκηση</option>
            <option value="stretching">Stretching · Διάταση</option>
            <option value="pilates">Pilates Reformer</option>
          </select>
        </label>
        <label>Εγκεκριμένο μοντέλο
          <select value={profile} onChange={(event) => setProfile(event.target.value as Profile)}>
            <option value="female">Γυναίκα ATHLETICO</option>
            <option value="male">Άνδρας ATHLETICO</option>
          </select>
        </label>
      </div>
      <label>Σύνδεσμοι και σημειώσεις από βίντεο / Reels
        <textarea value={sourceNotes} onChange={(event) => setSourceNotes(event.target.value)} rows={3} placeholder="Επικόλλησε δημόσιο σύνδεσμο ΚΑΙ τις οδηγίες/λεζάντα ή σημειώσεις της κίνησης. Το Studio δεν μπορεί να διαβάσει μόνο του ιδιωτικά Reels." />
      </label>
      <div className="home-ai-actions">
        <button type="button" onClick={() => openSearch('web')}>Αναζήτηση Web</button>
        <button type="button" onClick={() => openSearch('youtube')}>Αναζήτηση YouTube</button>
        <button type="button" onClick={() => openSearch('instagram')}>Αναζήτηση Instagram Reels</button>
      </div>
      <div className="home-ai-actions">
        <button type="button" disabled={busy} onClick={() => generate('image', intent)}>{busy ? 'Δημιουργία…' : 'IMAGE MODE · Καρέ και prompts'}</button>
        <button type="button" disabled={busy} onClick={() => generate('video', intent)}>VIDEO MODE · Prompt κίνησης</button>
        <button type="button" disabled={busy} onClick={() => generate('image', 'create')}>Σχεδίασε νέα άσκηση + καρέ</button>
      </div>
      <p className="home-ai-note">Το Studio οργανώνει έως 15 μοναδικές εικόνες σε έως 30 βήματα αναπαραγωγής. Οι επιστροφές επαναχρησιμοποιούν τα ίδια καρέ ανάποδα και κάθε πλευρά έχει δικά της καρέ. Η αναζήτηση ανοίγει Web/YouTube/Instagram σε νέα καρτέλα· επικόλλησε εδώ τα ευρήματα. Το Studio δεν παράγει από μόνο του τελικά αρχεία εικόνας/βίντεο και δεν διαβάζει περιεχόμενο Reel από έναν σύνδεσμο.</p>
    </div>

    <details className="home-ai-settings">
      <summary>Σύνδεση τοπικού AI (Ollama)</summary>
      <div className="home-ai-settings-grid">
        <label>Ollama URL<input value={ollamaUrl} onChange={(event) => setOllamaUrl(event.target.value)} /></label>
        <label>Μοντέλο<input value={ollamaModel} onChange={(event) => setOllamaModel(event.target.value)} /></label>
      </div>
      <p>Απαιτείται εγκατεστημένο και ενεργό Ollama στη συσκευή. Χωρίς σύνδεση λειτουργούν μόνο οι περιορισμένοι τοπικοί κανόνες για βασικές ασκήσεις.</p>
    </details>

    <div className="home-ai-chat" aria-live="polite">
      {messages.map((message, index) => <div key={index} className={message.role === 'user' ? 'home-ai-message user' : 'home-ai-message'}>
        <span>{message.text}</span>
        {message.role === 'assistant' && <button type="button" aria-label="Εκφώνηση απάντησης" onClick={() => speak(message.text)}>🔊</button>}
      </div>)}
    </div>
    <form className="home-ai-chat-form" onSubmit={sendMessage}>
      <input aria-label="Μήνυμα προς Sofia AI Coach" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ρώτησε για την κίνηση ή τα καρέ…" />
      <button type="button" onClick={dictate} aria-label="Υπαγόρευση">🎙️</button>
      <button type="submit" disabled={busy}>{busy ? '…' : 'Αποστολή'}</button>
    </form>

    {plan && <div className="home-ai-results">
      <div className="home-ai-result-title">
        <h3>{plan.exercise} · {plan.status} · {plan.playbackFrameCount || plan.frames?.length || 0} βήματα / {plan.uniqueImageCount || 0} μοναδικές εικόνες</h3>
        <button type="button" onClick={exportPlan}>Εξαγωγή άσκησης/pose JSON</button>
      </div>
      {plan.issues?.map((issue: string, index: number) => <p className="home-ai-warning" key={index}>⚠️ {issue}</p>)}
      {plan.sources?.length > 0 && <p className="home-ai-note">Πηγές που παρείχες: {plan.sources.join(' · ')}</p>}
      {plan.validation?.imageEvidence !== 'PROVIDED' && <p className="home-ai-note">Οι εικόνες δεν έχουν παραχθεί ή ελεγχθεί. Κάθε νέα άσκηση περιμένει έγκριση προπονητή.</p>}
      {mode === 'video'
        ? <pre>{plan.videoPrompt || 'Δεν δημιουργήθηκε prompt: χρειάζεται ακριβέστερη περιγραφή κίνησης.'}</pre>
        : plan.frames?.map((frame: any) => <details key={frame.frame}>
            <summary>Καρέ {frame.frame} · {frame.label}</summary>
            <p><strong>Στάση: </strong>{frame.poseDescription}</p>
            <p><strong>Μετάβαση: </strong>{frame.transitionDescription}</p>
            <p><strong>Στήριξη: </strong>{frame.support} · <strong>Γωνίες: </strong>{frame.angles}</p>
            <pre>{frame.prompt}</pre>
            <pre>{JSON.stringify(frame.poseSpec, null, 2)}</pre>
          </details>)}
      {plan.masterPrompt && <details><summary>Συνολικό prompt / master brief</summary><pre>{plan.masterPrompt}</pre></details>}
      {intent === 'create' && plan.exerciseDraft && plan.frames?.length > 0 && <button type="button" onClick={saveAsPendingExercise}>Αποθήκευση ως νέα άσκηση · αναμονή έγκρισης</button>}
    </div>}
  </section>;
};
