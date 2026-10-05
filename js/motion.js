/* ==========================================================================
   GARUD — MOTION & THE ANATOMY JOURNEY (motion.js)
   Artistic, restrained GSAP 3.12.5 + ScrollTrigger choreography.
   Synchronized font/image ready lifecycle, matchMedia responsiveness,
   and clean progressive enhancement.
   ========================================================================== */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[Motion] GSAP or ScrollTrigger not loaded. Site functions in clean static mode.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const MotionEngine = {
    init() {
      // 1. Reduced Motion Compliance
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('[Motion] prefers-reduced-motion detected. Preserving clean static layout.');
        return;
      }

      this.mm = gsap.matchMedia();

      this.initHeroEntrance();
      this.initStatsCounter();
      this.initEditorialReveals();
      this.initResponsiveChoreography();

      // Refresh ScrollTrigger calculations after everything is laid out
      ScrollTrigger.refresh();

      // Debounced resize handler
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 200);
      });
    },

    // 1. Hero Minimal Entrance
    initHeroEntrance() {
      const heroWordmark = document.querySelector('.hero-wordmark-large');
      const heroTagline = document.querySelector('.hero-tagline');
      const heroDrone = document.querySelector('.hero-staged-drone');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });

      if (heroWordmark) {
        tl.from(heroWordmark, { y: 40, opacity: 0, delay: 0.1 });
      }
      if (heroTagline) {
        tl.from(heroTagline, { y: 20, opacity: 0 }, '-=0.9');
      }
      if (heroDrone) {
        tl.from(heroDrone, { scale: 0.96, opacity: 0, duration: 1.4 }, '-=1.0');
      }
    },

    // 2. Responsive Choreography (Desktop vs Mobile)
    initResponsiveChoreography() {
      const self = this;

      // DESKTOP REGIME (>= 1024px)
      this.mm.add('(min-width: 1024px)', () => {
        self.initAnatomyJourneyDesktop();
        self.initHorizontalScenariosDesktop();
      });

      // MOBILE REGIME (< 1024px)
      this.mm.add('(max-width: 1023px)', () => {
        // Reset blueprint to neutral state on mobile to avoid off-screen displacement
        const blueprintSvg = document.querySelector('.anatomy-blueprint');
        if (blueprintSvg) {
          gsap.set(blueprintSvg, { clearProps: 'all' });
        }
      });
    },

    // 3. Signature Motion: The Anatomy Journey (Desktop Pinned Mode)
    initAnatomyJourneyDesktop() {
      const blueprintSvg = document.querySelector('.anatomy-blueprint');
      if (!blueprintSvg) return;

      const lensTarget = blueprintSvg.querySelector('.anatomy-lens-ring');
      const sensorBeams = blueprintSvg.querySelectorAll('.anatomy-sensor-beam');

      // Chapter 01: Optical Gimbal Focus
      ScrollTrigger.create({
        trigger: '#chapter-01',
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          gsap.to(blueprintSvg, { scale: 1.3, x: 0, y: 40, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          if (lensTarget) gsap.to(lensTarget, { stroke: '#FF4B26', strokeWidth: 2, duration: 0.3 });
        },
        onLeaveBack: () => {
          gsap.to(blueprintSvg, { scale: 1.0, x: 0, y: 0, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          if (lensTarget) gsap.to(lensTarget, { stroke: '#FF4B26', strokeWidth: 1.2, duration: 0.3 });
        }
      });

      // Chapter 02: Toroidal Propulsion Focus
      ScrollTrigger.create({
        trigger: '#chapter-02',
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          gsap.to(blueprintSvg, { scale: 1.35, x: -60, y: -30, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        },
        onEnterBack: () => {
          gsap.to(blueprintSvg, { scale: 1.35, x: -60, y: -30, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        }
      });

      // Chapter 03: OmniSight LiDAR Perimeter Focus
      ScrollTrigger.create({
        trigger: '#chapter-03',
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          gsap.to(blueprintSvg, { scale: 1.25, x: 40, y: -15, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          if (sensorBeams.length) {
            gsap.to(sensorBeams, { opacity: 0.8, scale: 1.2, duration: 0.4, repeat: 3, yoyo: true });
          }
        },
        onLeave: () => {
          gsap.to(blueprintSvg, { scale: 1.0, x: 0, y: 0, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        }
      });
    },

    // 4. Horizontal Scenarios Scroll (Desktop Only)
    initHorizontalScenariosDesktop() {
      const section = document.querySelector('.scenarios-section');
      const track = document.querySelector('.scenario-track');
      if (!section || !track) return;

      const getScrollDistance = () => track.scrollWidth - track.clientWidth;

      if (getScrollDistance() > 0) {
        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            end: () => '+=' + getScrollDistance()
          }
        });
      }
    },

    // 5. Typographic Stat Rolling Counters
    initStatsCounter() {
      const statElements = document.querySelectorAll('.stat-number[data-target]');
      statElements.forEach(el => {
        const targetVal = parseFloat(el.getAttribute('data-target'));
        const isDecimal = targetVal % 1 !== 0;

        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            const counterObj = { val: 0 };
            gsap.to(counterObj, {
              val: targetVal,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = isDecimal ? counterObj.val.toFixed(1) : Math.round(counterObj.val);
              }
            });
          }
        });
      });
    },

    // 6. Subtle Editorial Reveals
    initEditorialReveals() {
      const cards = document.querySelectorAll('.stat-card, .matrix-card, .pillar-card, .scenario-card');
      cards.forEach(card => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 94%',
            once: true
          },
          y: 20,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        });
      });
    }
  };

  // Safe Lifecycle Initialization: Wait for fonts + window load before calculating trigger geometries
  const initWhenReady = () => {
    const fontPromise = document.fonts ? document.fonts.ready : Promise.resolve();
    const loadPromise = new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });

    Promise.all([fontPromise, loadPromise]).then(() => {
      MotionEngine.init();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }
})();
