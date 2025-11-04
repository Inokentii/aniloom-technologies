const THEME_STORAGE_KEY = "aniloom-theme";
const QUALITY_STORAGE_KEY = "aniloom-quality";

const prefersDark = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyThemeClass = (mode) => {
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(mode === "light" ? "theme-light" : "theme-dark");
  window.dispatchEvent(
    new CustomEvent("aniloom:theme-change", { detail: { theme: mode } })
  );
};

const applyQualityState = (isLow) => {
  document.body.dataset.quality = isLow ? "low" : "high";
  window.dispatchEvent(
    new CustomEvent("aniloom:quality-change", {
      detail: { lowQuality: isLow },
    })
  );
};

const resolveInitialTheme = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return prefersDark() ? "dark" : "light";
};

const resolveInitialQuality = () => {
  const saved = localStorage.getItem(QUALITY_STORAGE_KEY);
  return saved === "low";
};

const initHeaderControls = () => {
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const qualityToggle = document.querySelector("[data-quality-toggle]");

  const initialTheme = resolveInitialTheme();
  applyThemeClass(initialTheme);
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${initialTheme === "dark" ? "light" : "dark"} mode`
    );
    themeToggle.textContent =
      initialTheme === "dark" ? "Day Mode" : "Night Mode";
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("theme-dark")
        ? "light"
        : "dark";
      applyThemeClass(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      themeToggle.textContent =
        nextTheme === "dark" ? "Day Mode" : "Night Mode";
      themeToggle.setAttribute(
        "aria-label",
        `Switch to ${nextTheme === "dark" ? "light" : "dark"} mode`
      );
    });
  }

  const initialLowQuality = resolveInitialQuality();
  applyQualityState(initialLowQuality);
  if (qualityToggle) {
    qualityToggle.setAttribute("aria-pressed", initialLowQuality ? "true" : "false");
    qualityToggle.textContent = initialLowQuality ? "High Quality" : "Low Quality";
    qualityToggle.addEventListener("click", () => {
      const nextLow = !(qualityToggle.getAttribute("aria-pressed") === "true");
      qualityToggle.setAttribute("aria-pressed", nextLow ? "true" : "false");
      qualityToggle.textContent = nextLow ? "High Quality" : "Low Quality";
      applyQualityState(nextLow);
      localStorage.setItem(QUALITY_STORAGE_KEY, nextLow ? "low" : "high");
    });
  }
};

document.addEventListener("DOMContentLoaded", initHeaderControls);
