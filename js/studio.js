/* ==========================================================================
   DRWEB AERO / AMR-PD — CUSTOM DRONE STUDIO ENGINE (studio.js)
   Interactive 3D/SVG Drone Builder, Stats Radar, Paint Mode, Hangar & PNG Export
   ========================================================================== */

(function () {
  'use strict';

  // --- COMPONENT CONFIGURATION MATRIX ---
  const CONFIG = {
    bodies: {
      hexacopter: { name: 'Hexacopter Alpha', arms: 6, weight: 6, speed: 75, stability: 90, payload: 85, battery: 70 },
      quad: { name: 'Quad Stealth', arms: 4, weight: 3.5, speed: 95, stability: 65, payload: 55, battery: 85 },
      octocopter: { name: 'Titan Octocopter', arms: 8, weight: 9.5, speed: 60, stability: 98, payload: 98, battery: 60 },
      vtol: { name: 'VTOL Hybrid Airframe', arms: 4, weight: 7.0, speed: 92, stability: 80, payload: 75, battery: 92 }
    },
    colors: {
      '#0d172a': { name: 'Carbon Black', class: 'c-carbon' },
      '#00e5ff': { name: 'Electric Cyan', class: 'c-cyan' },
      '#ff6b35': { name: 'Solar Orange', class: 'c-orange' },
      '#e2e8f0': { name: 'Arctic White', class: 'c-white' },
      '#2e7d32': { name: 'Military Camo', class: 'c-green' }
    },
    leds: {
      '#00e5ff': 'Cyan Pulse',
      '#ff1744': 'Crimson Alert',
      '#00e676': 'Beacon Green',
      '#ffd700': 'Golden Amber',
      '#b388ff': 'Ultraviolet'
    },
    propellers: {
      '2blade': { name: '2-Blade Aero (Stealth)', speedBonus: 10, batBonus: 5, stabBonus: -5 },
      '3blade': { name: '3-Blade FOC (Balanced)', speedBonus: 0, batBonus: 0, stabBonus: 10 },
      '4blade': { name: '4-Blade Heavy (Max Thrust)', speedBonus: -10, batBonus: -8, stabBonus: 20 }
    },
    cameras: {
      thermal: { name: 'FLIR Radiometric Thermal (640p)', camBonus: 90, weight: 1.5 },
      optical: { name: '4K Optical 30x Zoom Gimbal', camBonus: 85, weight: 1.2 },
      lidar: { name: '360° Solid-State LiDAR Mapper', camBonus: 98, weight: 2.2 },
      none: { name: 'None / Pure Cargo Transport', camBonus: 10, weight: 0 }
    },
    payloads: {
      winch: { name: 'Motorized Flood Winch System', payBonus: 20, batBonus: -5 },
      cargo: { name: 'AeroCargo Rigid B2B Pod', payBonus: 15, batBonus: 0 },
      medikool: { name: 'MediKool Thermo CryoBox', payBonus: 15, batBonus: -8 },
      none: { name: 'No Underbelly Payload', payBonus: 0, batBonus: 10 }
    },
    trails: ['sparkle', 'smoke', 'rainbow', 'neon', 'none']
  };

  // Default Drone State
  const DEFAULT_BUILD = {
    name: 'AMR-PD PROTOTYPE',
    body: 'hexacopter',
    frameColor: '#0d172a',
    accentColor: '#00e5ff',
    ledColor: '#00e5ff',
    propType: '3blade',
    camera: 'thermal',
    payload: 'winch',
    armLength: 'standard', // compact, standard, extended
    trail: 'neon',
    decal: 'none'
  };

  class StudioManager {
    constructor() {
      this.currentBuild = { ...DEFAULT_BUILD };
      this.history = [];
      this.future = [];
      this.paintMode = false;
      this.activeColor = '#00e5ff';
      this.init();
    }

    init() {
      this.loadFromHash();
      this.bindControls();
      this.render();
      this.renderHangarList();
      this.renderCommunityGallery();
    }

    loadFromHash() {
      if (location.hash && location.hash.startsWith('#build=')) {
        try {
          const raw = atob(decodeURIComponent(location.hash.replace('#build=', '')));
          this.currentBuild = JSON.parse(raw);
        } catch (e) {
          console.warn('Could not decode shared build URL');
        }
      }
    }

    pushState() {
      this.history.push(JSON.stringify(this.currentBuild));
      if (this.history.length > 20) this.history.shift();
      this.future = [];
    }

    undo() {
      if (!this.history.length) return;
      this.future.push(JSON.stringify(this.currentBuild));
      this.currentBuild = JSON.parse(this.history.pop());
      this.render();
    }

    redo() {
      if (!this.future.length) return;
      this.history.push(JSON.stringify(this.currentBuild));
      this.currentBuild = JSON.parse(this.future.pop());
      this.render();
    }

    calculateStats() {
      const b = CONFIG.bodies[this.currentBuild.body] || CONFIG.bodies.hexacopter;
      const p = CONFIG.propellers[this.currentBuild.propType] || CONFIG.propellers['3blade'];
      const c = CONFIG.cameras[this.currentBuild.camera] || CONFIG.cameras.none;
      const pl = CONFIG.payloads[this.currentBuild.payload] || CONFIG.payloads.none;

      let speed = Math.max(10, Math.min(100, b.speed + p.speedBonus - (pl.payBonus > 0 ? 8 : 0)));
      let battery = Math.max(10, Math.min(100, b.battery + p.batBonus + pl.batBonus));
      let stability = Math.max(10, Math.min(100, b.stability + p.stabBonus));
      let cameraQual = Math.max(10, Math.min(100, c.camBonus));
      let payloadCap = Math.max(10, Math.min(100, b.payload + pl.payBonus));

      if (this.currentBuild.armLength === 'compact') {
        speed += 6; stability -= 8;
      } else if (this.currentBuild.armLength === 'extended') {
        speed -= 6; stability += 10;
      }

      return { speed, battery, stability, cameraQual, payloadCap };
    }

    render() {
      this.renderSVG();
      this.renderStats();
      this.syncFormControls();
      this.checkSpecialAchievements();
    }

    renderSVG() {
      const svg = document.getElementById('studioDroneSVG');
      if (!svg) return;

      const { body, frameColor, accentColor, ledColor, propType, camera, payload, name } = this.currentBuild;
      const armLengthMultiplier = this.currentBuild.armLength === 'compact' ? 0.8 : (this.currentBuild.armLength === 'extended' ? 1.25 : 1.0);

      let armsSVG = '';
      const armAngles = body === 'quad' ? [45, 135, 225, 315] :
                        body === 'octocopter' ? [0, 45, 90, 135, 180, 225, 270, 315] :
                        [30, 90, 150, 210, 270, 330]; // Hexacopter

      const radius = 130 * armLengthMultiplier;

      armAngles.forEach(deg => {
        const rad = deg * (Math.PI / 180);
        const x = 250 + Math.cos(rad) * radius;
        const y = 250 + Math.sin(rad) * radius;

        // Arm tube
        armsSVG += `<line x1="250" y1="250" x2="${x}" y2="${y}" stroke="${frameColor}" stroke-width="12" stroke-linecap="round"/>`;
        armsSVG += `<line x1="250" y1="250" x2="${x}" y2="${y}" stroke="${accentColor}" stroke-width="2" stroke-dasharray="4 6"/>`;

        // Motor pod
        armsSVG += `<circle cx="${x}" cy="${y}" r="16" fill="${frameColor}" stroke="${accentColor}" stroke-width="3" class="paintable-zone" data-zone="motor"/>`;

        // Propeller
        const blades = propType === '4blade' ? 4 : (propType === '2blade' ? 2 : 3);
        armsSVG += `<g class="prop-spin" style="transform-origin: ${x}px ${y}px;">
          <ellipse cx="${x}" cy="${y}" rx="46" ry="11" fill="rgba(0,229,255,0.12)" stroke="${accentColor}" stroke-width="2"/>
          ${blades >= 3 ? `<ellipse cx="${x}" cy="${y}" rx="11" ry="46" fill="rgba(0,229,255,0.12)" stroke="${accentColor}" stroke-width="2"/>` : ''}
        </g>`;

        // LED tip
        armsSVG += `<circle cx="${x}" cy="${y}" r="4" fill="${ledColor}" class="led-blink"/>`;
      });

      // Central Hull / Chassis
      let hullShape = '';
      if (body === 'vtol') {
        hullShape = `
          <!-- VTOL Wings -->
          <polygon points="250,180 390,260 250,230" fill="${frameColor}" stroke="${accentColor}" stroke-width="2"/>
          <polygon points="250,180 110,260 250,230" fill="${frameColor}" stroke="${accentColor}" stroke-width="2"/>
          <polygon points="250,150 280,250 250,270 220,250" fill="${frameColor}" stroke="${accentColor}" stroke-width="3"/>
        `;
      } else {
        hullShape = `
          <polygon points="250,180 310,215 310,285 250,320 190,285 190,215" fill="${frameColor}" stroke="${accentColor}" stroke-width="3" class="paintable-zone" data-zone="hull"/>
          <circle cx="250" cy="250" r="38" fill="#050810" stroke="${accentColor}" stroke-width="2"/>
        `;
      }

      // Camera Gimbal
      let camSVG = '';
      if (camera === 'thermal') {
        camSVG = `<circle cx="250" cy="335" r="14" fill="#000" stroke="${accentColor}" stroke-width="2"/>
                  <circle cx="250" cy="335" r="7" fill="#ff1744"/>`;
      } else if (camera === 'optical') {
        camSVG = `<rect x="238" y="325" width="24" height="24" rx="4" fill="#141c33" stroke="${accentColor}" stroke-width="2"/>
                  <circle cx="250" cy="337" r="6" fill="#00e5ff"/>`;
      } else if (camera === 'lidar') {
        camSVG = `<polygon points="250,320 268,345 232,345" fill="#141c33" stroke="#ffd700" stroke-width="2"/>
                  <line x1="250" y1="320" x2="250" y2="310" stroke="#ffd700" stroke-width="2"/>`;
      }

      // Payload Rail / Pod
      let payloadSVG = '';
      if (payload === 'winch') {
        payloadSVG = `<rect x="230" y="275" width="40" height="18" rx="4" fill="#ff6b35" opacity="0.9"/>
                      <line x1="250" y1="293" x2="250" y2="310" stroke="#fff" stroke-width="1.5" stroke-dasharray="2 2"/>
                      <circle cx="250" cy="312" r="3" fill="#ff6b35"/>`;
      } else if (payload === 'cargo') {
        payloadSVG = `<rect x="220" y="270" width="60" height="25" rx="6" fill="#1e293b" stroke="${accentColor}" stroke-width="2"/>
                      <text x="250" y="286" font-size="8" fill="#fff" text-anchor="middle" font-weight="bold">CARGO</text>`;
      } else if (payload === 'medikool') {
        payloadSVG = `<rect x="225" y="270" width="50" height="25" rx="6" fill="#00e676" opacity="0.9"/>
                      <text x="250" y="286" font-size="9" fill="#050810" text-anchor="middle" font-weight="bold">+ MED</text>`;
      }

      // Name Plate
      const namePlate = `<text x="250" y="247" font-family="'JetBrains Mono', monospace" font-size="9" fill="${accentColor}" text-anchor="middle" font-weight="bold" letter-spacing="1">${name.toUpperCase()}</text>
                         <text x="250" y="258" font-family="'JetBrains Mono', monospace" font-size="7" fill="#7e8ba6" text-anchor="middle">AMR-PD</text>`;

      svg.innerHTML = `
        <g id="droneAssembly">
          ${armsSVG}
          ${hullShape}
          ${camSVG}
          ${payloadSVG}
          ${namePlate}
        </g>
      `;

      if (this.paintMode) this.attachPaintEvents();
    }

    renderStats() {
      const stats = this.calculateStats();

      // Progress bars
      const setBar = (id, val) => {
        const el = document.getElementById(id);
        const text = document.getElementById(`${id}Val`);
        if (el) el.style.width = `${val}%`;
        if (text) text.textContent = `${Math.round(val)}%`;
      };
      setBar('statSpeed', stats.speed);
      setBar('statBattery', stats.battery);
      setBar('statStability', stats.stability);
      setBar('statCamera', stats.cameraQual);
      setBar('statPayload', stats.payloadCap);

      // SVG Radar Chart (Pentagon)
      const radar = document.getElementById('statsRadarPolygon');
      if (radar) {
        const cx = 100, cy = 100, maxR = 80;
        const vals = [stats.speed, stats.battery, stats.stability, stats.cameraQual, stats.payloadCap];
        const points = vals.map((v, i) => {
          const angle = (i * 72 - 90) * (Math.PI / 180);
          const r = (v / 100) * maxR;
          return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
        }).join(' ');
        radar.setAttribute('points', points);
      }
    }

    syncFormControls() {
      const nameInput = document.getElementById('droneNameInput');
      if (nameInput) nameInput.value = this.currentBuild.name;
    }

    bindControls() {
      // Body selection
      document.querySelectorAll('[data-opt-body]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pushState();
          this.currentBuild.body = btn.getAttribute('data-opt-body');
          this.render();
        });
      });

      // Color selection
      document.querySelectorAll('[data-opt-color]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pushState();
          const col = btn.getAttribute('data-opt-color');
          this.activeColor = col;
          this.currentBuild.frameColor = col;
          this.render();
        });
      });

      // Accent color
      document.querySelectorAll('[data-opt-accent]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pushState();
          this.currentBuild.accentColor = btn.getAttribute('data-opt-accent');
          this.render();
        });
      });

      // LED color
      document.querySelectorAll('[data-opt-led]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pushState();
          this.currentBuild.ledColor = btn.getAttribute('data-opt-led');
          this.render();
        });
      });

      // Prop type
      document.querySelectorAll('[data-opt-prop]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pushState();
          this.currentBuild.propType = btn.getAttribute('data-opt-prop');
          this.render();
        });
      });

      // Camera type
      document.querySelectorAll('[data-opt-cam]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pushState();
          this.currentBuild.camera = btn.getAttribute('data-opt-cam');
          this.render();
        });
      });

      // Payload type
      document.querySelectorAll('[data-opt-payload]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pushState();
          this.currentBuild.payload = btn.getAttribute('data-opt-payload');
          this.render();
        });
      });

      // Arm Length
      document.querySelectorAll('[data-opt-arms]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pushState();
          this.currentBuild.armLength = btn.getAttribute('data-opt-arms');
          this.render();
        });
      });

      // Name input
      const nameInput = document.getElementById('droneNameInput');
      if (nameInput) {
        nameInput.addEventListener('input', (e) => {
          this.currentBuild.name = e.target.value.substring(0, 16) || 'AMR-PD';
          this.renderSVG();
        });
      }

      // Actions: Randomize, Reset, Undo, Redo
      const randBtn = document.getElementById('randomizeBtn');
      if (randBtn) randBtn.addEventListener('click', () => this.randomize());

      const resetBtn = document.getElementById('resetBtn');
      if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

      const undoBtn = document.getElementById('undoBtn');
      if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

      const redoBtn = document.getElementById('redoBtn');
      if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

      // Save to Hangar
      const saveBtn = document.getElementById('saveToHangarBtn');
      if (saveBtn) saveBtn.addEventListener('click', () => this.saveToHangar());

      // Share Link
      const shareBtn = document.getElementById('shareBuildBtn');
      if (shareBtn) shareBtn.addEventListener('click', () => this.copyShareLink());

      // Export PNG
      const exportBtn = document.getElementById('exportPngBtn');
      if (exportBtn) exportBtn.addEventListener('click', () => this.exportPNG());

      // Test Flight Simulator
      const testFlightBtn = document.getElementById('testFlightBtn');
      if (testFlightBtn) testFlightBtn.addEventListener('click', () => this.startTestFlight());

      // Fly My Drone across site-wide journey
      const flyMyDroneBtn = document.getElementById('flyMyDroneBtn');
      if (flyMyDroneBtn) flyMyDroneBtn.addEventListener('click', () => this.flyMyDrone());
    }

    flyMyDrone() {
      if (window.AeroGame) {
        window.AeroGame.setActiveDrone(this.currentBuild);
        window.AeroGame.audio.coin();
        window.AeroGame.unlockBadge('FLY_MY_DRONE');
        alert(`"${this.currentBuild.name}" has been deployed as your Hero Drone across the website flight journey!`);
      }
    }

    randomize() {
      this.pushState();
      const bodyKeys = Object.keys(CONFIG.bodies);
      const colorKeys = Object.keys(CONFIG.colors);
      const ledKeys = Object.keys(CONFIG.leds);
      const propKeys = Object.keys(CONFIG.propellers);
      const camKeys = Object.keys(CONFIG.cameras);
      const payKeys = Object.keys(CONFIG.payloads);

      this.currentBuild.body = bodyKeys[Math.floor(Math.random() * bodyKeys.length)];
      this.currentBuild.frameColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      this.currentBuild.accentColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      this.currentBuild.ledColor = ledKeys[Math.floor(Math.random() * ledKeys.length)];
      this.currentBuild.propType = propKeys[Math.floor(Math.random() * propKeys.length)];
      this.currentBuild.camera = camKeys[Math.floor(Math.random() * camKeys.length)];
      this.currentBuild.payload = payKeys[Math.floor(Math.random() * payKeys.length)];
      this.currentBuild.armLength = ['compact', 'standard', 'extended'][Math.floor(Math.random() * 3)];

      this.render();
      if (window.AeroGame) window.AeroGame.audio.click();
    }

    reset() {
      this.pushState();
      this.currentBuild = { ...DEFAULT_BUILD };
      this.render();
    }

    attachPaintEvents() {
      document.querySelectorAll('.paintable-zone').forEach(el => {
        el.style.cursor = 'crosshair';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.pushState();
          const zone = el.getAttribute('data-zone');
          if (zone === 'hull') this.currentBuild.frameColor = this.activeColor;
          if (zone === 'motor') this.currentBuild.accentColor = this.activeColor;
          this.render();
          if (window.AeroGame) window.AeroGame.audio.click();
        });
      });
    }

    saveToHangar() {
      if (!window.AeroGame) return;
      let hangar = window.AeroGame.state.hangar || [];

      if (hangar.length >= 6) {
        alert('Your Hangar is at maximum capacity (6 builds). Remove one before storing another.');
        return;
      }

      const saveItem = {
        ...this.currentBuild,
        id: 'build_' + Date.now(),
        date: new Date().toLocaleDateString()
      };
      hangar.push(saveItem);
      window.AeroGame.state.hangar = hangar;
      window.AeroGame.save();

      window.AeroGame.addXP(120);
      window.AeroGame.addCoins(80);
      window.AeroGame.unlockBadge('STUDIO_CREATOR');
      window.AeroGame.updateMission('m_studio', 1);

      if (hangar.length >= 3) {
        window.AeroGame.unlockBadge('THREE_BUILDS');
      }

      this.renderHangarList();
      alert(`"${saveItem.name}" safely stored in your Hangar! +120 XP & +80 Coins!`);
    }

    renderHangarList() {
      const container = document.getElementById('hangarGrid');
      if (!container || !window.AeroGame) return;

      const hangar = window.AeroGame.state.hangar || [];
      if (!hangar.length) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#7e8ba6; padding:2rem;">Your hangar is currently empty. Design and save a custom drone to deploy it into mission sorties!</div>`;
        return;
      }

      container.innerHTML = hangar.map(item => `
        <div class="card" style="padding:1.25rem;">
          <div style="font-weight:700; color:#fff; font-size:1rem; margin-bottom:4px;">${item.name}</div>
          <div style="font-size:0.75rem; color:#00e5ff; font-family:var(--ff-mono); margin-bottom:8px;">${item.body.toUpperCase()} • ${item.date}</div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn--outline" style="padding:4px 10px; font-size:0.75rem;" onclick="window.Studio.loadHangarBuild('${item.id}')">Load</button>
            <button class="btn btn--outline" style="padding:4px 10px; font-size:0.75rem; color:#ff1744;" onclick="window.Studio.deleteHangarBuild('${item.id}')">Scrap</button>
          </div>
        </div>
      `).join('');
    }

    loadHangarBuild(id) {
      const item = window.AeroGame.state.hangar.find(x => x.id === id);
      if (item) {
        this.pushState();
        this.currentBuild = { ...item };
        this.render();
      }
    }

    deleteHangarBuild(id) {
      if (confirm('Scrap this airframe build from your hangar?')) {
        window.AeroGame.state.hangar = window.AeroGame.state.hangar.filter(x => x.id !== id);
        window.AeroGame.save();
        this.renderHangarList();
      }
    }

    copyShareLink() {
      const encoded = btoa(JSON.stringify(this.currentBuild));
      const url = `${location.origin}${location.pathname}#build=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Shareable Drone Build link copied to clipboard!');
      }).catch(() => {
        prompt('Copy your custom build link:', url);
      });
    }

    exportPNG() {
      const svg = document.getElementById('studioDroneSVG');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 0, 0, 1000, 1000);
        const a = document.createElement('a');
        a.download = `${this.currentBuild.name.toLowerCase().replace(/\s+/g, '_')}_spec.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    startTestFlight() {
      const wrap = document.getElementById('studioPreviewContainer');
      if (!wrap) return;

      wrap.style.transition = 'transform 1.8s cubic-bezier(0.25, 1, 0.5, 1)';
      wrap.style.transform = 'translateY(-120px) scale(0.65) rotate(15deg)';
      if (window.AeroGame) window.AeroGame.audio.drop();

      setTimeout(() => {
        wrap.style.transform = 'translateY(40px) scale(1.1) rotate(-8deg)';
      }, 700);

      setTimeout(() => {
        wrap.style.transform = 'none';
      }, 1600);
    }

    checkSpecialAchievements() {
      if (!window.AeroGame) return;
      const stats = this.calculateStats();
      if (stats.speed >= 70 && stats.battery >= 70 && stats.stability >= 70) {
        window.AeroGame.unlockBadge('PERFECT_BALANCE');
      }
      if (this.currentBuild.body === 'vtol' && this.currentBuild.camera === 'lidar' && this.currentBuild.trail === 'neon') {
        window.AeroGame.unlockBadge('RARE_COMBO');
      }
    }

    renderCommunityGallery() {
      const container = document.getElementById('communityGallery');
      if (!container) return;

      const communityDrones = [
        { name: 'Mahanadi Flood Seeker', author: 'Pilot Anshuman', body: 'Hexacopter Alpha', likes: 142 },
        { name: 'PharmaExpress Cryo', author: 'Dr. S. Mohanty', body: 'Quad Stealth', likes: 98 },
        { name: 'Rayagada Mountain Titan', author: 'Siddharth N.', body: 'Titan Octocopter', likes: 184 },
        { name: 'Coastal Recon VTOL', author: 'Ritika M.', body: 'VTOL Hybrid', likes: 231 },
        { name: 'Apex Sentinel Interceptor', author: 'Cmdr. Vikram', body: 'Quad Stealth', likes: 310 },
        { name: 'Cyclone Lifeline Heavy', author: 'Odisha SDMA Team', body: 'Titan Octocopter', likes: 275 },
        { name: 'Kalinganagar Industrial Surveyor', author: 'Tata Steel Logistics', body: 'Hexacopter Alpha', likes: 165 },
        { name: 'Deep Forest LiDAR Explorer', author: 'Forestry GIS Wing', body: 'VTOL Hybrid', likes: 195 }
      ];

      container.innerHTML = communityDrones.map(d => `
        <div class="card" style="padding:1.5rem;">
          <div style="font-weight:700; color:#fff; font-size:1.1rem; margin-bottom:4px;">${d.name}</div>
          <div style="font-size:0.8rem; color:#00e5ff; font-family:var(--ff-mono); margin-bottom:8px;">${d.body} &bull; By ${d.author}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
            <button class="btn btn--outline" style="padding:4px 12px; font-size:0.75rem;" onclick="alert('Configuration cloned into active Studio bench!')">Clone Spec</button>
            <span style="font-size:0.85rem; color:#ffd700;">❤️ ${d.likes}</span>
          </div>
        </div>
      `).join('');
    }
  }

  window.Studio = new StudioManager();

})();
