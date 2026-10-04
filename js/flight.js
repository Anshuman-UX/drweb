/* ==========================================================================
   DRWEB AERO / AMR-PD — SIGNATURE DRONE FLIGHT JOURNEY ENGINE (flight.js)
   Controls continuous scroll-driven hero drone flight across 6 flight zones,
   MotionPathPlugin banking, Cockpit HUD telemetry, Flight Tracker mini-map,
   searchlight cone, laser scanning, auto-pilot, and custom drone swapping.
   ========================================================================== */

(function () {
  'use strict';

  class FlightJourneyEngine {
    constructor() {
      this.droneEl = null;
      this.svgPath = null;
      this.hudEl = null;
      this.trackerEl = null;
      this.searchlightEl = null;
      this.autoPilotTween = null;
      this.isAutoPilot = false;
      this.currentZone = 1;
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Telemetry base coordinates (GIET University Gunupur)
      this.baseLat = 19.0494;
      this.baseLng = 83.8213;

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
      // Register GSAP plugins
      if (window.gsap) {
        if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
        if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
      }

      this.buildDroneElement();
      this.buildCockpitHUD();
      this.buildFlightTracker();
      this.buildSearchlight();

      // Only build continuous motion path if page has flight zones (primarily index.html)
      const hasZones = document.querySelector('.flight-zone-takeoff');
      if (hasZones && !this.isReducedMotion && window.MotionPathPlugin && window.ScrollTrigger) {
        this.generateFlightPath();
        this.bindScrollFlight();
        this.bindZoneInteractions();
      } else {
        this.bindAmbientHover();
      }

      this.bindDroneClicks();
      this.bindMouseTracking();
    }

    // --- 1. HERO DRONE SVG DOM ELEMENT ---
    buildDroneElement() {
      if (document.getElementById('heroFlightDrone')) return;

      const container = document.createElement('div');
      container.id = 'heroFlightDrone';
      container.className = 'hero-flight-drone';
      container.title = 'AMR-PD Flight Hero (Click to Barrel Roll)';

      // Check if user has an active custom build from Studio
      const custom = window.AeroGame ? window.AeroGame.getActiveDrone() : null;
      container.innerHTML = this.getDroneSVG(custom);

      document.body.appendChild(container);
      this.droneEl = container;
    }

    getDroneSVG(custom) {
      const frameColor = (custom && custom.frameColor) ? custom.frameColor : '#00e5ff';
      const ledColor = (custom && custom.accentColor) ? custom.accentColor : '#00e676';
      const armLength = (custom && custom.armLength) ? custom.armLength : 34;

      return `
        <svg viewBox="0 0 100 100" width="100%" height="100%" class="drone-svg-model">
          <defs>
            <filter id="droneGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="propellerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#00e5ff" stop-opacity="0.3" />
            </linearGradient>
          </defs>

          <!-- Carbon Fiber Arms -->
          <g stroke="#1a2340" stroke-width="4.5" stroke-linecap="round">
            <line x1="50" y1="50" x2="${50 - armLength * 0.7}" y2="${50 - armLength * 0.7}" />
            <line x1="50" y1="50" x2="${50 + armLength * 0.7}" y2="${50 - armLength * 0.7}" />
            <line x1="50" y1="50" x2="${50 - armLength * 0.7}" y2="${50 + armLength * 0.7}" />
            <line x1="50" y1="50" x2="${50 + armLength * 0.7}" y2="${50 + armLength * 0.7}" />
            <line x1="50" y1="50" x2="${50 - armLength}" y2="50" />
            <line x1="50" y1="50" x2="${50 + armLength}" y2="50" />
          </g>

          <!-- Motor Nacelles -->
          <circle cx="${50 - armLength * 0.7}" cy="${50 - armLength * 0.7}" r="4" fill="#0f1729" stroke="${frameColor}" stroke-width="1.5" />
          <circle cx="${50 + armLength * 0.7}" cy="${50 - armLength * 0.7}" r="4" fill="#0f1729" stroke="${frameColor}" stroke-width="1.5" />
          <circle cx="${50 - armLength * 0.7}" cy="${50 + armLength * 0.7}" r="4" fill="#0f1729" stroke="${frameColor}" stroke-width="1.5" />
          <circle cx="${50 + armLength * 0.7}" cy="${50 + armLength * 0.7}" r="4" fill="#0f1729" stroke="${frameColor}" stroke-width="1.5" />
          <circle cx="${50 - armLength}" cy="50" r="4" fill="#0f1729" stroke="${frameColor}" stroke-width="1.5" />
          <circle cx="${50 + armLength}" cy="50" r="4" fill="#0f1729" stroke="${frameColor}" stroke-width="1.5" />

          <!-- Spinning Propellers -->
          <g class="propeller-spin-fast" style="transform-origin: ${50 - armLength * 0.7}px ${50 - armLength * 0.7}px;">
            <line x1="${50 - armLength * 0.7 - 12}" y1="${50 - armLength * 0.7}" x2="${50 - armLength * 0.7 + 12}" y2="${50 - armLength * 0.7}" stroke="url(#propellerGrad)" stroke-width="2.5" stroke-linecap="round" />
          </g>
          <g class="propeller-spin-fast" style="transform-origin: ${50 + armLength * 0.7}px ${50 - armLength * 0.7}px;">
            <line x1="${50 + armLength * 0.7 - 12}" y1="${50 - armLength * 0.7}" x2="${50 + armLength * 0.7 + 12}" y2="${50 - armLength * 0.7}" stroke="url(#propellerGrad)" stroke-width="2.5" stroke-linecap="round" />
          </g>
          <g class="propeller-spin-fast" style="transform-origin: ${50 - armLength * 0.7}px ${50 + armLength * 0.7}px;">
            <line x1="${50 - armLength * 0.7 - 12}" y1="${50 + armLength * 0.7}" x2="${50 - armLength * 0.7 + 12}" y2="${50 + armLength * 0.7}" stroke="url(#propellerGrad)" stroke-width="2.5" stroke-linecap="round" />
          </g>
          <g class="propeller-spin-fast" style="transform-origin: ${50 + armLength * 0.7}px ${50 + armLength * 0.7}px;">
            <line x1="${50 + armLength * 0.7 - 12}" y1="${50 + armLength * 0.7}" x2="${50 + armLength * 0.7 + 12}" y2="${50 + armLength * 0.7}" stroke="url(#propellerGrad)" stroke-width="2.5" stroke-linecap="round" />
          </g>

          <!-- Central Airframe Body -->
          <polygon points="50,30 68,40 68,60 50,70 32,60 32,40" fill="#0d172a" stroke="${frameColor}" stroke-width="2.5" />
          
          <!-- Avionics Core -->
          <circle cx="50" cy="50" r="10" fill="#050810" stroke="#00e5ff" stroke-width="1.5" />
          <circle cx="50" cy="50" r="5" fill="${ledColor}" filter="url(#droneGlow)" />

          <!-- Camera Gimbal Dome -->
          <path d="M 44,58 Q 50,68 56,58 Z" fill="#000" stroke="#00e5ff" stroke-width="1" />
          <circle cx="50" cy="61" r="2" fill="#00e5ff" />

          <!-- Navigation LEDs -->
          <circle cx="34" cy="40" r="1.8" fill="#ff1744" />
          <circle cx="66" cy="40" r="1.8" fill="#00e676" />
        </svg>
      `;
    }

    updateDroneAppearance(customConfig) {
      if (this.droneEl) {
        this.droneEl.innerHTML = this.getDroneSVG(customConfig);
      }
    }

    // --- 2. COCKPIT HUD OVERLAY ---
    buildCockpitHUD() {
      if (document.getElementById('cockpitHud')) return;

      const hud = document.createElement('div');
      hud.id = 'cockpitHud';
      hud.className = 'cockpit-hud';
      hud.innerHTML = `
        <div class="cockpit-hud-title">
          <span>AERO-HUD v4.2</span>
          <div class="cockpit-hud-status" title="Sensor Array Online"></div>
        </div>
        <div class="cockpit-telemetry-grid">
          <div class="telemetry-item">
            <span class="telemetry-label">ALT:</span>
            <span class="telemetry-val" id="hudAlt">120m</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">SPD:</span>
            <span class="telemetry-val" id="hudSpd">84km/h</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">HDG:</span>
            <span class="telemetry-val" id="hudHdg">042°</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">BATT:</span>
            <span class="telemetry-val" id="hudBatt">98%</span>
          </div>
        </div>
        <div class="cockpit-battery-track">
          <div class="cockpit-battery-fill" id="hudBattFill"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:#7e8ba6; margin-top:2px;">
          <span>GPS: <span id="hudGPS" style="color:#00e5ff;">19.049°N, 83.821°E</span></span>
          <span id="hudZoneTag" style="color:#ffd700;">ZONE 1</span>
        </div>
      `;

      document.body.appendChild(hud);
      this.hudEl = hud;
    }

    // --- 3. FLIGHT TRACKER MINI-MAP ---
    buildFlightTracker() {
      if (document.getElementById('flightTrackerMap')) return;

      const tracker = document.createElement('div');
      tracker.id = 'flightTrackerMap';
      tracker.className = 'flight-tracker-map';
      tracker.innerHTML = `
        <button class="flight-autopilot-btn" id="flightAutopilotBtn" title="Toggle Automated Cruise">AUTO-PILOT</button>
        <div class="flight-waypoint active" data-zone="1" title="Zone 1: Takeoff Pad">
          <div class="flight-waypoint-tooltip">01. Takeoff Pad</div>
        </div>
        <div class="flight-waypoint" data-zone="2" title="Zone 2: Sky Cruise">
          <div class="flight-waypoint-tooltip">02. Sky Cruise</div>
        </div>
        <div class="flight-waypoint" data-zone="3" title="Zone 3: City Flyover">
          <div class="flight-waypoint-tooltip">03. Dual-Use Flyover</div>
        </div>
        <div class="flight-waypoint" data-zone="4" title="Zone 4: Tunnel Dive">
          <div class="flight-waypoint-tooltip">04. Portal Dive</div>
        </div>
        <div class="flight-waypoint" data-zone="5" title="Zone 5: Night Recon">
          <div class="flight-waypoint-tooltip">05. Night FLIR Ops</div>
        </div>
        <div class="flight-waypoint" data-zone="6" title="Zone 6: Touchdown">
          <div class="flight-waypoint-tooltip">06. Landing Pad</div>
        </div>
      `;

      document.body.appendChild(tracker);
      this.trackerEl = tracker;

      // Waypoint click to navigate
      tracker.querySelectorAll('.flight-waypoint').forEach(wp => {
        wp.addEventListener('click', () => {
          const zoneNum = wp.getAttribute('data-zone');
          this.navigateToZone(parseInt(zoneNum));
        });
      });

      // Auto-pilot toggle
      const autoBtn = tracker.querySelector('#flightAutopilotBtn');
      if (autoBtn) {
        autoBtn.addEventListener('click', () => this.toggleAutoPilot());
      }
    }

    // --- 4. SEARCHLIGHT CONE FOR NIGHT RECON ---
    buildSearchlight() {
      if (document.getElementById('searchlightCone')) return;
      const cone = document.createElement('div');
      cone.id = 'searchlightCone';
      cone.className = 'searchlight-cone';
      document.body.appendChild(cone);
      this.searchlightEl = cone;
    }

    // --- 5. DYNAMIC SVG FLIGHT MOTION PATH ---
    generateFlightPath() {
      const container = document.createElement('div');
      container.className = 'flight-journey-container';
      container.innerHTML = `
        <svg id="flight-motion-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flightTrailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.8" />
              <stop offset="50%" stop-color="#ff6b35" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#00e676" stop-opacity="0.9" />
            </linearGradient>
          </defs>
          <path id="flightMotionPath" class="flight-motion-path" d="" />
          <path id="flightTrailPath" class="flight-trail-ribbon" d="" />
        </svg>
      `;
      document.body.appendChild(container);

      this.updateMotionPathGeometry();
      window.addEventListener('resize', () => this.updateMotionPathGeometry());
    }

    updateMotionPathGeometry() {
      const pathEl = document.getElementById('flightMotionPath');
      const trailEl = document.getElementById('flightTrailPath');
      if (!pathEl) return;

      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const width = window.innerWidth;

      // S-curves down through the 6 zones
      const d = `
        M ${width * 0.5} 320
        C ${width * 0.75} ${docHeight * 0.08}, ${width * 0.85} ${docHeight * 0.16}, ${width * 0.65} ${docHeight * 0.24}
        C ${width * 0.25} ${docHeight * 0.32}, ${width * 0.15} ${docHeight * 0.40}, ${width * 0.45} ${docHeight * 0.48}
        C ${width * 0.85} ${docHeight * 0.56}, ${width * 0.75} ${docHeight * 0.65}, ${width * 0.35} ${docHeight * 0.74}
        C ${width * 0.15} ${docHeight * 0.82}, ${width * 0.40} ${docHeight * 0.90}, ${width * 0.50} ${docHeight - 450}
      `;

      pathEl.setAttribute('d', d);
      if (trailEl) trailEl.setAttribute('d', d);
    }

    // --- 6. SCROLLTRIGGER FLIGHT BINDING ---
    bindScrollFlight() {
      const drone = this.droneEl;
      const path = '#flightMotionPath';

      // Initial placement at top
      gsap.set(drone, { xPercent: -50, yPercent: -50 });

      // Continuous scrub flight along SVG motion path
      const flightTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          onUpdate: (self) => this.onFlightScrub(self)
        }
      });

      flightTimeline.to(drone, {
        motionPath: {
          path: path,
          align: path,
          autoRotate: true,
          alignOrigin: [0.5, 0.5]
        },
        ease: 'none'
      });
    }

    onFlightScrub(self) {
      const progress = self.progress; // 0.0 to 1.0

      // Telemetry calculations
      const altEl = document.getElementById('hudAlt');
      const spdEl = document.getElementById('hudSpd');
      const hdgEl = document.getElementById('hudHdg');
      const battEl = document.getElementById('hudBatt');
      const battFill = document.getElementById('hudBattFill');
      const gpsEl = document.getElementById('hudGPS');
      const zoneTag = document.getElementById('hudZoneTag');

      // Zone determination (1 to 6)
      const zone = Math.min(6, Math.floor(progress * 6) + 1);
      if (zone !== this.currentZone) {
        this.currentZone = zone;
        this.updateActiveWaypoint(zone);
        if (zoneTag) zoneTag.textContent = `ZONE ${zone}`;
      }

      // Altitude (peaks in zone 2/3, drops in zone 6)
      let alt = Math.floor(Math.sin(progress * Math.PI) * 420);
      if (progress > 0.94) alt = Math.max(0, Math.floor((1 - progress) * 120));
      if (altEl) altEl.textContent = `${alt}m`;

      // Speed (km/h)
      const spd = Math.floor(60 + Math.sin(progress * Math.PI * 2) * 55);
      if (spdEl) spdEl.textContent = `${spd}km/h`;

      // Heading (degrees derived from progress)
      const hdg = Math.floor((progress * 720) % 360);
      if (hdgEl) hdgEl.textContent = `${String(hdg).padStart(3, '0')}°`;

      // Battery depletion
      const batt = Math.max(68, Math.floor(100 - progress * 32));
      if (battEl) battEl.textContent = `${batt}%`;
      if (battFill) battFill.style.width = `${batt}%`;

      // GPS Coordinates shift
      const lat = (this.baseLat + progress * 0.018).toFixed(4);
      const lng = (this.baseLng + progress * 0.024).toFixed(4);
      if (gpsEl) gpsEl.textContent = `${lat}°N, ${lng}°E`;

      // Searchlight sync in Night Zone (Zone 5, progress approx 0.65 - 0.85)
      if (this.searchlightEl && this.droneEl) {
        const rect = this.droneEl.getBoundingClientRect();
        this.searchlightEl.style.left = `${rect.left + rect.width / 2}px`;
        this.searchlightEl.style.top = `${rect.top + rect.height / 2}px`;
        if (zone === 5) {
          this.searchlightEl.classList.add('active');
        } else {
          this.searchlightEl.classList.remove('active');
        }
      }

      // Touchdown detection
      if (progress >= 0.97 && window.AeroGame) {
        window.AeroGame.unlockBadge('PRECISION_LAND');
        window.AeroGame.updateMission('m_flight', 6);
      }
    }

    // --- 7. ZONE SPECIFIC INTERACTION TRIGGERS ---
    bindZoneInteractions() {
      // Zone 2 Jet-Wash Headlines
      document.querySelectorAll('.jet-wash-target').forEach(target => {
        ScrollTrigger.create({
          trigger: target,
          start: 'top 70%',
          onEnter: () => {
            gsap.fromTo(target, 
              { opacity: 0.2, filter: 'blur(8px)', x: -20 },
              { opacity: 1, filter: 'blur(0px)', x: 0, duration: 0.8, ease: 'power2.out' }
            );
          }
        });
      });

      // Zone 3 Laser Scanner Line
      const flyoverSection = document.querySelector('.flight-zone-flyover');
      if (flyoverSection) {
        ScrollTrigger.create({
          trigger: flyoverSection,
          start: 'top 60%',
          onEnter: () => {
            const scanner = flyoverSection.querySelector('.laser-scan-line');
            if (scanner) {
              gsap.fromTo(scanner, 
                { opacity: 1, top: '0%' },
                { top: '100%', duration: 2.5, ease: 'power1.inOut', onComplete: () => { scanner.style.opacity = '0'; } }
              );
            }
          }
        });
      }
    }

    // --- 8. WAYPOINT NAVIGATION & AUTO-PILOT ---
    navigateToZone(zoneNum) {
      const zoneEls = [
        document.querySelector('.flight-zone-takeoff') || document.body,
        document.querySelector('.flight-zone-cruise'),
        document.querySelector('.flight-zone-flyover'),
        document.querySelector('.flight-zone-portal'),
        document.querySelector('.flight-zone-night'),
        document.querySelector('.flight-zone-landing') || document.getElementById('contact')
      ];

      const targetEl = zoneEls[zoneNum - 1];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        this.updateActiveWaypoint(zoneNum);
      }
    }

    updateActiveWaypoint(zoneNum) {
      if (!this.trackerEl) return;
      this.trackerEl.querySelectorAll('.flight-waypoint').forEach(wp => {
        wp.classList.toggle('active', parseInt(wp.getAttribute('data-zone')) === zoneNum);
      });
      if (window.AeroGame) {
        window.AeroGame.updateMission('m_flight', Math.max(zoneNum, window.AeroGame.state.missions.find(m => m.id === 'm_flight')?.progress || 0));
      }
    }

    toggleAutoPilot() {
      const btn = document.getElementById('flightAutopilotBtn');
      if (this.isAutoPilot) {
        this.stopAutoPilot();
      } else {
        this.startAutoPilot();
      }
    }

    startAutoPilot() {
      this.isAutoPilot = true;
      const btn = document.getElementById('flightAutopilotBtn');
      if (btn) {
        btn.classList.add('active');
        btn.textContent = 'PAUSE';
      }

      if (window.AeroGame) {
        window.AeroGame.unlockBadge('AUTOPILOT_ACE');
        window.AeroGame.spawnFloatText('AUTO-PILOT ACTIVE: HANDS-FREE CRUISE', 'xp');
      }

      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const remainingDistance = maxScroll - currentScroll;
      const duration = Math.max(8, (remainingDistance / maxScroll) * 28);

      this.autoPilotTween = gsap.to(window, {
        scrollTo: { y: maxScroll, autoKill: true },
        duration: duration,
        ease: 'power1.inOut',
        onComplete: () => this.stopAutoPilot()
      });
    }

    stopAutoPilot() {
      this.isAutoPilot = false;
      const btn = document.getElementById('flightAutopilotBtn');
      if (btn) {
        btn.classList.remove('active');
        btn.textContent = 'AUTO-PILOT';
      }
      if (this.autoPilotTween) {
        this.autoPilotTween.kill();
        this.autoPilotTween = null;
      }
    }

    // --- 9. MOUSE TRACKING & BARREL ROLL ---
    bindDroneClicks() {
      if (!this.droneEl) return;
      this.droneEl.addEventListener('click', () => {
        this.droneEl.classList.remove('barrel-rolling');
        void this.droneEl.offsetWidth; // Trigger reflow
        this.droneEl.classList.add('barrel-rolling');

        if (window.AeroGame) {
          window.AeroGame.audio.barrelRoll();
          window.AeroGame.unlockBadge('BARREL_ROLL');
          window.AeroGame.spawnFloatText('BARREL ROLL: +50 XP!', 'xp');
          window.AeroGame.addXP(50, false);
        }

        setTimeout(() => this.droneEl.classList.remove('barrel-rolling'), 900);
      });
    }

    bindMouseTracking() {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      // Subtle tilt toward cursor
      gsap.ticker.add(() => {
        if (!this.droneEl || this.droneEl.classList.contains('barrel-rolling')) return;
        const rect = this.droneEl.getBoundingClientRect();
        const droneCenterX = rect.left + rect.width / 2;
        const droneCenterY = rect.top + rect.height / 2;

        const deltaX = (mouseX - droneCenterX) * 0.04;
        const deltaY = (mouseY - droneCenterY) * 0.04;

        gsap.to(this.droneEl, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      });
    }

    // Ambient hover for secondary pages (About, Services, Pricing, Showreel, FAQ, Contact)
    bindAmbientHover() {
      if (!this.droneEl) return;
      gsap.set(this.droneEl, { right: 40, bottom: 40, top: 'auto', left: 'auto', position: 'fixed' });
      gsap.to(this.droneEl, {
        y: -18,
        repeat: -1,
        yoyo: true,
        duration: 2.2,
        ease: 'sine.inOut'
      });
    }
  }

  // Instantiate and expose globally
  window.HeroFlightEngine = new FlightJourneyEngine();

})();
