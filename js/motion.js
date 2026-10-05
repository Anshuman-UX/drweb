/* ==========================================================================
   GRAVITAS — MOTION & THE ANATOMY JOURNEY (motion.js)
   Artistic, high-tech GSAP 3.12.5 + ScrollTrigger choreography.
   Interactive 3D Hexacopter cursor tilt, flight mode transitions,
   synchronized font/image ready lifecycle, matchMedia responsiveness.
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
      this.initHexInteractiveStage();
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

    // 1. Hero High-Impact Precision Entrance
    initHeroEntrance() {
      const heroWordmark = document.querySelector('.hero-wordmark-large');
      const heroTagline = document.querySelector('.hero-tagline');
      const heroDrone = document.querySelector('.hero-staged-drone');
      const hudBar = document.querySelector('.hex-hud-bar');
      const modeSelector = document.querySelector('.hex-mode-selector');

      const tl = gsap.timeline({ defaults: { ease: 'cubic-bezier(0.16, 1, 0.3, 1)', duration: 1.1 } });

      if (heroWordmark) {
        tl.from(heroWordmark, { y: 35, opacity: 0, delay: 0.1 });
      }
      if (heroTagline) {
        tl.from(heroTagline, { y: 20, opacity: 0 }, '-=0.8');
      }
      if (hudBar) {
        tl.from(hudBar, { y: 15, opacity: 0, duration: 0.8 }, '-=0.7');
      }
      if (heroDrone) {
        tl.from(heroDrone, { scale: 0.92, opacity: 0, duration: 1.3 }, '-=0.9');
      }
      if (modeSelector) {
        tl.from(modeSelector, { y: 15, opacity: 0, duration: 0.7 }, '-=0.8');
      }
    },

    // 2. Interactive 3D Cursor Tilt & Hex Mode Switcher
    initHexInteractiveStage() {
      const stage = document.getElementById('hero-interactive-hex');
      const droneModel = document.getElementById('hero-drone-model');
      if (!stage || !droneModel) return;

      // Mousemove 3D Parallax Tilt
      stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        
        // Calculate smooth angular pitch and roll
        const rotX = -(mouseY / (rect.height / 2)) * 15;
        const rotY = (mouseX / (rect.width / 2)) * 18;

        droneModel.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      stage.addEventListener('mouseleave', () => {
        droneModel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      // Hex Flight Mode Selector Pills
      const modeButtons = stage.querySelectorAll('.mode-pill');
      const modeValDisplay = document.getElementById('hud-mode-val');
      const satValDisplay = document.getElementById('hud-sat-val');
      const rotorElements = stage.querySelectorAll('.rotor-cw, .rotor-ccw');

      const modeProfiles = {
        recon: {
          hud: 'RECON 360° // 52 MIN',
          sat: '32 SATS (L1/L5 FIXED)',
          spinSpeed: '0.28s'
        },
        whisper: {
          hud: 'WHISPER STEALTH // 42.1 dBA',
          sat: 'SILENT ESC ENGAGED',
          spinSpeed: '0.45s'
        },
        cinema: {
          hud: 'CINEMATIC 8K // 14 STOPS',
          sat: 'GIMBAL ±0.003° LOCKED',
          spinSpeed: '0.22s'
        },
        apex: {
          hud: 'APEX MAXIMUM // 72 KM/H',
          sat: 'HIGH-VELOCITY ESC ACTIVE',
          spinSpeed: '0.12s'
        }
      };

      modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          modeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const modeKey = btn.getAttribute('data-mode') || 'recon';
          const profile = modeProfiles[modeKey] || modeProfiles.recon;

          if (modeValDisplay) {
            modeValDisplay.textContent = profile.hud;
            gsap.fromTo(modeValDisplay, { opacity: 0.2 }, { opacity: 1, duration: 0.3 });
          }
          if (satValDisplay) {
            satValDisplay.textContent = profile.sat;
          }

          // Dynamically adjust rotor speeds
          rotorElements.forEach(rotor => {
            rotor.style.animationDuration = profile.spinSpeed;
          });

          // Gentle flash animation on drone
          gsap.fromTo(droneModel, { scale: 0.99 }, { scale: 1.02, duration: 0.25, yoyo: true, repeat: 1 });
        });
      });
    },

    // 3. Responsive Choreography (Desktop vs Mobile)
    initResponsiveChoreography() {
      const self = this;

      // DESKTOP REGIME (>= 1024px)
      this.mm.add('(min-width: 1024px)', () => {
        self.initAnatomyJourneyDesktop();
        self.initHorizontalScenariosDesktop();
      });

      // MOBILE REGIME (< 1024px)
      this.mm.add('(max-width: 1023px)', () => {
        const blueprintSvg = document.querySelector('.anatomy-blueprint');
        if (blueprintSvg) {
          gsap.set(blueprintSvg, { clearProps: 'all' });
        }
      });
    },

    // 4. Signature Motion: The Anatomy Journey (Desktop Pinned Mode)
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
          gsap.to(blueprintSvg, { scale: 1.35, x: 0, y: 70, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          if (lensTarget) gsap.to(lensTarget, { stroke: '#FF4B26', strokeWidth: 2.5, duration: 0.3 });
        },
        onLeaveBack: () => {
          gsap.to(blueprintSvg, { scale: 1.0, x: 0, y: 0, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          if (lensTarget) gsap.to(lensTarget, { stroke: '#FF4B26', strokeWidth: 1.6, duration: 0.3 });
        }
      });

      // Chapter 02: 6-Rotor Hexacopter Toroidal Propulsion Focus
      ScrollTrigger.create({
        trigger: '#chapter-02',
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          gsap.to(blueprintSvg, { scale: 1.4, x: -90, y: -40, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        },
        onEnterBack: () => {
          gsap.to(blueprintSvg, { scale: 1.4, x: -90, y: -40, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        }
      });

      // Chapter 03: OmniSight 360° Hex-LiDAR Perimeter Focus
      ScrollTrigger.create({
        trigger: '#chapter-03',
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          gsap.to(blueprintSvg, { scale: 1.3, x: 50, y: -20, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          if (sensorBeams.length) {
            gsap.to(sensorBeams, { opacity: 0.9, scale: 1.3, duration: 0.35, repeat: 3, yoyo: true });
          }
        },
        onLeave: () => {
          gsap.to(blueprintSvg, { scale: 1.0, x: 0, y: 0, duration: 0.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        }
      });
    },

    // 5. Horizontal Scenarios Scroll (Desktop Only)
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

    // 6. Typographic Stat Rolling Counters
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

    // 7. Subtle Editorial Reveals
    initEditorialReveals() {
      const cards = document.querySelectorAll('.stat-card, .matrix-card, .pillar-card, .scenario-card, .scenario-panel');
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
