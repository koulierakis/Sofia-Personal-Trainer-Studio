import { useEffect, useState } from 'react';
import { checkRelease } from '../services/app-release';

type InstallPrompt = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
const AUTO_KEY = 'mpempa_auto_update_check_v1';
export function AppExperience() {
  const mobile = window.location.pathname.startsWith('/mobile');
  const [automatic, setAutomatic] = useState(() => {
    try { return localStorage.getItem(AUTO_KEY) !== 'off'; } catch { return true; }
  });
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  useEffect(() => {
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPrompt); };
    const afterInstall = () => { setInstalled(true); setInstallPrompt(null); setMessage('Η εφαρμογή εγκαταστάθηκε.'); };
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', afterInstall);
    return () => { window.removeEventListener('beforeinstallprompt', beforeInstall); window.removeEventListener('appinstalled', afterInstall); };
  }, []);
  useEffect(() => {
    if (!automatic || !import.meta.env.PROD) return;
    let disposed = false;
    const check = async () => {
      try { if (await checkRelease(__APP_BUILD_ID__) && !disposed) setAvailable(true); }
      catch { /* An unavailable update server must not interrupt training. */ }
    };
    void check();
    const interval = window.setInterval(check, 60000);
    window.addEventListener('focus', check);
    window.addEventListener('online', check);
    return () => { disposed = true; clearInterval(interval); window.removeEventListener('focus', check); window.removeEventListener('online', check); };
  }, [automatic]);
  const install = async () => {
    if (installPrompt) {
      try { await installPrompt.prompt(); const choice = await installPrompt.userChoice; setMessage(choice.outcome === 'accepted' ? 'Η εγκατάσταση ζητήθηκε από τον browser.' : 'Μπορείς να εγκαταστήσεις την εφαρμογή αργότερα.'); }
      catch { setMessage('Άνοιξε το μενού του browser και επίλεξε εγκατάσταση εφαρμογής.'); }
      setInstallPrompt(null);
    } else {
      setMessage('iPhone/iPad: Safari → Κοινοποίηση → Προσθήκη στην οθόνη αφετηρίας → Άνοιγμα ως εφαρμογή. Android: μενού browser → Εγκατάσταση εφαρμογής / Προσθήκη στην αρχική οθόνη.');
    }
  };
  return <section className="app-experience" aria-label="Εφαρμογή και ενημερώσεις">
    <button type="button" onClick={() => window.location.reload()} title="Φόρτωση της τελευταίας δημοσιευμένης έκδοσης. Αποθήκευσε πρώτα τυχόν πρόχειρο κείμενο.">↻ Ανανέωση εφαρμογής</button>
    <label><input type="checkbox" checked={automatic} onChange={event => {
      setAutomatic(event.target.checked);
      try { localStorage.setItem(AUTO_KEY, event.target.checked ? 'on' : 'off'); } catch { /* Preference is optional. */ }
    }} />Αυτόματος έλεγχος ενημερώσεων</label>
    {!mobile && <a href="/mobile/">Εφαρμογή τηλεφώνου ↗</a>}
    {!installed && <button type="button" onClick={() => void install()}>Εγκατάσταση {mobile ? 'στο τηλέφωνο' : 'εφαρμογής'}</button>}
    {mobile && <span>Mpempa mou Mobile · ξεχωριστό παράθυρο εφαρμογής</span>}
    {available && !dismissed && <div className="app-update-notice" role="status"><p>Νέα έκδοση διαθέσιμη. Αποθήκευσε τυχόν πρόχειρο κείμενο πριν την ανανέωση.</p><button type="button" onClick={() => window.location.reload()}>Εφαρμογή ενημέρωσης</button><button type="button" onClick={() => setDismissed(true)}>Αργότερα</button></div>}
    {message && <p role="status" className="app-experience-note">{message}</p>}
  </section>;
}
