import React, { useMemo, useState } from 'react';
import { Exercise } from '../types';
import { VISUAL_REFERENCES, modelProfileFor, lockedVisualPrompt } from '../services/visual-reference-lock';
import { FramePlayer } from './FramePlayer';
import { MotionValidation } from './MotionValidation';
// @ts-ignore JavaScript motion engine is tested independently.
import { analyzeExercise, localCoachReply } from '../services/precision-motion-engine.mjs';

type Message = { role: 'user' | 'assistant'; text: string };

export const SofiaAICoach: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [plan, setPlan] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: 'Είμαι η Μπέμπα μου AI Coach. Μπορώ να αναλύσω την επιλεγμένη άσκηση και να φτιάξω prompts καρέ. Η συνομιλία χρησιμοποιεί προαιρετικά τοπικό Ollama, χωρίς εξωτερικό API.' }]);
  const [busy, setBusy] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('sofia_ollama_url') || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem('sofia_ollama_model') || 'qwen2.5:3b');
  const profile = modelProfileFor(exercise);
  const reference = VISUAL_REFERENCES[profile];
  const identityLock = useMemo(() => lockedVisualPrompt(exercise, '', profile), [exercise, profile]);
  const playerSequence = plan?.frames?.length ? {
    version: 1,
    referenceProfile: profile,
    referenceImage: reference.url,
    referenceSha256: reference.sha256,
    promptTemplate: 'Μπέμπα μου AI Coach precision motion prompt',
    fixedVisualContext: identityLock,
    frameCount: plan.frames.length,
    closingFrameReuses: plan.frames.some((frame: any) => frame.sameImageAs === 1) ? 1 : 0,
    coachReviewRequired: true,
    frames: plan.frames.map((frame: any) => ({
      frame: frame.frame, label: frame.label, poseDescription: frame.pose, changeFromPrevious: frame.change,
      transitionDescription: frame.phase, referenceProfile: profile, referenceImage: reference.url,
      referenceSha256: reference.sha256, sameImageAs: frame.sameImageAs || null, prompt: frame.prompt
    }))
  } : null;

  const analyze = (nextMode = mode) => {
    setMode(nextMode);
    setPlan(analyzeExercise(exercise, { identityLock, mode: nextMode }));
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', text: question }]);
    setBusy(true);
    localStorage.setItem('sofia_ollama_url', ollamaUrl);
    localStorage.setItem('sofia_ollama_model', ollamaModel);
    try {
      const response = await fetch(ollamaUrl.replace(/\/$/, '') + '/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollamaModel, stream: false, messages: [
          { role: 'system', content: 'Είσαι η Μπέμπα μου AI Coach, μιλάς πάντα ελληνικά. Βοηθάς με προπονητική και κινησιολογική περιγραφή, δεν διαγιγνώσκεις και δεν πιστοποιείς ασφάλεια. Επιλεγμένη άσκηση: ' + (exercise.greekName || exercise.gr || exercise.name || exercise.title) + '. Περιγραφή: ' + (exercise.instructions || exercise.description || 'δεν υπάρχει') + '. Μην επινοείς κινήσεις που δεν προκύπτουν.' },
          ...messages.slice(-8).map((message) => ({ role: message.role, content: message.text })),
          { role: 'user', content: question }
        ] })
      });
      if (!response.ok) throw new Error('Το Ollama δεν απάντησε (' + response.status + ').');
      const data = await response.json();
      setMessages((current) => [...current, { role: 'assistant', text: data.message?.content || 'Το τοπικό μοντέλο επέστρεψε κενή απάντηση.' }]);
    } catch {
      const answer = localCoachReply(question, exercise);
      setMessages((current) => [...current, { role: 'assistant', text: answer + ' (Τοπική λειτουργία κανόνων: δεν συνδέθηκε LLM.)' }]);
    } finally { setBusy(false); }
  };

  const dictate = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) { setMessages((current) => [...current, { role: 'assistant', text: 'Η αναγνώριση φωνής δεν υποστηρίζεται σε αυτόν τον browser.' }]); return; }
    const recognition = new Recognition();
    recognition.lang = 'el-GR';
    recognition.onresult = (event: any) => setInput((value) => value + event.results[0][0].transcript);
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
  const download = () => {
    if (!plan) return;
    const content = JSON.stringify(plan, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = exercise.id + '-motion-prompts.json'; anchor.click(); URL.revokeObjectURL(url);
  };

  return <section className="my-6 p-4 rounded-2xl border border-violet-700 bg-[#101c30] space-y-4" aria-label="Μπέμπα μου AI Coach">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h3 className="text-xl font-bold text-violet-200">ΜΠΕΜΠΑ ΜΟΥ AI COACH · MOTION ENGINE</h3><p className="text-xs text-slate-300">Επιλεγμένο εγκεκριμένο reference: {reference.athleteTitleGreek} · {reference.file}</p></div>
      <div className="flex gap-2"><button type="button" onClick={() => analyze('image')} className="px-3 py-2 rounded bg-violet-800">IMAGE MODE</button><button type="button" onClick={() => analyze('video')} className="px-3 py-2 rounded bg-cyan-800">VIDEO MODE</button></div>
    </div>
    <div className="grid gap-2 md:grid-cols-2">
      <label className="text-xs text-slate-300">Τοπικό Ollama URL<input className="block w-full mt-1 p-2 rounded bg-slate-800 text-white" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} /></label>
      <label className="text-xs text-slate-300">Τοπικό μοντέλο<input className="block w-full mt-1 p-2 rounded bg-slate-800 text-white" value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} /></label>
    </div>
    <p className="text-xs text-amber-200">Για πραγματικές ελεύθερες απαντήσεις απαιτείται εγκατεστημένο Ollama και μοντέλο στη συσκευή. Δεν αποστέλλονται δεδομένα σε υπηρεσία τρίτου. Χωρίς σύνδεση, το chat περιορίζεται σε τοπικούς κανόνες.</p>
    <div className="max-h-56 overflow-auto space-y-2 rounded bg-slate-950/60 p-3" aria-live="polite">
      {messages.map((message, index) => <div key={index} className={message.role === 'user' ? 'text-right text-sky-200' : 'text-left text-slate-200'}><span className="inline-block max-w-[95%] rounded-lg bg-slate-800 px-3 py-2 text-sm whitespace-pre-wrap">{message.text}</span>{message.role === 'assistant' && <button type="button" onClick={() => speak(message.text)} className="ml-2 text-xs text-violet-300">🔊</button>}</div>)}
    </div>
    <form onSubmit={send} className="flex gap-2"><input aria-label="Μήνυμα προς Μπέμπα μου AI Coach" className="min-w-0 flex-1 rounded bg-slate-800 p-2 text-white" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ρώτησε για την άσκηση…" /><button type="button" onClick={dictate} className="rounded bg-slate-700 px-3">🎙️</button><button disabled={busy} className="rounded bg-violet-700 px-4">{busy ? '…' : 'Αποστολή'}</button></form>
    {plan && <div className="space-y-3 border-t border-slate-700 pt-4">
      <div className="flex items-center justify-between"><h4 className="font-bold text-white">{plan.exercise} · {plan.status}</h4><button type="button" onClick={download} className="rounded bg-slate-700 px-3 py-1 text-sm">Εξαγωγή JSON</button></div>
      {plan.issues.map((issue: string, index: number) => <p key={index} className="text-sm text-amber-200">⚠️ {issue}</p>)}
      <p className="text-xs text-slate-300">Έλεγχοι: {JSON.stringify(plan.validation)}. Η παραγωγή prompt δεν ισοδυναμεί με επαλήθευση εικόνας ή έγκριση προπονητή.</p>
      {mode === 'video' ? <pre className="whitespace-pre-wrap rounded bg-slate-950 p-3 text-xs text-slate-200">{plan.videoPrompt}</pre> : plan.frames.map((frame: any) => <details key={frame.frame} className="rounded bg-slate-950 p-3"><summary className="cursor-pointer text-sky-200">Frame {frame.frame} · {frame.label}{frame.sameImageAs ? ' · επαναχρησιμοποιεί Frame 1' : ''}</summary><p className="my-2 text-xs text-slate-300">{frame.pose}</p><p className="text-xs text-slate-400">Στήριξη: {frame.support} · {frame.angles}</p><pre className="mt-2 whitespace-pre-wrap text-xs text-white">{frame.prompt}</pre><pre className="mt-2 whitespace-pre-wrap text-xs text-emerald-200">{JSON.stringify(frame.poseSpec, null, 2)}</pre></details>)}
      {mode === 'image' && playerSequence && <><FramePlayer sequence={playerSequence} exerciseId={exercise.id} /><MotionValidation frames={plan.frames.map((frame: any) => ({ frame: frame.frame, label: frame.label, poseDescription: frame.pose, changeFromPrevious: frame.change, sameImageAs: frame.sameImageAs || null }))} exerciseId={exercise.id + '-motion-engine'} /></>}
    </div>}
  </section>;
};
