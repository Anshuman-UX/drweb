/* ==========================================================================
   DRWEB AERO / AMR-PD — CINEMATIC SHOWREEL ENGINE (showreel.js)
   A complete award-winning brand film rendered procedurally in code with GSAP,
   Web Audio synthesizer soundtrack, 8 distinct cinematic scenes, anamorphic
   lens flares, film grain, kinetic captions, custom scrubber & player controls.
   ========================================================================== */

(function () {
  'use strict';

  class ShowreelEngine {
    constructor() {
      this.theaterEl = null;
      this.masterTL = null;
      this.audioCtx = null;
      this.synthOscs = [];
      this.isPlaying = false;
      this.isMuted = true;
      this.showCaptions = true;
      this.playbackSpeed = 1;
      this.totalDuration = 52; // seconds

      this.scenes = [
        { time: 0, title: 'Ignition & Genesis', caption: 'From high-altitude defense to remote disaster relief...' },
        { time: 6, title: 'Mach Launch', caption: 'AMR-PD Heavy-Lift Hexacopter: 25kg Payload, 60km BVLOS range.' },
        { time: 13, title: 'Thermal Recon', caption: 'Dual EO/IR Thermal Gimbals with AI edge-computing object tracking.' },
        { time: 20, title: 'Modular ISO Payload', caption: 'Hot-swappable ISO rails: 6 missions in one unified airframe.' },
        { time: 27, title: 'Extreme Weather Drill', caption: 'IP67 weatherproofing: Operational from -20°C to +55°C in storm conditions.' },
        { time: 34, title: 'Autonomous Swarm Mesh', caption: 'Decentralized mesh networking with anti-jamming satellite backup.' },
        { time: 41, title: 'Disaster & Defense Proof', caption: 'Validated in high-altitude Border Ops & National Disaster drills.' },
        { time: 47, title: 'The Sky Has No Limit', caption: 'THE SKY IS NO LONGER THE LIMIT. BUILD YOUR FLEET.' }
      ];

      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      this.theaterEl = document.getElementById('showreelTheater');
      if (this.theaterEl) {
        this.checkRealVideoFallback();
        this.buildCinematicTimeline();
        this.bindPlayerControls();
        this.bindKeyboardShortcuts();
      }

      // Check for home hero teaser preview
      this.initHeroTeaser();
    }

    // --- REAL MP4 FALLBACK CHECK ---
    checkRealVideoFallback() {
      const realVid = document.getElementById('realShowreelVideo');
      if (!realVid) return;

      // Probe if assets/video/showreel.mp4 actually exists
      fetch('assets/video/showreel.mp4', { method: 'HEAD' })
        .then(res => {
          if (res.ok) {
            console.log('Real video showreel.mp4 found. Switching to native video playback.');
            realVid.style.display = 'block';
            const proceduralStage = document.getElementById('proceduralFilmStage');
            if (proceduralStage) proceduralStage.style.display = 'none';
          }
        })
        .catch(() => {
          // Keep procedural code-built film
        });
    }

    // --- PROCEDURAL WEB AUDIO SYNTHESIZER SOUNDTRACK ---
    initAudio() {
      if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    startSoundtrack() {
      if (this.isMuted) return;
      this.initAudio();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      this.stopSoundtrack();

      try {
        const t = this.audioCtx.currentTime;

        // 1. Deep Sub-bass Pad (A1 = 55Hz)
        const bassOsc = this.audioCtx.createOscillator();
        const bassGain = this.audioCtx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(55, t);
        bassGain.gain.setValueAtTime(0.08, t);

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, t);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.audioCtx.destination);
        bassOsc.start(t);
        this.synthOscs.push(bassOsc);

        // 2. Pulse Arpeggiator simulation
        const arpOsc = this.audioCtx.createOscillator();
        const arpGain = this.audioCtx.createGain();
        arpOsc.type = 'triangle';
        arpOsc.frequency.setValueAtTime(220, t);
        arpGain.gain.setValueAtTime(0.04, t);

        arpOsc.connect(arpGain);
        arpGain.connect(this.audioCtx.destination);
        arpOsc.start(t);
        this.synthOscs.push(arpOsc);
      } catch (err) {}
    }

    stopSoundtrack() {
      this.synthOscs.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.synthOscs = [];
    }

    // --- GSAP MASTER BRAND FILM TIMELINE ---
    buildCinematicTimeline() {
      if (!window.gsap) return;

      const stage = document.getElementById('proceduralFilmStage');
      if (!stage) return;

      const flare = document.getElementById('showreelFlare');
      const captionBox = document.getElementById('showreelCaptionBox');

      this.masterTL = gsap.timeline({
        paused: true,
        onUpdate: () => this.onTimelineUpdate(),
        onComplete: () => this.onFilmComplete()
      });

      // Clear any prior animations
      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');
      const s4 = document.getElementById('scene4');
      const s5 = document.getElementById('scene5');
      const s6 = document.getElementById('scene6');
      const s7 = document.getElementById('scene7');
      const s8 = document.getElementById('scene8');

      // Helper for scene transitions
      const setCaption = (text) => {
        if (!captionBox) return;
        if (!this.showCaptions) {
          captionBox.style.opacity = '0';
          return;
        }
        captionBox.textContent = text;
        gsap.fromTo(captionBox, 
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      };

      // SCENE 1: Genesis & Dual-Use Emblem (0s - 6s)
      this.masterTL.add(() => setCaption(this.scenes[0].caption), 0.2);
      this.masterTL.fromTo(s1, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, 0);
      this.masterTL.to(flare, { opacity: 0.8, x: 200, duration: 2.5, ease: 'sine.inOut' }, 1);
      this.masterTL.to(s1, { opacity: 0, scale: 1.1, duration: 1.2, ease: 'power2.in' }, 4.8);

      // SCENE 2: Mach Takeoff & Hexacopter Blast (6s - 13s)
      this.masterTL.add(() => setCaption(this.scenes[1].caption), 6.1);
      this.masterTL.fromTo(s2, { opacity: 0, y: 100, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'back.out(1.4)' }, 6);
      this.masterTL.to('#machRings circle', { strokeDashoffset: 0, stagger: 0.2, duration: 1.5, repeat: 2 }, 6.5);
      this.masterTL.to(s2, { opacity: 0, y: -80, duration: 1.2 }, 11.8);

      // SCENE 3: Thermal Recon & FLIR Grid (13s - 20s)
      this.masterTL.add(() => setCaption(this.scenes[2].caption), 13.1);
      this.masterTL.fromTo(s3, { opacity: 0 }, { opacity: 1, duration: 1.5 }, 13);
      this.masterTL.fromTo('#thermalTargetReticle', { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }, 14);
      this.masterTL.to(s3, { opacity: 0, duration: 1 }, 19);

      // SCENE 4: Modular Payload Swapping (20s - 27s)
      this.masterTL.add(() => setCaption(this.scenes[3].caption), 20.1);
      this.masterTL.fromTo(s4, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1.5 }, 20);
      this.masterTL.fromTo('.payload-module-icon', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.3, duration: 0.8 }, 21.5);
      this.masterTL.to(s4, { opacity: 0, x: 60, duration: 1 }, 26);

      // SCENE 5: Extreme Weather & Wind Tunnel (27s - 34s)
      this.masterTL.add(() => setCaption(this.scenes[4].caption), 27.1);
      this.masterTL.fromTo(s5, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 27);
      this.masterTL.to('#stormWindLines line', { x: -300, repeat: 4, duration: 0.6, ease: 'none' }, 27.5);
      this.masterTL.to(s5, { opacity: 0, duration: 1 }, 33);

      // SCENE 6: Swarm Telemetry & Mesh Network (34s - 41s)
      this.masterTL.add(() => setCaption(this.scenes[5].caption), 34.1);
      this.masterTL.fromTo(s6, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.5 }, 34);
      this.masterTL.fromTo('.swarm-node', { scale: 0 }, { scale: 1, stagger: 0.2, duration: 0.6, ease: 'back.out(2)' }, 35);
      this.masterTL.to(s6, { opacity: 0, duration: 1 }, 40);

      // SCENE 7: Defense & Disaster Response Seal (41s - 47s)
      this.masterTL.add(() => setCaption(this.scenes[6].caption), 41.1);
      this.masterTL.fromTo(s7, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.5 }, 41);
      this.masterTL.to(s7, { opacity: 0, y: -40, duration: 1 }, 46);

      // SCENE 8: Grand Finale Call to Action (47s - 52s)
      this.masterTL.add(() => setCaption(this.scenes[7].caption), 47.1);
      this.masterTL.fromTo(s8, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }, 47);
    }

    onTimelineUpdate() {
      if (!this.masterTL) return;
      const progress = this.masterTL.progress();
      const currentSec = Math.floor(progress * this.totalDuration);

      // Scrubber fill
      const fillEl = document.getElementById('showreelScrubberFill');
      if (fillEl) fillEl.style.width = `${progress * 100}%`;

      // Time display
      const timeEl = document.getElementById('showreelTimeDisplay');
      if (timeEl) {
        const curM = String(Math.floor(currentSec / 60)).padStart(2, '0');
        const curS = String(currentSec % 60).padStart(2, '0');
        const totM = String(Math.floor(this.totalDuration / 60)).padStart(2, '0');
        const totS = String(this.totalDuration % 60).padStart(2, '0');
        timeEl.textContent = `${curM}:${curS} / ${totM}:${totS}`;
      }
    }

    onFilmComplete() {
      this.isPlaying = false;
      this.stopSoundtrack();
      const playBtn = document.getElementById('showreelPlayBtn');
      if (playBtn) playBtn.textContent = '▶ Play';

      if (window.AeroGame) {
        window.AeroGame.unlockBadge('SHOWREEL_DIRECTOR');
        window.AeroGame.updateMission('m_showreel', 1);
        window.AeroGame.addXP(150);
        window.AeroGame.spawnFloatText('SHOWREEL COMPLETE: +150 XP!', 'xp');
      }
    }

    // --- CONTROLS BINDING ---
    bindPlayerControls() {
      const playBtn = document.getElementById('showreelPlayBtn');
      const restartBtn = document.getElementById('showreelRestartBtn');
      const scrubber = document.getElementById('showreelScrubber');
      const soundBtn = document.getElementById('showreelMuteBtn');
      const captionsBtn = document.getElementById('showreelCaptionsBtn');
      const fullscreenBtn = document.getElementById('showreelFullscreenBtn');
      const speedPills = document.querySelectorAll('.showreel-speed-pill');

      if (playBtn) {
        playBtn.addEventListener('click', () => this.togglePlay());
      }
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          if (this.masterTL) this.masterTL.restart();
          this.isPlaying = true;
          if (playBtn) playBtn.textContent = '❚❚ Pause';
          this.startSoundtrack();
        });
      }
      if (scrubber) {
        scrubber.addEventListener('click', (e) => {
          const rect = scrubber.getBoundingClientRect();
          const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          if (this.masterTL) this.masterTL.progress(pct);
        });
      }
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          this.isMuted = !this.isMuted;
          soundBtn.textContent = this.isMuted ? '🔇 Audio' : '🔊 Audio';
          if (this.isMuted) {
            this.stopSoundtrack();
          } else if (this.isPlaying) {
            this.startSoundtrack();
          }
        });
      }
      if (captionsBtn) {
        captionsBtn.addEventListener('click', () => {
          this.showCaptions = !this.showCaptions;
          captionsBtn.classList.toggle('active', this.showCaptions);
          const captionBox = document.getElementById('showreelCaptionBox');
          if (captionBox) captionBox.style.display = this.showCaptions ? 'block' : 'none';
        });
      }
      if (fullscreenBtn && this.theaterEl) {
        fullscreenBtn.addEventListener('click', () => {
          if (!document.fullscreenElement) {
            this.theaterEl.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen();
          }
        });
      }
      speedPills.forEach(pill => {
        pill.addEventListener('click', () => {
          speedPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const spd = parseFloat(pill.getAttribute('data-speed')) || 1;
          this.playbackSpeed = spd;
          if (this.masterTL) this.masterTL.timeScale(spd);
        });
      });
    }

    togglePlay() {
      const playBtn = document.getElementById('showreelPlayBtn');
      if (this.isPlaying) {
        this.isPlaying = false;
        if (this.masterTL) this.masterTL.pause();
        this.stopSoundtrack();
        if (playBtn) playBtn.textContent = '▶ Play';
      } else {
        this.isPlaying = true;
        if (this.masterTL) this.masterTL.play();
        this.startSoundtrack();
        if (playBtn) playBtn.textContent = '❚❚ Pause';
      }
    }

    bindKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        // Only trigger if active on showreel page or theater in view
        if (!document.getElementById('showreelTheater')) return;

        if (e.code === 'Space') {
          e.preventDefault();
          this.togglePlay();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          if (this.masterTL) {
            const curTime = this.masterTL.time();
            this.masterTL.time(Math.max(0, curTime - 5));
          }
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          if (this.masterTL) {
            const curTime = this.masterTL.time();
            this.masterTL.time(Math.min(this.totalDuration, curTime + 5));
          }
        } else if (e.key === 'f' || e.key === 'F') {
          if (this.theaterEl) {
            if (!document.fullscreenElement) this.theaterEl.requestFullscreen().catch(() => {});
            else document.exitFullscreen();
          }
        } else if (e.key === 'm' || e.key === 'M') {
          const soundBtn = document.getElementById('showreelMuteBtn');
          if (soundBtn) soundBtn.click();
        }
      });
    }

    // --- HOME HERO TEASER (8-SECOND AUTOPLAY LOOP) ---
    initHeroTeaser() {
      const teaser = document.getElementById('heroShowreelTeaser');
      if (!teaser || !window.gsap) return;

      const teaserTL = gsap.timeline({ repeat: -1 });
      teaserTL.fromTo('#teaserMachDrone', { scale: 0.7, opacity: 0.4 }, { scale: 1.1, opacity: 1, duration: 4, ease: 'sine.inOut' });
      teaserTL.to('#teaserMachDrone', { scale: 0.85, opacity: 0.6, duration: 4, ease: 'sine.inOut' });

      // Pause when scrolled off screen
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) teaserTL.play();
            else teaserTL.pause();
          });
        });
        obs.observe(teaser);
      }
    }
  }

  // Instantiate and expose globally
  window.AeroShowreel = new ShowreelEngine();

})();
