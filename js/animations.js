/* ============================================
   DRWEB AERO — GSAP Animations Engine
   Heavy scroll-driven & entrance animations
   Uses GSAP 3.12.5 + ScrollTrigger
   ============================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // Wait for loader to finish
  function initAnimations() {

    // ── HERO ENTRANCE ──
    const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTL
      .from('.hero__badge', { opacity: 0, y: 30, duration: 0.8 }, 0.1)
      .from('.hero__title .line', {
        opacity: 0, y: 80, rotateX: -40,
        stagger: 0.15, duration: 1
      }, 0.2)
      .from('.hero__desc', { opacity: 0, y: 30, duration: 0.8 }, 0.7)
      .from('.hero__actions > *', {
        opacity: 0, y: 20, stagger: 0.1, duration: 0.6
      }, 0.9)
      .from('.hero__drone-container', {
        opacity: 0, x: 200, y: -100, rotation: 15,
        duration: 1.5, ease: 'power2.out'
      }, 0.3)
      .from('.hud-overlay', { opacity: 0, x: 30, duration: 0.8 }, 1.2);

    // ── HERO DRONE MOUSE TILT ──
    const heroDrone = document.querySelector('.hero__drone-container');
    if (heroDrone) {
      document.addEventListener('mousemove', e => {
        const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
        const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(heroDrone, {
          rotateY: xPct * 12,
          rotateX: -yPct * 8,
          x: xPct * 20,
          y: yPct * 15,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
    }

    // ── SECTION REVEALS ──
    gsap.utils.toArray('.gsap-reveal').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out'
      });
    });

    // ── STAGGERED CARD REVEALS ──
    gsap.utils.toArray('.gsap-stagger').forEach(container => {
      const items = container.children;
      gsap.from(items, {
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        scale: 0.95,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // ── PARALLAX SECTIONS ──
    gsap.utils.toArray('.parallax-bg').forEach(bg => {
      gsap.to(bg, {
        scrollTrigger: {
          trigger: bg.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: -100,
        ease: 'none'
      });
    });

    // ── STATS COUNTER ANIMATION ──
    gsap.utils.toArray('.gsap-counter').forEach(el => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = prefix + Math.floor(obj.val).toLocaleString() + suffix;
            }
          });
        },
        once: true
      });
    });

    // ── TEXT SPLIT ANIMATION ──
    gsap.utils.toArray('.split-text').forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(30px) rotateX(-40deg)';
        el.appendChild(span);
      });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(el.children, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            stagger: 0.025,
            duration: 0.6,
            ease: 'power3.out'
          });
        },
        once: true
      });
    });

    // ── MARQUEE SPEED CONTROL ──
    const marquee = document.querySelector('.marquee__inner');
    if (marquee) {
      gsap.to(marquee, {
        scrollTrigger: {
          trigger: '.marquee',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5
        },
        x: -200,
        ease: 'none'
      });
    }

    // ── TIMELINE ANIMATION ──
    gsap.utils.toArray('.timeline__item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        x: i % 2 === 0 ? -50 : 50,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // ── PRICING CARD SCALE-IN ──
    gsap.utils.toArray('.pricing-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 80,
        scale: 0.9,
        duration: 0.9,
        delay: i * 0.15,
        ease: 'back.out(1.4)'
      });
    });

    // ── CTA BANNER ENTRANCE ──
    const ctaBanner = document.querySelector('.cta-banner');
    if (ctaBanner) {
      gsap.from(ctaBanner, {
        scrollTrigger: {
          trigger: ctaBanner,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        scale: 0.92,
        y: 40,
        duration: 1,
        ease: 'power3.out'
      });
    }

    // ── FLOATING ELEMENTS ──
    gsap.utils.toArray('.float').forEach((el, i) => {
      gsap.to(el, {
        y: 'random(-15, 15)',
        x: 'random(-8, 8)',
        rotation: 'random(-3, 3)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3
      });
    });

    // ── SCROLL PROGRESS BAR (at top of page) ──
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      gsap.to(progressBar, {
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3
        },
        scaleX: 1,
        transformOrigin: 'left center',
        ease: 'none'
      });
    }

    // ── DRONE SCROLL FOLLOWER ──
    const scrollDrone = document.querySelector('.drone-scroll-svg');
    if (scrollDrone) {
      gsap.to(scrollDrone, {
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            // Move drone along a curved path as user scrolls
            const viewH = window.innerHeight;
            const viewW = window.innerWidth;
            const x = 40 + Math.sin(progress * Math.PI * 3) * (viewW * 0.3);
            const y = 80 + progress * (viewH - 160);
            const rotation = Math.sin(progress * Math.PI * 4) * 15;
            gsap.set(scrollDrone, { x, y, rotation });
          }
        }
      });
    }

    // ── NAVBAR HIDE/SHOW ON SCROLL ──
    let lastScroll = 0;
    const nav = document.querySelector('.navbar');
    if (nav) {
      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
          const scrollY = self.scroll();
          if (scrollY > lastScroll && scrollY > 300) {
            gsap.to(nav, { y: -100, duration: 0.3, ease: 'power2.inOut' });
          } else {
            gsap.to(nav, { y: 0, duration: 0.3, ease: 'power2.inOut' });
          }
          lastScroll = scrollY;
        }
      });
    }

    // ── IMAGE REVEAL CLIP ──
    gsap.utils.toArray('.clip-reveal').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.2,
        ease: 'power4.out'
      });
    });

    // ── LINE DRAW SVG ──
    gsap.utils.toArray('.line-draw path').forEach(path => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        scrollTrigger: {
          trigger: path.closest('svg'),
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut'
      });
    });

    // ── HORIZONTAL SCROLL SECTION (if present) ──
    const hScroll = document.querySelector('.h-scroll');
    if (hScroll) {
      const hScrollInner = hScroll.querySelector('.h-scroll__inner');
      if (hScrollInner) {
        gsap.to(hScrollInner, {
          x: () => -(hScrollInner.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: hScroll,
            start: 'top top',
            end: () => '+=' + (hScrollInner.scrollWidth - window.innerWidth),
            scrub: 1,
            pin: true,
            anticipatePin: 1
          }
        });
      }
    }

    // ── PARTICLE / STAR FIELD ──
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
      const ctx = particleCanvas.getContext('2d');
      let particles = [];
      const PARTICLE_COUNT = 80;

      function resizeCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      class Particle {
        constructor() {
          this.reset();
        }
        reset() {
          this.x = Math.random() * particleCanvas.width;
          this.y = Math.random() * particleCanvas.height;
          this.size = Math.random() * 2 + 0.5;
          this.speedX = (Math.random() - 0.5) * 0.4;
          this.speedY = (Math.random() - 0.5) * 0.3;
          this.opacity = Math.random() * 0.5 + 0.1;
          this.pulse = Math.random() * Math.PI * 2;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          this.pulse += 0.02;
          if (this.x < 0 || this.x > particleCanvas.width ||
              this.y < 0 || this.y > particleCanvas.height) {
            this.reset();
          }
        }
        draw() {
          const o = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse));
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 229, 255, ${o})`;
          ctx.fill();
        }
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }

      let animId;
      function animateParticles() {
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        particles.forEach(p => { p.update(); p.draw(); });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(0, 229, 255, ${0.06 * (1 - dist / 120)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        animId = requestAnimationFrame(animateParticles);
      }

      // Only animate when visible
      const particleObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          animateParticles();
        } else {
          cancelAnimationFrame(animId);
        }
      });
      particleObs.observe(particleCanvas);
    }

    // ── TEAM CARD STAGGER ──
    gsap.utils.toArray('.team-grid').forEach(grid => {
      gsap.from(grid.children, {
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 60,
        rotateY: -15,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // ── COMPARISON TABLE ROW REVEAL ──
    gsap.utils.toArray('.comparison-table tr').forEach((row, i) => {
      if (i === 0) return; // skip header
      gsap.from(row, {
        scrollTrigger: {
          trigger: row,
          start: 'top 95%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        x: -30,
        duration: 0.5,
        delay: i * 0.05,
        ease: 'power2.out'
      });
    });

    // ── 404 DRONE WOBBLE ──
    const errorDrone = document.querySelector('.error-page__drone');
    if (errorDrone) {
      // Sparks
      gsap.to(errorDrone, {
        rotation: 'random(-15, 15)',
        y: 'random(-10, 10)',
        x: 'random(-10, 10)',
        duration: 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'rough({ strength: 3, points: 20, template: none, taper: none, randomize: true })'
      });
    }
  }

  // Fire after loader
  if (document.querySelector('.loader')) {
    document.addEventListener('loaderDone', initAnimations);
  } else {
    // No loader on this page
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAnimations);
    } else {
      initAnimations();
    }
  }

})();
