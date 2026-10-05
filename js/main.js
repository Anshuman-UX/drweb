/* ============================================
   DRWEB AERO — Main JavaScript
   Core functionality: nav, loader, forms,
   cursor, theme, accordions, HUD, counters
   ============================================ */

(function () {
  'use strict';

  // ── LOADER ──
  const loader = document.querySelector('.loader');
  const loaderFill = document.querySelector('.loader__bar-fill');
  const loaderPercent = document.querySelector('.loader__percent');

  if (loader) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add('hidden');
          document.body.style.overflow = '';
          // Trigger entrance animations after loader
          document.dispatchEvent(new CustomEvent('loaderDone'));
        }, 400);
      }
      if (loaderFill) loaderFill.style.width = progress + '%';
      if (loaderPercent) loaderPercent.textContent = Math.floor(progress) + '%';
    }, 80);
    document.body.style.overflow = 'hidden';
  }

  // ── NAVBAR ──
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger') || document.querySelector('.navbar__hamburger');
  const mobileNav = document.querySelector('.mobile-nav') || document.querySelector('.navbar__mobile');

  // Scroll – add "scrolled" class
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  // Active link highlighting
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── THEME TOGGLE ──
  const themeToggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('drweb-theme', theme);
  }

  // Restore saved theme
  const savedTheme = localStorage.getItem('drweb-theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ── CUSTOM CURSOR ──
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    });

    function animateCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    document.querySelectorAll('a, button, .card, .btn, .accordion__header, input, textarea, .team-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }

  // ── MAGNETIC BUTTONS ──
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ── CARD MOUSE GLOW ──
  document.querySelectorAll('.card, .pricing-card, .team-card, .btn').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  // ── 3D TILT ON CARDS ──
  document.querySelectorAll('.card, .pricing-card, .team-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ── SCROLL REVEAL (IntersectionObserver) ──
  const revealEls = document.querySelectorAll('.reveal, .stagger');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }

  // ── ANIMATED COUNTERS ──
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterEls = document.querySelectorAll('[data-count]');
  if (counterEls.length) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => counterObs.observe(el));
  }

  // ── ACCORDION ──
  document.querySelectorAll('.accordion__header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion__item');
      const isActive = item.classList.contains('active');
      // Close all
      item.closest('.accordion').querySelectorAll('.accordion__item').forEach(i => {
        i.classList.remove('active');
      });
      // Toggle current
      if (!isActive) item.classList.add('active');
    });
  });

  // ── CONTACT FORM VALIDATION ──
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      // Clear errors
      contactForm.querySelectorAll('.form__group').forEach(g => g.classList.remove('error'));

      // Name
      const name = contactForm.querySelector('#name');
      if (name && name.value.trim().length < 2) {
        name.closest('.form__group').classList.add('error');
        valid = false;
      }
      // Email
      const email = contactForm.querySelector('#email');
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRe.test(email.value.trim())) {
        email.closest('.form__group').classList.add('error');
        valid = false;
      }
      // Subject
      const subject = contactForm.querySelector('#subject');
      if (subject && subject.value.trim().length < 2) {
        subject.closest('.form__group').classList.add('error');
        valid = false;
      }
      // Message
      const message = contactForm.querySelector('#message');
      if (message && message.value.trim().length < 10) {
        message.closest('.form__group').classList.add('error');
        valid = false;
      }

      if (valid) {
        // Success feedback
        const btn = contactForm.querySelector('[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = '✓ Message Sent!';
        btn.style.background = 'var(--clr-green)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          contactForm.reset();
        }, 2500);
      }
    });
  }

  // ── HUD OVERLAY ──
  const hud = document.querySelector('.hud-overlay');
  if (hud) {
    const altEl = hud.querySelector('.hud-alt');
    const batEl = hud.querySelector('.hud-bat');
    const gpsEl = hud.querySelector('.hud-gps');
    const spdEl = hud.querySelector('.hud-spd');

    function updateHUD() {
      const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const alt = Math.floor(120 + scrollPct * 380);
      const bat = Math.max(12, Math.floor(100 - scrollPct * 88));
      const lat = (20.4625 + scrollPct * 0.05).toFixed(4);
      const lng = (83.8275 + scrollPct * 0.03).toFixed(4);
      const spd = Math.floor(scrollPct * 45);

      if (altEl) altEl.textContent = 'ALT: ' + alt + ' m';
      if (batEl) batEl.textContent = 'BAT: ' + bat + '%';
      if (gpsEl) gpsEl.textContent = 'GPS: ' + lat + '°N ' + lng + '°E';
      if (spdEl) spdEl.textContent = 'SPD: ' + spd + ' m/s';
    }

    window.addEventListener('scroll', updateHUD, { passive: true });
    updateHUD();
  }

  // ── SMOOTH SCROLL for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── PAGE TRANSITION ──
  const transitionOverlay = document.querySelector('.page-transition');
  if (transitionOverlay) {
    document.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      link.addEventListener('click', e => {
        e.preventDefault();
        transitionOverlay.style.transformOrigin = 'bottom';
        transitionOverlay.style.transform = 'scaleY(1)';
        transitionOverlay.style.transition = 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1)';
        setTimeout(() => {
          window.location.href = href;
        }, 450);
      });
    });

    // On page load – reverse the transition
    window.addEventListener('pageshow', () => {
      transitionOverlay.style.transformOrigin = 'top';
      transitionOverlay.style.transform = 'scaleY(1)';
      requestAnimationFrame(() => {
        transitionOverlay.style.transition = 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1)';
        transitionOverlay.style.transform = 'scaleY(0)';
      });
    });
  }

  // ── TEXT TYPING ANIMATION ──
  document.querySelectorAll('.type-text').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    let i = 0;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        obs.unobserve(el);
        const typeInterval = setInterval(() => {
          el.textContent += text[i];
          i++;
          if (i >= text.length) clearInterval(typeInterval);
        }, 50);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  // ── NEWSLETTER (dummy) ──
  const nlForm = document.querySelector('.footer__newsletter');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = nlForm.querySelector('.footer__newsletter-btn');
      btn.textContent = '✓ Subscribed';
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        nlForm.querySelector('input').value = '';
      }, 2000);
    });
  }

  // ── MINI DRONES in background ──
  function createMiniDrones() {
    const container = document.body;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const drone = document.createElement('div');
      drone.classList.add('mini-drone');
      drone.innerHTML = `<svg width="${20 + i * 8}" height="${20 + i * 8}" viewBox="0 0 60 60" fill="none">
        <rect x="22" y="25" width="16" height="10" rx="3" fill="rgba(0,229,255,0.4)"/>
        <line x1="10" y1="28" x2="22" y2="28" stroke="rgba(0,229,255,0.3)" stroke-width="2"/>
        <line x1="38" y1="28" x2="50" y2="28" stroke="rgba(0,229,255,0.3)" stroke-width="2"/>
        <circle cx="10" cy="28" r="6" fill="none" stroke="rgba(0,229,255,0.2)" stroke-width="1.5" class="prop-spin"/>
        <circle cx="50" cy="28" r="6" fill="none" stroke="rgba(0,229,255,0.2)" stroke-width="1.5" class="prop-spin"/>
      </svg>`;
      drone.style.top = (15 + Math.random() * 70) + 'vh';
      drone.style.left = '-60px';
      drone.style.filter = `blur(${i * 0.8}px)`;
      drone.style.opacity = 0.06 + (0.04 * (count - i));
      drone.style.animation = `miniDroneFly ${18 + i * 8}s linear ${i * 5}s infinite`;
      container.appendChild(drone);
    }
  }

  // Inject keyframes for mini drones
  const miniDroneStyle = document.createElement('style');
  miniDroneStyle.textContent = `
    @keyframes miniDroneFly {
      0% { left: -80px; transform: translateY(0); }
      25% { transform: translateY(-20px); }
      50% { transform: translateY(10px); }
      75% { transform: translateY(-15px); }
      100% { left: 105vw; transform: translateY(0); }
    }
  `;
  document.head.appendChild(miniDroneStyle);
  createMiniDrones();

})();
