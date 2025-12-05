/**
 * Search - Documentation search with keyboard navigation
 */
(function () {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const searchBtn = document.getElementById('search-btn');

  let searchIndex = null;
  let selectedIndex = -1;

  // Open search modal
  function openSearch() {
    modal?.classList.add('is-open');
    input?.focus();
    document.body.style.overflow = 'hidden';
  }

  // Close search modal
  function closeSearch() {
    modal?.classList.remove('is-open');
    document.body.style.overflow = '';
    if (input) input.value = '';
    if (results) results.innerHTML = '<div class="search-modal__empty">Type to search...</div>';
    selectedIndex = -1;
  }

  // Load search index
  async function loadIndex() {
    if (searchIndex) return searchIndex;

    try {
      const response = await fetch('/index.json');
      searchIndex = await response.json();
      return searchIndex;
    } catch (err) {
      console.error('Failed to load search index:', err);
      return [];
    }
  }

  // Perform search
  async function search(query) {
    if (!query || query.length < 2) {
      results.innerHTML = '<div class="search-modal__empty">Type to search...</div>';
      return;
    }

    const index = await loadIndex();
    const normalizedQuery = query.toLowerCase();

    const matches = index.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const description = (item.description || '').toLowerCase();

      return (
        title.includes(normalizedQuery) ||
        content.includes(normalizedQuery) ||
        description.includes(normalizedQuery)
      );
    });

    renderResults(matches, query);
  }

  // Render search results
  function renderResults(matches, query) {
    if (matches.length === 0) {
      results.innerHTML = '<div class="search-modal__empty">No results found</div>';
      return;
    }

    const html = matches
      .slice(0, 10)
      .map((item, i) => {
        const excerpt = getExcerpt(item.content || item.description || '', query);
        return `
          <a href="${item.permalink}" class="search-result${i === selectedIndex ? ' search-result--selected' : ''}" data-index="${i}">
            <div class="search-result__title">
              ${escapeHtml(item.title)}
              ${item.section ? `<span class="search-result__section">${escapeHtml(item.section)}</span>` : ''}
            </div>
            ${excerpt ? `<div class="search-result__excerpt">${excerpt}</div>` : ''}
          </a>
        `;
      })
      .join('');

    results.innerHTML = html;
    selectedIndex = -1;
  }

  // Get excerpt with highlighted query
  function getExcerpt(text, query) {
    if (!text) return '';

    const maxLength = 150;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
      return escapeHtml(text.slice(0, maxLength)) + (text.length > maxLength ? '...' : '');
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 100);
    let excerpt = text.slice(start, end);

    if (start > 0) excerpt = '...' + excerpt;
    if (end < text.length) excerpt = excerpt + '...';

    // Highlight matches
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escapeHtml(excerpt).replace(regex, '<mark>$1</mark>');
  }

  // Navigate results with keyboard
  function navigateResults(direction) {
    const items = results.querySelectorAll('.search-result');
    if (items.length === 0) return;

    items.forEach((item) => item.classList.remove('search-result--selected'));

    if (direction === 'down') {
      selectedIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
    } else {
      selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
    }

    items[selectedIndex]?.classList.add('search-result--selected');
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }

  // Select current result
  function selectResult() {
    const selected = results.querySelector('.search-result--selected');
    if (selected) {
      window.location.href = selected.getAttribute('href');
    }
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Escape regex special characters
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Event listeners
  searchBtn?.addEventListener('click', openSearch);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });

  input?.addEventListener('input', (e) => {
    search(e.target.value);
  });

  document.addEventListener('keydown', (e) => {
    // Open with Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (modal?.classList.contains('is-open')) {
        closeSearch();
      } else {
        openSearch();
      }
    }

    // Close with Escape
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeSearch();
    }

    // Navigate with arrow keys
    if (modal?.classList.contains('is-open')) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateResults('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateResults('up');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectResult();
      }
    }
  });

  // Click on result
  results?.addEventListener('click', (e) => {
    const result = e.target.closest('.search-result');
    if (result) {
      window.location.href = result.getAttribute('href');
    }
  });
})();
