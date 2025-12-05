/**
 * Clipboard - Copy code blocks to clipboard
 */
(function () {
  // Add copy buttons to all code blocks
  function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('.highlight pre');

    codeBlocks.forEach((pre) => {
      // Skip if button already exists
      if (pre.querySelector('.copy-btn')) return;

      const button = document.createElement('button');
      button.className = 'copy-btn';
      button.setAttribute('aria-label', 'Copy code');
      button.innerHTML = `
        <svg class="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;

      button.addEventListener('click', () => copyCode(pre, button));

      // Position button in highlight wrapper
      const highlight = pre.closest('.highlight');
      if (highlight) {
        highlight.style.position = 'relative';
        highlight.appendChild(button);
      } else {
        pre.style.position = 'relative';
        pre.appendChild(button);
      }
    });
  }

  // Copy code to clipboard
  async function copyCode(pre, button) {
    const code = pre.querySelector('code');
    if (!code) return;

    // Get text without line numbers
    let text = '';
    const lines = code.querySelectorAll('.line');

    if (lines.length > 0) {
      text = Array.from(lines)
        .map((line) => line.textContent)
        .join('\n');
    } else {
      text = code.textContent;
    }

    try {
      await navigator.clipboard.writeText(text);
      showSuccess(button);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        showSuccess(button);
      } catch (err2) {
        console.error('Failed to copy:', err2);
      }

      document.body.removeChild(textarea);
    }
  }

  // Show success state
  function showSuccess(button) {
    const copyIcon = button.querySelector('.icon-copy');
    const checkIcon = button.querySelector('.icon-check');

    button.classList.add('copied');
    copyIcon.style.display = 'none';
    checkIcon.style.display = 'block';

    setTimeout(() => {
      button.classList.remove('copied');
      copyIcon.style.display = 'block';
      checkIcon.style.display = 'none';
    }, 2000);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
