document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const html = document.documentElement;
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('aside ul li a');
  const headerLinks = document.querySelectorAll('.header-nav a');
  const progressBar = document.getElementById('progress-bar');
  const backToTopBtn = document.getElementById('back-to-top');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  // Nom de page normalisé (compatible avec les URLs propres de Vercel : /admin == admin.html)
  const normPage = (p) => {
    const name = (p || '').split('/').pop().split('?')[0].replace(/\.html$/, '');
    return name || 'index';
  };
  const currentPage = normPage(window.location.pathname);

  // ── Thème ──────────────────────────────────────────
  const storage = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    storage.set('theme', theme);
  };
  const getTheme = () =>
    storage.get('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  setTheme(getTheme());

  themeToggle?.addEventListener('click', () => {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ── Menu mobile (tiroir) ───────────────────────────
  const closeMenu = () => body.classList.remove('menu-open');
  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    body.classList.toggle('menu-open');
  });
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  // Clic en dehors / Échap : ferme les panneaux
  document.addEventListener('click', (e) => {
    if (body.classList.contains('menu-open') && !e.target.closest('aside') && !e.target.closest('#menu-toggle')) {
      closeMenu();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (mq) => {
    if (mq.matches) { closeMenu(); }
  });

  // ── Liens actifs de l'en-tête ──────────────────────
  headerLinks.forEach((a) => {
    const [page] = a.getAttribute('href').split('#');
    a.classList.toggle('active', normPage(page) === currentPage);
  });

  // ── ScrollSpy + progression ────────────────────────
  let activeLeft = null;
  const update = () => {
    let current = sections[0]?.id || '';
    const scrollPos = window.scrollY + 120;
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) current = section.id;
    });

    navLinks.forEach((link) => {
      const [page, hash = ''] = link.getAttribute('href').split('#');
      const isActive = normPage(page) === currentPage && hash === current;
      link.classList.toggle('active', isActive);
      if (isActive && activeLeft !== link) {
        activeLeft = link;
        const aside = link.closest('aside');
        if (aside && window.innerWidth > 960) {
          const r = link.getBoundingClientRect();
          const ar = aside.getBoundingClientRect();
          if (r.top < ar.top + 40 || r.bottom > ar.bottom - 40) {
            aside.scrollTo({ top: link.offsetTop - aside.clientHeight / 3, behavior: 'smooth' });
          }
        }
      }
    });
    document.querySelectorAll('aside .toc-group').forEach((g) => {
      const label = g.querySelector('.toc-label');
      if (label) label.style.color = g.querySelector('a.active') ? 'var(--text)' : '';
    });

    const winScroll = html.scrollTop || body.scrollTop;
    const height = html.scrollHeight - html.clientHeight;
    if (progressBar) progressBar.style.width = (height > 0 ? (winScroll / height) * 100 : 0) + '%';
    backToTopBtn?.classList.toggle('visible', winScroll > 400);
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  backToTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Tableaux : enveloppe défilante sur petit écran ─
  document.querySelectorAll('main table').forEach((table) => {
    if (table.parentElement.classList.contains('table-wrapper')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-wrapper';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // ── Bouton copier sur les blocs de code ────────────
  document.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      <span>Copier</span>`;
    pre.appendChild(btn);

    btn.addEventListener('click', () => {
      // On retire les invites de commande (.c-prompt) avant de copier
      const clone = code.cloneNode(true);
      clone.querySelectorAll('.c-prompt').forEach((p) => {
        const next = p.nextSibling;
        if (next && next.nodeType === 3) next.textContent = next.textContent.replace(/^ /, '');
        p.remove();
      });
      const text = clone.textContent.replace(/^[ \t]*admin@srv:~\$\s*/gm, '');
      navigator.clipboard?.writeText(text).then(() => {
        const span = btn.querySelector('span');
        btn.classList.add('copied');
        span.textContent = 'Copié';
        setTimeout(() => { btn.classList.remove('copied'); span.textContent = 'Copier'; }, 1800);
      });
    });
  });

  // ── Apparition douce des sections ──────────────────
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    sections.forEach((section) => {
      section.classList.add('fade-in-section');
      observer.observe(section);
    });
  }
});
