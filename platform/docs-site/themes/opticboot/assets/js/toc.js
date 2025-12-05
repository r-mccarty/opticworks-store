/**
 * Table of Contents - Active heading tracking
 */
(function () {
  const toc = document.getElementById('toc');
  if (!toc) return;

  const links = toc.querySelectorAll('.toc__link');
  const headings = [];

  // Collect headings referenced in ToC
  links.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) {
      const heading = document.getElementById(id);
      if (heading) {
        headings.push({ id, element: heading, link });
      }
    }
  });

  if (headings.length === 0) return;

  // Track active heading on scroll
  let activeId = null;

  function updateActiveHeading() {
    const scrollY = window.scrollY;
    const offset = 100; // Account for fixed navbar

    let currentId = null;

    for (const { id, element } of headings) {
      const top = element.getBoundingClientRect().top + scrollY - offset;
      if (scrollY >= top) {
        currentId = id;
      }
    }

    // Default to first heading if at top
    if (!currentId && headings.length > 0) {
      currentId = headings[0].id;
    }

    if (currentId !== activeId) {
      activeId = currentId;

      links.forEach((link) => {
        link.classList.remove('toc__link--active');
      });

      const activeLink = toc.querySelector(`a[href="#${currentId}"]`);
      activeLink?.classList.add('toc__link--active');
    }
  }

  // Throttled scroll handler
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveHeading();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial update
  updateActiveHeading();

  // Smooth scroll on ToC link click
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href')?.replace('#', '');
      const target = document.getElementById(id);

      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });

        // Update URL hash
        history.pushState(null, null, `#${id}`);
      }
    });
  });
})();
