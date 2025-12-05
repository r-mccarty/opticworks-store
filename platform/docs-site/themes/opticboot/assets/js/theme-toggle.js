/**
 * Theme Toggle - Dark/Light mode switching
 */
(function () {
  const STORAGE_KEY = 'theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  // Get current theme from storage or system preference
  function getTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  // Apply theme to document
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  }

  // Update toggle button icon
  function updateToggleIcon(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const sunIcon = toggle.querySelector('.icon-sun');
    const moonIcon = toggle.querySelector('.icon-moon');

    if (sunIcon && moonIcon) {
      sunIcon.style.display = theme === DARK ? 'block' : 'none';
      moonIcon.style.display = theme === LIGHT ? 'block' : 'none';
    }
  }

  // Toggle theme
  function toggleTheme() {
    const current = getTheme();
    const next = current === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Initialize
  function init() {
    // Apply initial theme
    applyTheme(getTheme());

    // Bind toggle button
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
