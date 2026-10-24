(() => {
  const button = document.getElementById("pwaInstall");
  if (!button) return;
  let installPrompt = null;
  const isInstalled = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (isInstalled()) button.hidden = true;

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    button.textContent = "⬇ Εγκατάσταση εφαρμογής";
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    button.hidden = true;
  });
  button.addEventListener("click", async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      installPrompt = null;
      if (choice.outcome === "accepted") button.hidden = true;
      return;
    }
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    alert(ios
      ? "Στο Safari πάτησε Κοινή χρήση και μετά «Προσθήκη στην οθόνη Αφετηρίας»."
      : "Άνοιξε το μενού του browser (⋮) και επίλεξε «Εγκατάσταση εφαρμογής» ή «Προσθήκη στην αρχική οθόνη».");
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
})();
