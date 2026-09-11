document.addEventListener('DOMContentLoaded', () => {
  // ── THEME SWITCHER (SUPPORTING ALL TOGGLE BUTTONS) ──
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');

  function getThemePreference() {
    const saved = localStorage.getItem('pixel-web-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('pixel-web-theme', theme);
  }

  // Ensure theme is set on load
  setTheme(getThemePreference());

  themeToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  });

  // Respond to OS system theme preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('pixel-web-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ── NAVIGATION (DESKTOP SIDEBAR & MOBILE DRAWER) ──
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item, .mobile-drawer-nav .mobile-nav-item');

  function setActiveNav(id) {
    navItems.forEach((item) => {
      if (item.getAttribute('href') === `#${id}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // ── MOBILE NAVIGATION DRAWER ──
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-drawer-nav .mobile-nav-item, .mobile-drawer-cta');

  function openMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerOverlay) return;
    mobileDrawer.classList.add('open');
    mobileDrawerOverlay.classList.add('open');
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.add('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerOverlay) return;
    mobileDrawer.classList.remove('open');
    mobileDrawerOverlay.classList.remove('open');
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer && mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  }

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileDrawer();
    }
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      closeMobileDrawer();
    }
  });

  // ── REVEAL ON SCROLL ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('section, footer').forEach((s) => observer.observe(s));

  // Trigger hero on load
  const hero = document.querySelector('#hero');
  if (hero) {
    hero.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  }

  // Update active nav on scroll
  const sections = document.querySelectorAll('section');
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setActiveNav(e.target.id);
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((s) => navObserver.observe(s));

  // Handle nav clicks
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('href').replace('#', '');
      setActiveNav(targetId);
    });
  });
});
