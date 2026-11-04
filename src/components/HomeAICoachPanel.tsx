import React, { useMemo, useState } from 'react';
import { analyzeExercise, localCoachReply } from '../services/precision-motion-engine.mjs';
import { lockedVisualPrompt, VISUAL_REFERENCES } from '../services/visual-reference-lock';

type ChatMessage = { role: 'user' | 'assistant'; text: string };
type MotionMode = 'image' | 'video';
type Profile = 'female' | 'male';

export const HomeAICoachPanel: React.FC = () => {
  const [exerciseName, setExerciseName] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<MotionMode>('image');
  const [profile, setProfile] = useState<Profile>('female');
  const [plan, setPlan] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('sofia_ollama_url') || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem('sofia_ollama_model') || 'qwen2.5:3b');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Περιέγραψε μια άσκηση ή ρώτησέ με για κίνηση, σημεία στήριξης και prompts. Δεν πιστοποιώ ασφάλεια ούτε επινοώ άγνωστες κινήσεις.' }
  ]);
  const exercise = useMemo(() => ({
    id: 'home-motion-draft',
    name: exerciseName.trim() || 'Νέα άσκηση',
    title: exerciseName.trim() || 'Νέα άσκηση',
    instructions: description.trim(),
    description: description.trim(),
    equipment: [],
    modelProfile: profile
  }), [exerciseName, description, profile]);
  const identityLock = useMemo(() => lockedVisualPrompt(exercise as any, '', profile), [exercise, profile]);
  const reference = VISUAL_REFERENCES[profile];

  const generate = (nextMode: MotionMode) => {
    setMode(nextMode);
    if (!exerciseName.trim() || !description.trim()) {
      setPlan(null);
      setMessages((current) => [...current, { role: 'assistant', text: 'Συμπλήρωσε το όνομα και μια σύντομη περιγραφή της άσκησης: αρχική θέση, κύρια κίνηση και επιστροφή.' }]);
      return;
    }
    setPlan(analyzeExercise(exercise, { identityLock, mode: nextMode }));
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
            { role: 'system', content: 'Είσαι η Μπέμπα μου AI Coach και απαντάς στα ελληνικά. Βοηθάς με προπονητική και κινησιολογική περιγραφή, δεν διαγιγνώσκεις και δεν πιστοποιείς ασφάλεια. Άσκηση: ' + exercise.name + '. Περιγραφή: ' + (description || 'δεν δόθηκε ακόμη') + '. Μην επινοείς κινήσεις που δεν προκύπτουν.' },
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

  const exportPlan = () => {
    if (!plan) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = (exerciseName.trim() || 'exercise').toLowerCase().replace(/[^a-z0-9-]+/g, '-') + '-motion-prompts.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <section id="home-ai-studio" className="home-ai-panel" aria-labelledby="home-ai-title">
    <div className="home-ai-heading">
      <div>
        <p className="home-ai-eyebrow">SOFIA · PERSONAL AI STUDIO</p>
        <h2 id="home-ai-title">Μπέμπα μου AI Coach &amp; Prompt Generator</h2>
        <p>Περιέγραψε την άσκηση, συζήτησέ την με το chat και δημιούργησε prompts καρέ ή video mode.</p>
      </div>
      <span className="home-ai-lock">🔒 Reference ATHLETICO · 45°</span>
    </div>

    <div className="home-ai-form">
      <label>Όνομα άσκησης
        <input value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} placeholder="π.χ. Κάθισμα με βάρος σώματος" />
      </label>
      <label>Περιγραφή κίνησης
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Αρχική θέση, ποια μέλη κινούνται, σημεία στήριξης και πώς επιστρέφει στην αρχική θέση." />
      </label>
      <div className="home-ai-actions">
        <label>Εγκεκριμένο μοντέλο
          <select value={profile} onChange={(event) => setProfile(event.target.value as Profile)}>
            <option value="female">Γυναίκα ATHLETICO</option>
            <option value="male">Άνδρας ATHLETICO</option>
          </select>
        </label>
        <button type="button" onClick={() => generate('image')}>IMAGE MODE · Prompts ανά καρέ</button>
        <button type="button" onClick={() => generate('video')}>VIDEO MODE · Prompt κίνησης</button>
      </div>
      <p className="home-ai-note">Το εργαλείο δημιουργεί κινησιολογικά prompts και δεδομένα στάσης. Δεν παράγει από μόνο του τελικά αρχεία εικόνας ή βίντεο.</p>
    </div>

    <details className="home-ai-settings">
      <summary>Σύνδεση τοπικού AI chat (Ollama)</summary>
      <div className="home-ai-settings-grid">
        <label>Ollama URL<input value={ollamaUrl} onChange={(event) => setOllamaUrl(event.target.value)} /></label>
        <label>Μοντέλο<input value={ollamaModel} onChange={(event) => setOllamaModel(event.target.value)} /></label>
      </div>
      <p>Χρειάζεται Ollama εγκατεστημένο και ενεργό στη συσκευή. Χωρίς σύνδεση, το chat απαντά με περιορισμένους τοπικούς κανόνες.</p>
    </details>

    <div className="home-ai-chat" aria-live="polite">
      {messages.map((message, index) => <div key={index} className={message.role === 'user' ? 'home-ai-message user' : 'home-ai-message'}>
        <span>{message.text}</span>
        {message.role === 'assistant' && <button type="button" aria-label="Εκφώνηση απάντησης" onClick={() => speak(message.text)}>🔊</button>}
      </div>)}
    </div>
    <form className="home-ai-chat-form" onSubmit={sendMessage}>
      <input aria-label="Μήνυμα προς Μπέμπα μου AI Coach" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ρώτησε τη Μπέμπα μου…" />
      <button type="button" onClick={dictate} aria-label="Υπαγόρευση">🎙️</button>
      <button type="submit" disabled={busy}>{busy ? '…' : 'Αποστολή'}</button>
    </form>

    {plan && <div className="home-ai-results">
      <div className="home-ai-result-title">
        <h3>{plan.exercise} · {plan.status}</h3>
        <button type="button" onClick={exportPlan}>Εξαγωγή pose data JSON</button>
      </div>
      {plan.issues.map((issue: string, index: number) => <p className="home-ai-warning" key={index}>⚠️ {issue}</p>)}
      {plan.validation?.imageEvidence !== 'PROVIDED' && <p className="home-ai-note">Η συνέπεια της παραγόμενης εικόνας δεν έχει επαληθευτεί. Απαιτείται έλεγχος coach.</p>}
      {mode === 'video'
        ? <pre>{plan.videoPrompt || 'Δεν δημιουργήθηκε prompt: χρειάζεται ακριβέστερη περιγραφή κίνησης.'}</pre>
        : plan.frames?.map((frame: any) => <details key={frame.frame}>
            <summary>Καρέ {frame.frame} · {frame.label}</summary>
            <p>{frame.pose}</p>
            <p>Στήριξη: {frame.support} · {frame.angles}</p>
            <pre>{frame.prompt}</pre>
            <pre>{JSON.stringify(frame.poseSpec, null, 2)}</pre>
          </details>)}
    </div>}
  </section>;
};
