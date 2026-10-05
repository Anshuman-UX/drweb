/* ==========================================================================
   GARUD — MOTION & THE ANATOMY JOURNEY (motion.js)
   GSAP 3.12.5 + ScrollTrigger signature camera moves, SVG line drawing,
   subtle image unmasks, and chapter stat counter animations.
   ========================================================================== */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[Motion] GSAP or ScrollTrigger not loaded.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const MotionEngine = {
    init() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('[Motion] prefers-reduced-motion active. Skipping cinematic scrubs.');
        return;
      }

      this.initHeroEntrance();
      this.initAnatomyJourney();
      this.initStatsCounter();
      this.initEditorialReveals();
      this.initHorizontalScenarios();
    },

    // 1. Hero Minimal Entrance
    initHeroEntrance() {
      const heroWordmark = document.querySelector('.hero-wordmark-large');
      const heroTagline = document.querySelector('.hero-tagline');
      const heroDrone = document.querySelector('.hero-staged-drone');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.4 } });

      if (heroWordmark) {
        tl.from(heroWordmark, { y: 60, opacity: 0, delay: 0.2 });
      }
      if (heroTagline) {
        tl.from(heroTagline, { y: 30, opacity: 0 }, '-=1.0');
      }
      if (heroDrone) {
        tl.from(heroDrone, { scale: 0.94, opacity: 0, ease: 'power2.out', duration: 1.8 }, '-=1.2');
      }
    },

    // 2. The Anatomy Journey (Signature Scroll-Driven Camera & Line Focus)
    initAnatomyJourney() {
      const journeySection = document.getElementById('anatomyJourney');
      const droneSvg = document.getElementById('anatomyDroneSvg');
      const chapters = document.querySelectorAll('.anatomy-chapter');
      const calloutGimbal = document.getElementById('calloutGimbal');
      const calloutProp = document.getElementById('calloutProp');
      const calloutBattery = document.getElementById('calloutBattery');
      const calloutSensors = document.getElementById('calloutSensors');

      if (!journeySection || !droneSvg) return;

      // Master scroll timeline scrubbing camera angles across chapters
      chapters.forEach((chapter, index) => {
        const targetFocus = chapter.getAttribute('data-focus');

        ScrollTrigger.create({
          trigger: chapter,
          start: 'top 60%',
          end: 'bottom 60%',
          onEnter: () => this.applyAnatomyFocus(droneSvg, targetFocus),
          onEnterBack: () => this.applyAnatomyFocus(droneSvg, targetFocus)
        });
      });
    },

    applyAnatomyFocus(svg, target) {
      if (!svg) return;

      // Subtle rotation and scale shift focused on the mechanical component
      switch (target) {
        case 'camera':
          gsap.to(svg, {
            scale: 1.45,
            xPercent: 12,
            yPercent: -18,
            rotation: -4,
            duration: 1.2,
            ease: 'power2.out'
          });
          this.highlightAnnotation('calloutGimbal');
          break;

        case 'propulsion':
          gsap.to(svg, {
            scale: 1.35,
            xPercent: -20,
            yPercent: 15,
            rotation: 8,
            duration: 1.2,
            ease: 'power2.out'
          });
          this.highlightAnnotation('calloutProp');
          break;

        case 'battery':
          gsap.to(svg, {
            scale: 1.25,
            xPercent: 0,
            yPercent: -10,
            rotation: 0,
            duration: 1.2,
            ease: 'power2.out'
          });
          this.highlightAnnotation('calloutBattery');
          break;

        case 'sensors':
          gsap.to(svg, {
            scale: 1.4,
            xPercent: -15,
            yPercent: -15,
            rotation: -10,
            duration: 1.2,
            ease: 'power2.out'
          });
          this.highlightAnnotation('calloutSensors');
          break;

        default:
          gsap.to(svg, {
            scale: 1.0,
            xPercent: 0,
            yPercent: 0,
            rotation: 0,
            duration: 1.2,
            ease: 'power2.out'
          });
          this.clearAnnotations();
          break;
      }
    },

    highlightAnnotation(activeId) {
      const allCallouts = document.querySelectorAll('.tech-callout-line, .tech-callout-tag');
      allCallouts.forEach(el => {
        el.style.opacity = el.id === activeId ? '1' : '0.15';
      });
    },

    clearAnnotations() {
      const allCallouts = document.querySelectorAll('.tech-callout-line, .tech-callout-tag');
      allCallouts.forEach(el => el.style.opacity = '0.5');
    },

    // 3. Typographic Number Count-Ups
    initStatsCounter() {
      const statNums = document.querySelectorAll('.stat-num[data-target]');
      statNums.forEach(el => {
        const targetVal = parseFloat(el.getAttribute('data-target'));
        const isDecimal = el.getAttribute('data-target').includes('.');

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.fromTo(el, 
              { innerText: 0 },
              {
                innerText: targetVal,
                duration: 1.8,
                ease: 'power2.out',
                snap: { innerText: isDecimal ? 0.1 : 1 }
              }
            );
          }
        });
      });
    },

    // 4. Restrained Editorial Text & Image Reveals
    initEditorialReveals() {
      const revealItems = document.querySelectorAll('.editorial-reveal');
      revealItems.forEach(item => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          duration: 1.0,
          ease: 'power3.out'
        });
      });
    },

    // 5. Horizontal Scroll for In-Flight Scenarios (Desktop)
    initHorizontalScenarios() {
      const container = document.querySelector('.horizontal-scenario-wrap');
      const track = document.querySelector('.horizontal-scenario-track');

      if (!container || !track || window.innerWidth < 992) return;

      const totalScroll = track.scrollWidth - window.innerWidth + 120;

      gsap.to(track, {
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${totalScroll}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1
        },
        x: () => -totalScroll,
        ease: 'none'
      });
    }
  };

  window.GarudMotion = MotionEngine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MotionEngine.init());
  } else {
    MotionEngine.init();
  }
})();
