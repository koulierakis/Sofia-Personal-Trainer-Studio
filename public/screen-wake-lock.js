(() => {
  const button = document.getElementById("screenWakeLock");
  if (!button) return;

  const status = button.querySelector("[data-wake-status]");
  const storageKey = "sofia-keep-screen-awake";
  let keepAwake = true;
  try { keepAwake = localStorage.getItem(storageKey) !== "false"; } catch {}
  const wakeLockApi = navigator.wakeLock;
  const supported = Boolean(wakeLockApi && typeof wakeLockApi.request === "function");
  let sentinel = null;
  let active = false;
  let requesting = false;

  const update = () => {
    const text = !supported
      ? "Δεν υποστηρίζεται"
      : !keepAwake
        ? "Οθόνη κανονικά"
        : active
          ? "Οθόνη ανοιχτή"
          : "Κράτα την οθόνη ανοιχτή";
    button.disabled = !supported;
    button.dataset.supported = String(supported);
    button.dataset.active = String(active);
    button.setAttribute("aria-pressed", String(keepAwake));
    button.setAttribute("aria-label", text);
    button.title = !supported
      ? "Αυτός ο browser δεν υποστηρίζει διατήρηση της οθόνης."
      : keepAwake
        ? active
          ? "Η οθόνη θα μείνει ανοιχτή όσο η εφαρμογή είναι μπροστά."
          : "Προσπάθεια διατήρησης της οθόνης ανοιχτής."
        : "Η εφαρμογή επιτρέπει στο κινητό να κλείσει την οθόνη.";
    if (status) status.textContent = text;
  };

  const acquire = async () => {
    if (!supported || !keepAwake || document.visibilityState !== "visible" || requesting) return;
    if (sentinel && !sentinel.released) return;
    requesting = true;
    try {
      const current = await wakeLockApi.request("screen");
      sentinel = current;
      active = true;
      current.addEventListener("release", () => {
        if (sentinel === current) {
          sentinel = null;
          active = false;
          update();
        }
      }, { once: true });
    } catch {
      active = false;
    } finally {
      requesting = false;
      update();
    }
  };

  const release = () => {
    const current = sentinel;
    sentinel = null;
    active = false;
    if (current && !current.released) void current.release().catch(() => {});
    update();
  };

  button.addEventListener("click", () => {
    keepAwake = !keepAwake;
    try { localStorage.setItem(storageKey, String(keepAwake)); } catch {}
    if (keepAwake) {
      update();
      void acquire();
    } else {
      release();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void acquire();
    else release();
  });
  window.addEventListener("pagehide", release);

  update();
  void acquire();
})();