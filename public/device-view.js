(() => {
  const app = document.getElementById("app");
  const controls = document.querySelectorAll("[data-device-view]");
  if (!app || !controls.length) return;

  const storageKey = "sofia-device-view";
  const saved = localStorage.getItem(storageKey);
  const initial = saved === "desktop" || saved === "mobile"
    ? saved
    : (window.matchMedia("(max-width: 650px)").matches ? "mobile" : "desktop");

  function selectView(view) {
    app.dataset.deviceView = view;
    controls.forEach((button) => {
      const selected = button.dataset.deviceView === view;
      button.setAttribute("aria-pressed", String(selected));
    });
    try { localStorage.setItem(storageKey, view); } catch {}
  }

  controls.forEach((button) => {
    button.addEventListener("click", () => selectView(button.dataset.deviceView));
  });
  selectView(initial);
})();