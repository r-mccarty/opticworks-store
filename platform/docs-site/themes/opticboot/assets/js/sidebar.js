/**
 * Sidebar - Mobile toggle and collapsible sections
 */
(function () {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('mobile-toggle');

  // Mobile sidebar toggle
  function toggleSidebar() {
    sidebar?.classList.toggle('is-open');
    overlay?.classList.toggle('is-visible');
    document.body.classList.toggle('sidebar-open');
  }

  function closeSidebar() {
    sidebar?.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
    document.body.classList.remove('sidebar-open');
  }

  // Bind mobile toggle
  toggle?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar?.classList.contains('is-open')) {
      closeSidebar();
    }
  });

  // Collapsible sections
  const headings = document.querySelectorAll('.sidebar__heading[data-toggle="collapse"]');

  headings.forEach((heading) => {
    heading.addEventListener('click', () => {
      const isCollapsed = heading.classList.contains('is-collapsed');
      const list = heading.nextElementSibling;

      heading.classList.toggle('is-collapsed');
      heading.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');

      if (list) {
        list.classList.toggle('is-collapsed');
      }
    });
  });

  // Keep current section expanded
  const activeLink = sidebar?.querySelector('.sidebar__link--active, .sidebar__nested-link--active');
  if (activeLink) {
    // Expand parent sections
    let parent = activeLink.closest('.sidebar__section');
    while (parent) {
      const heading = parent.querySelector('.sidebar__heading');
      const list = parent.querySelector('.sidebar__list');

      if (heading?.classList.contains('is-collapsed')) {
        heading.classList.remove('is-collapsed');
        heading.setAttribute('aria-expanded', 'true');
      }
      if (list?.classList.contains('is-collapsed')) {
        list.classList.remove('is-collapsed');
      }

      parent = parent.parentElement?.closest('.sidebar__section');
    }

    // Expand nested lists
    const nestedList = activeLink.closest('.sidebar__nested');
    if (nestedList?.classList.contains('is-collapsed')) {
      nestedList.classList.remove('is-collapsed');
    }
  }
})();
