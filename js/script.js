document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('aside:not(.right-sidebar) ul li a');
  const progressBar = document.getElementById('progress-bar');
  const backToTopBtn = document.getElementById('back-to-top');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const html = document.documentElement;

  // Determine current filename
  let currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === '') currentPage = 'index.html';

  // Theme Logic
  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const getTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Initial Theme Load
  setTheme(getTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  // Mobile Menu Toggle
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      body.classList.toggle('menu-open');
    });
  }

  // Close menu when clicking links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      body.classList.remove('menu-open');
    });
  });

  // Close menu when clicking outside (on the overlay)
  document.addEventListener('click', (e) => {
    if (body.classList.contains('menu-open') &&
      !e.target.closest('aside') &&
      !e.target.closest('#menu-toggle')) {
      body.classList.remove('menu-open');
    }
  });

  // Highlight active section on scroll (ScrollSpy)
  const highlightSection = () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    // Fallback to first section if we are at the very top
    if (window.scrollY < 50 && sections.length > 0) {
      current = sections[0].getAttribute('id');
    }

    // Update left sidebar active links
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      const linkPage = href.includes('#') ? href.split('#')[0] : href;
      const linkHash = href.includes('#') ? href.split('#')[1] : '';

      // Normalize page names
      const normCurrent = currentPage;
      const normLink = linkPage === '' || !linkPage ? 'index.html' : linkPage;

      if (normLink === normCurrent && linkHash === current) {
        link.classList.add('active');
        
        // Auto scroll left sidebar to keep active link in view
        const parentTOC = link.closest('.toc-group');
        if (parentTOC) {
          const label = parentTOC.querySelector('.toc-label');
          if (label) label.style.color = 'var(--primary)';
        }
      } else {
        // Reset label colors if not active
        const parentTOC = link.closest('.toc-group');
        if (parentTOC) {
          const label = parentTOC.querySelector('.toc-label');
          const hasActiveLink = parentTOC.querySelector('ul li a.active');
          if (label && !hasActiveLink) {
            label.style.color = 'var(--text-light)';
          }
        }
      }
    });

    // Update right sidebar active links
    const rightLinks = document.querySelectorAll('.right-sidebar #on-this-page li a');
    rightLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      const linkHash = href.startsWith('#') ? href.substring(1) : href.split('#')[1];
      if (linkHash === current) {
        link.classList.add('active');
      }
    });

    // Update progress bar
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    if (progressBar) progressBar.style.width = scrolled + "%";

    // Show/Hide back to top button
    if (winScroll > 400) {
      if (backToTopBtn) backToTopBtn.classList.add('visible');
    } else {
      if (backToTopBtn) backToTopBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', highlightSection);
  highlightSection();

  // Smooth scroll to top
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Enhanced Copy button for code blocks
  const preBlocks = document.querySelectorAll('pre');
  preBlocks.forEach(pre => {
    if (pre.closest('.cursor-agent-container')) return;
    
    const code = pre.querySelector('code');
    if (!code) return;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      <span>Copier</span>
    `;
    pre.appendChild(btn);

    btn.addEventListener('click', () => {
      const textToCopy = code.innerText.replace(/^\s*admin@srv:~\$\s*/gm, '');
      navigator.clipboard.writeText(textToCopy).then(() => {
        const span = btn.querySelector('span');
        btn.classList.add('copied');
        span.innerText = 'Copié !';
        setTimeout(() => {
          btn.classList.remove('copied');
          span.innerText = 'Copier';
        }, 2000);
      });
    });
  });

  // Intersection Observer for fade-in effect on sections
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    section.classList.add('fade-in-section');
    observer.observe(section);
  });
});
