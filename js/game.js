/* ==========================================================================
   DRWEB AERO / AMR-PD — CENTRAL GAMIFICATION & FLIGHT STATE ENGINE (game.js)
   Manages XP, Levels, Coins, Quests, Badges, Audio Synth, Active Custom Drone,
   Pilot Onboarding License, Scavenger Hunt, and Persistent Site HUD.
   ========================================================================== */

(function () {
  'use strict';

  // --- 10 PILOT RANKS & XP REQUIREMENTS ---
  const RANKS = [
    { level: 1, name: 'Rookie Pilot', xpReq: 0 },
    { level: 2, name: 'Flight Cadet', xpReq: 150 },
    { level: 3, name: 'Junior Aviator', xpReq: 350 },
    { level: 4, name: 'BVLOS Pilot', xpReq: 650 },
    { level: 5, name: 'Flight Officer', xpReq: 1100 },
    { level: 6, name: 'Squadron Leader', xpReq: 1700 },
    { level: 7, name: 'Wing Commander', xpReq: 2500 },
    { level: 8, name: 'Aerial Ace', xpReq: 3500 },
    { level: 9, name: 'Master Aviator', xpReq: 5000 },
    { level: 10, name: 'Sky Legend', xpReq: 7000 }
  ];

  // --- 22 SITE-WIDE ACHIEVEMENTS ---
  const BADGES = {
    FIRST_STEPS: { id: 'FIRST_STEPS', title: 'First Lift-Off', icon: '🛩️', tier: 'common', desc: 'Boarded the DRWEB AERO dual-use platform.' },
    PAGE_HOPPER: { id: 'PAGE_HOPPER', title: 'Scout Navigator', icon: '🗺️', tier: 'common', desc: 'Explored 3 distinct operational flight sectors.' },
    FLIGHT_JOURNEY: { id: 'FLIGHT_JOURNEY', title: 'Sonic Cruiser', icon: '⚡', tier: 'common', desc: 'Navigated the hero drone through all 6 flight zones.' },
    BARREL_ROLL: { id: 'BARREL_ROLL', title: 'Aerobatic Ace', icon: '🔄', tier: 'common', desc: 'Executed a 360-degree high-G barrel roll trick.' },
    RADIO_CHECK: { id: 'RADIO_CHECK', title: 'Radio Check', icon: '🔊', tier: 'common', desc: 'Engaged the Web Audio telemetry synthesizer.' },
    FLIR_SCAN: { id: 'FLIR_SCAN', title: 'FLIR Certified', icon: '🕶️', tier: 'common', desc: 'Toggled optical / thermal telemetry feed.' },
    SCAVENGER_1: { id: 'SCAVENGER_1', title: 'Eagle Eye', icon: '🔍', tier: 'common', desc: 'Discovered your first hidden micro drone.' },
    STUDIO_CREATOR: { id: 'STUDIO_CREATOR', title: 'Drone Architect', icon: '🛠️', tier: 'rare', desc: 'Engineered your first custom drone in the Studio.' },
    AUTOPILOT_ACE: { id: 'AUTOPILOT_ACE', title: 'Auto-Pilot Ace', icon: '🛰️', tier: 'rare', desc: 'Engaged hands-free autonomous flight navigation.' },
    SHOWREEL_DIRECTOR: { id: 'SHOWREEL_DIRECTOR', title: 'Cinema Director', icon: '🎬', tier: 'rare', desc: 'Screened the full cinematic brand film showreel.' },
    PRECISION_LAND: { id: 'PRECISION_LAND', title: 'Touchdown Master', icon: '🛬', tier: 'rare', desc: 'Guided the hero drone onto the contact landing pad.' },
    REVENUE_ANALYST: { id: 'REVENUE_ANALYST', title: 'CapEx Strategist', icon: '📊', tier: 'rare', desc: 'Explored all 4 streams of the AMR-PD revenue model.' },
    FOUNDER_SECRET: { id: 'FOUNDER_SECRET', title: 'Backer Insider', icon: '🤝', tier: 'rare', desc: 'Tapped the logo 5 times to reveal lab data.' },
    STREAK_3: { id: 'STREAK_3', title: 'On Duty', icon: '🔥', tier: 'rare', desc: 'Maintained a 3-day operational flight streak.' },
    SCAVENGER_5: { id: 'SCAVENGER_5', title: 'Recon Specialist', icon: '🎯', tier: 'rare', desc: 'Located 5 hidden micro drones across the site.' },
    THREE_BUILDS: { id: 'THREE_BUILDS', title: 'Master Tinkerer', icon: '📐', tier: 'rare', desc: 'Saved 3 unique custom builds in My Hangar.' },
    PERFECT_BALANCE: { id: 'PERFECT_BALANCE', title: 'Harmonic CoG', icon: '⚖️', tier: 'epic', desc: 'Engineered a build with Speed, Battery, & Stability above 70.' },
    FLY_MY_DRONE: { id: 'FLY_MY_DRONE', title: 'Flight Command', icon: '🎮', tier: 'epic', desc: 'Deployed your custom Studio drone into the site-wide Flight Journey.' },
    HIGH_ROLLER: { id: 'HIGH_ROLLER', title: 'Aero Tycoon', icon: '💰', tier: 'epic', desc: 'Accumulated 1,000 Aero Coins in the treasury.' },
    RARE_COMBO: { id: 'RARE_COMBO', title: 'Apex Config', icon: '💎', tier: 'epic', desc: 'Equipped VTOL Frame, LiDAR Sensor, and Neon Trail.' },
    SCAVENGER_10: { id: 'SCAVENGER_10', title: 'Surveyor General', icon: '🏆', tier: 'legendary', desc: 'Discovered all 10 hidden micro drones in the fleet.' },
    KONAMI_CHOPPER: { id: 'KONAMI_CHOPPER', title: 'Secret Agent', icon: '👾', tier: 'legendary', desc: 'Entered the legendary aviator override code.' }
  };

  // --- INITIAL GAME STATE ---
  const DEFAULT_STATE = {
    callsign: 'PILOT-01',
    avatar: '🚁',
    level: 1,
    xp: 0,
    coins: 150,
    streak: 1,
    lastLoginDate: new Date().toDateString(),
    pagesVisited: [],
    badges: ['FIRST_STEPS'],
    missions: [
      { id: 'm_pages', title: 'Sector Recon', desc: 'Visit at least 3 pages on the platform.', progress: 1, goal: 3, xp: 80, coins: 50, claimed: false },
      { id: 'm_flight', title: 'Flight Navigator', desc: 'Travel through all 6 flight zones on Home.', progress: 0, goal: 6, xp: 120, coins: 80, claimed: false },
      { id: 'm_showreel', title: 'Film Critic', desc: 'Watch the full cinematic brand film showreel.', progress: 0, goal: 1, xp: 150, coins: 100, claimed: false },
      { id: 'm_studio', title: 'Custom Prototype', desc: 'Design and assemble a drone in the Studio.', progress: 0, goal: 1, xp: 120, coins: 80, claimed: false },
      { id: 'm_hangar', title: 'Fleet Commander', desc: 'Save 3 custom drone builds to My Hangar.', progress: 0, goal: 3, xp: 180, coins: 120, claimed: false },
      { id: 'm_scavenge', title: 'Micro Recon', desc: 'Find 3 hidden micro drones across pages.', progress: 0, goal: 3, xp: 200, coins: 150, claimed: false }
    ],
    hangar: [],
    activeDroneConfig: null,
    scavengerFound: [],
    soundEnabled: false,
    onboardingComplete: false
  };

  // --- STORAGE WRAPPER WITH TRY/CATCH ---
  class GameStore {
    static load() {
      try {
        const raw = localStorage.getItem('drweb_game_state');
        if (!raw) return { ...DEFAULT_STATE };
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_STATE, ...parsed };
      } catch (e) {
        console.warn('LocalStorage unavailable, running in-memory session', e);
        return { ...DEFAULT_STATE };
      }
    }

    static save(state) {
      try {
        localStorage.setItem('drweb_game_state', JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to persist game state', e);
      }
    }

    static loadActiveDrone() {
      try {
        const raw = localStorage.getItem('drweb_active_drone');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    static saveActiveDrone(config) {
      try {
        localStorage.setItem('drweb_active_drone', JSON.stringify(config));
      } catch (e) {}
    }
  }

  // --- SYNTHESIZED WEB AUDIO (ZERO EXTERNAL FILES) ---
  class AudioSynth {
    constructor() {
      this.ctx = null;
    }
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }
    playTone(freq, type = 'sine', duration = 0.15, vol = 0.15) {
      if (!window.AeroGame || !window.AeroGame.state.soundEnabled) return;
      try {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {}
    }
    click() {
      this.playTone(600, 'sine', 0.04, 0.06);
    }
    coin() {
      this.playTone(987.77, 'triangle', 0.08, 0.15);
      setTimeout(() => this.playTone(1318.51, 'triangle', 0.18, 0.15), 60);
    }
    levelUp() {
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.2), idx * 80);
      });
    }
    badge() {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.2), i * 90);
      });
    }
    barrelRoll() {
      this.playTone(350, 'sawtooth', 0.4, 0.12);
      setTimeout(() => this.playTone(600, 'sine', 0.3, 0.15), 150);
    }
    touchdown() {
      this.playTone(220, 'triangle', 0.5, 0.2);
    }
  }

  // --- CORE GAME MANAGER ---
  class GameManager {
    constructor() {
      this.state = GameStore.load();
      this.audio = new AudioSynth();
      this.initStreak();
      this.trackPageVisit();
    }

    initStreak() {
      const today = new Date().toDateString();
      if (this.state.lastLoginDate !== today) {
        const last = new Date(this.state.lastLoginDate);
        const diffDays = Math.round((new Date() - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          this.state.streak += 1;
          if (this.state.streak >= 3) this.unlockBadge('STREAK_3');
        } else if (diffDays > 1) {
          this.state.streak = 1;
        }
        this.state.lastLoginDate = today;
        this.addCoins(30, false);
        this.save();
      }
    }

    trackPageVisit() {
      const page = location.pathname.split('/').pop() || 'index.html';
      if (!this.state.pagesVisited.includes(page)) {
        this.state.pagesVisited.push(page);
        this.addXP(30, false);
        this.updateMission('m_pages', this.state.pagesVisited.length);
        if (this.state.pagesVisited.length >= 3) {
          this.unlockBadge('PAGE_HOPPER');
        }
        this.save();
      }
    }

    addXP(amount, showFloat = true) {
      this.state.xp += amount;
      if (showFloat) this.spawnFloatText(`+${amount} XP`, 'xp');

      const currentRank = this.getRank();
      const nextRank = RANKS.find(r => r.level === this.state.level + 1);

      if (nextRank && this.state.xp >= nextRank.xpReq) {
        this.state.level = nextRank.level;
        this.onLevelUp(nextRank);
      }
      this.save();
      this.updateHUD();
    }

    addCoins(amount, showFloat = true) {
      this.state.coins += amount;
      this.audio.coin();
      if (showFloat) this.spawnFloatText(`+${amount} Coins`, 'coins');
      if (this.state.coins >= 1000) this.unlockBadge('HIGH_ROLLER');
      this.save();
      this.updateHUD();
    }

    getRank() {
      return [...RANKS].reverse().find(r => this.state.level >= r.level) || RANKS[0];
    }

    getNextRank() {
      return RANKS.find(r => r.level === this.state.level + 1) || null;
    }

    onLevelUp(rank) {
      this.audio.levelUp();
      this.addCoins(120, false);
      const modal = document.getElementById('levelUpModal');
      if (modal) {
        const nameEl = document.getElementById('levelUpRankName');
        const numEl = document.getElementById('levelUpNum');
        if (nameEl) nameEl.textContent = rank.name;
        if (numEl) numEl.textContent = `LEVEL ${rank.level}`;
        modal.classList.add('active');
        if (window.confetti) {
          window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }
    }

    unlockBadge(badgeKey) {
      if (!BADGES[badgeKey]) return;
      if (this.state.badges.includes(badgeKey)) return;

      this.state.badges.push(badgeKey);
      this.audio.badge();
      this.addXP(100, false);
      this.addCoins(75, false);
      this.showAchievementToast(BADGES[badgeKey]);
      this.save();
      this.updateHUD();
    }

    showAchievementToast(badge) {
      const toast = document.getElementById('achievementToast');
      if (!toast) return;
      document.getElementById('toastIcon').textContent = badge.icon;
      document.getElementById('toastTitle').textContent = `ACHIEVEMENT UNLOCKED [${badge.tier.toUpperCase()}]`;
      document.getElementById('toastName').textContent = badge.title;
      document.getElementById('toastDesc').textContent = badge.desc;

      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4500);
    }

    updateMission(missionId, progressVal) {
      const m = this.state.missions.find(x => x.id === missionId);
      if (m && !m.claimed) {
        m.progress = Math.min(progressVal, m.goal);
        this.save();
        this.renderMissionsList();
      }
    }

    claimMission(missionId) {
      const m = this.state.missions.find(x => x.id === missionId);
      if (m && m.progress >= m.goal && !m.claimed) {
        m.claimed = true;
        this.addXP(m.xp);
        this.addCoins(m.coins);
        this.save();
        this.renderMissionsList();
        this.updateHUD();
      }
    }

    collectScavengerDrone(droneId) {
      if (this.state.scavengerFound.includes(droneId)) return;
      this.state.scavengerFound.push(droneId);
      this.audio.coin();
      this.addXP(80);
      this.addCoins(60);

      this.updateMission('m_scavenge', this.state.scavengerFound.length);
      if (this.state.scavengerFound.length === 1) this.unlockBadge('SCAVENGER_1');
      if (this.state.scavengerFound.length >= 5) this.unlockBadge('SCAVENGER_5');
      if (this.state.scavengerFound.length >= 10) this.unlockBadge('SCAVENGER_10');

      this.save();
      this.updateHUD();
    }

    // Active Custom Drone configuration hook for Flight Journey
    setActiveDrone(config) {
      this.state.activeDroneConfig = config;
      GameStore.saveActiveDrone(config);
      this.save();
      this.unlockBadge('FLY_MY_DRONE');
      this.spawnFloatText('CUSTOM DRONE SET AS HERO FLIGHT AIRFRAME!', 'xp');
      // If flight engine is live, trigger swap
      if (window.HeroFlightEngine && window.HeroFlightEngine.updateDroneAppearance) {
        window.HeroFlightEngine.updateDroneAppearance(config);
      }
    }

    getActiveDrone() {
      return this.state.activeDroneConfig || GameStore.loadActiveDrone();
    }

    spawnFloatText(text, type = 'xp') {
      const el = document.createElement('div');
      el.className = `floating-reward ${type}`;
      el.textContent = text;
      el.style.left = (window.innerWidth / 2 - 60 + (Math.random() * 80 - 40)) + 'px';
      el.style.top = '70px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    }

    save() {
      GameStore.save(this.state);
    }

    // --- DOM HUD RENDERING ---
    injectHUD() {
      if (document.getElementById('gameHudBar')) return;

      const bar = document.createElement('div');
      bar.id = 'gameHudBar';
      bar.className = 'game-hud-bar';
      bar.innerHTML = `
        <div class="hud-pilot-badge" id="hudPilotBtn" title="Pilot License & Profile">
          <div class="hud-avatar" id="hudAvatar">${this.state.avatar}</div>
          <div>
            <span class="hud-callsign" id="hudCallsign">${this.state.callsign}</span>
            <span class="hud-rank-tag" id="hudRank">${this.getRank().name}</span>
          </div>
        </div>

        <div class="hud-xp-wrap" title="Pilot Experience Points">
          <span style="font-size:0.75rem; color:#00e5ff; font-weight:700;">LVL <span id="hudLvl">${this.state.level}</span></span>
          <div class="hud-xp-track">
            <div class="hud-xp-fill" id="hudXpFill"></div>
          </div>
          <span style="font-size:0.7rem; color:#7e8ba6;" id="hudXpVal">0/0</span>
        </div>

        <div class="hud-stats-group">
          <div class="hud-stat-chip hud-coins" title="Aero Coins">
            🪙 <span id="hudCoins">${this.state.coins}</span>
          </div>
          <div class="hud-stat-chip hud-streak" title="Daily Operational Streak">
            🔥 <span id="hudStreak">${this.state.streak}d</span>
          </div>
          <div class="hud-stat-chip" title="Badges Unlocked" style="color:#b388ff;">
            🏅 <span id="hudBadges">${this.state.badges.length}/22</span>
          </div>
          <button class="hud-btn" id="missionsBtn">
            📋 Missions
          </button>
          <button class="hud-btn" id="soundToggleBtn" title="Toggle Synthesizer Sound">
            ${this.state.soundEnabled ? '🔊 SFX' : '🔇 Mute'}
          </button>
        </div>

        <div class="hud-collapse-tab" id="hudCollapseTab">▲ HUD</div>
      `;

      // Missions Drawer
      const drawer = document.createElement('div');
      drawer.id = 'missionsDrawer';
      drawer.className = 'missions-drawer';
      drawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h3 style="font-size:1.15rem; color:#ffffff; font-family:var(--ff-heading);">PILOT MISSIONS & OBJECTIVES</h3>
          <button id="closeMissionsBtn" style="color:#00e5ff; font-size:1.5rem; cursor:pointer; background:none; border:none;">&times;</button>
        </div>
        <div id="missionsList"></div>
      `;

      // Achievement Toast
      const toast = document.createElement('div');
      toast.id = 'achievementToast';
      toast.className = 'achievement-toast';
      toast.innerHTML = `
        <div class="achievement-toast-icon" id="toastIcon">🏅</div>
        <div>
          <div class="achievement-toast-title" id="toastTitle">ACHIEVEMENT UNLOCKED</div>
          <div class="achievement-toast-name" id="toastName">Sonic Cruiser</div>
          <div class="achievement-toast-desc" id="toastDesc">Earned via flight benchmark.</div>
        </div>
      `;

      // Level Up Modal
      const modal = document.createElement('div');
      modal.id = 'levelUpModal';
      modal.className = 'level-up-modal';
      modal.innerHTML = `
        <div class="level-up-card">
          <div style="font-size:3.5rem; margin-bottom:0.5rem;">🎉</div>
          <div class="level-up-title" id="levelUpNum">LEVEL UP!</div>
          <div class="level-up-rank" id="levelUpRankName">Squadron Leader</div>
          <p style="color:#7e8ba6; font-size:0.9rem; margin-bottom:1.5rem;">
            Your flight telemetry and mission benchmarks have unlocked higher airspace clearance and advanced payload configurations.
          </p>
          <div style="font-size:1.1rem; color:#ffd700; margin-bottom:1.5rem; font-weight:700;">
            +120 BONUS AERO COINS!
          </div>
          <button class="btn btn--primary" id="closeLevelUpBtn" style="padding:0.75rem 2.5rem;">
            Claim Rank Upgrade
          </button>
        </div>
      `;

      // Pilot License Onboarding Modal
      const licenseModal = document.createElement('div');
      licenseModal.id = 'pilotLicenseModal';
      licenseModal.className = 'pilot-license-modal';
      licenseModal.innerHTML = `
        <div class="license-modal-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div style="font-family:var(--ff-mono); font-size:0.75rem; color:var(--clr-cyan); letter-spacing:1px;">DGCA / AVIATION BOARD REGISTRY</div>
            <button id="closeLicenseBtn" style="background:none; border:none; color:#7e8ba6; font-size:1.3rem; cursor:pointer;">&times;</button>
          </div>
          <h2 style="font-size:1.5rem; margin-bottom:0.5rem; font-family:var(--ff-heading);">PILOT CREDENTIALS</h2>
          <p style="color:#7e8ba6; font-size:0.85rem; margin-bottom:1.25rem;">
            Set your flight callsign and insignia before commencing aerial operations across DRWEB AERO sectors.
          </p>

          <div style="margin-bottom:1.25rem;">
            <label style="display:block; font-size:0.75rem; color:var(--clr-cyan); font-family:var(--ff-mono); margin-bottom:0.4rem;">CALLSIGN</label>
            <input type="text" id="callsignInput" value="${this.state.callsign}" maxlength="14" style="width:100%; background:#0a0e1a; border:1px solid rgba(0,229,255,0.3); border-radius:8px; padding:8px 12px; color:#fff; font-family:var(--ff-mono); font-size:0.95rem;">
          </div>

          <div style="margin-bottom:1.5rem;">
            <label style="display:block; font-size:0.75rem; color:var(--clr-cyan); font-family:var(--ff-mono); margin-bottom:0.4rem;">SELECT AVATAR INSIGNIA</label>
            <div style="display:flex; gap:0.6rem;" id="avatarSelectRow">
              ${['🚁', '🛸', '🛰️', '⚡', '🦅'].map(av => `
                <button class="avatar-option-btn ${av === this.state.avatar ? 'selected' : ''}" data-avatar="${av}" style="font-size:1.4rem; padding:6px 12px; background:#0f1729; border:1px solid rgba(0,229,255,0.2); border-radius:8px; cursor:pointer;">${av}</button>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
            <button class="btn btn--secondary" id="skipLicenseBtn" style="padding:0.6rem 1.25rem; font-size:0.85rem;">Skip Briefing</button>
            <button class="btn btn--primary" id="saveLicenseBtn" style="padding:0.6rem 1.75rem; font-size:0.85rem;">Confirm Credentials</button>
          </div>
        </div>
      `;

      document.body.prepend(bar);
      document.body.appendChild(drawer);
      document.body.appendChild(toast);
      document.body.appendChild(modal);
      document.body.appendChild(licenseModal);

      this.attachHUDEvents();
      this.updateHUD();
      this.renderMissionsList();
      this.initEasterEggs();
      this.bindScavengerDrones();

      // Show license modal on first visit if not onboarded
      if (!this.state.onboardingComplete) {
        setTimeout(() => licenseModal.classList.add('active'), 1200);
      }
    }

    attachHUDEvents() {
      const pilotBtn = document.getElementById('hudPilotBtn');
      if (pilotBtn) {
        pilotBtn.addEventListener('click', () => {
          location.href = 'profile.html';
        });
      }

      const missionsBtn = document.getElementById('missionsBtn');
      const closeMissionsBtn = document.getElementById('closeMissionsBtn');
      const drawer = document.getElementById('missionsDrawer');

      if (missionsBtn && drawer) {
        missionsBtn.addEventListener('click', () => drawer.classList.toggle('open'));
      }
      if (closeMissionsBtn && drawer) {
        closeMissionsBtn.addEventListener('click', () => drawer.classList.remove('open'));
      }

      const collapseTab = document.getElementById('hudCollapseTab');
      const hudBar = document.getElementById('gameHudBar');
      if (collapseTab && hudBar) {
        collapseTab.addEventListener('click', () => {
          hudBar.classList.toggle('collapsed');
          collapseTab.textContent = hudBar.classList.contains('collapsed') ? '▼ HUD' : '▲ HUD';
        });
      }

      const soundBtn = document.getElementById('soundToggleBtn');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          this.state.soundEnabled = !this.state.soundEnabled;
          soundBtn.textContent = this.state.soundEnabled ? '🔊 SFX' : '🔇 Mute';
          if (this.state.soundEnabled) {
            this.audio.coin();
            this.unlockBadge('RADIO_CHECK');
          }
          this.save();
        });
      }

      const closeLvlBtn = document.getElementById('closeLevelUpBtn');
      const lvlModal = document.getElementById('levelUpModal');
      if (closeLvlBtn && lvlModal) {
        closeLvlBtn.addEventListener('click', () => lvlModal.classList.remove('active'));
      }

      // Pilot License modal events
      const licenseModal = document.getElementById('pilotLicenseModal');
      const closeLicenseBtn = document.getElementById('closeLicenseBtn');
      const skipLicenseBtn = document.getElementById('skipLicenseBtn');
      const saveLicenseBtn = document.getElementById('saveLicenseBtn');
      const callsignInput = document.getElementById('callsignInput');
      const avatarBtns = document.querySelectorAll('.avatar-option-btn');

      avatarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          avatarBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });

      const dismissLicense = () => {
        this.state.onboardingComplete = true;
        this.save();
        if (licenseModal) licenseModal.classList.remove('active');
      };

      if (closeLicenseBtn) closeLicenseBtn.addEventListener('click', dismissLicense);
      if (skipLicenseBtn) skipLicenseBtn.addEventListener('click', dismissLicense);

      if (saveLicenseBtn && callsignInput) {
        saveLicenseBtn.addEventListener('click', () => {
          const val = callsignInput.value.trim().toUpperCase();
          if (val) this.state.callsign = val;
          const activeAvatar = document.querySelector('.avatar-option-btn.selected');
          if (activeAvatar) this.state.avatar = activeAvatar.getAttribute('data-avatar');
          this.state.onboardingComplete = true;
          this.save();
          this.updateHUD();
          this.audio.coin();
          this.spawnFloatText('PILOT LICENSE REGISTERED: +50 XP', 'xp');
          this.addXP(50, false);
          if (licenseModal) licenseModal.classList.remove('active');
        });
      }
    }

    updateHUD() {
      const callsignEl = document.getElementById('hudCallsign');
      const avatarEl = document.getElementById('hudAvatar');
      const rankEl = document.getElementById('hudRank');
      const lvlEl = document.getElementById('hudLvl');
      const xpFill = document.getElementById('hudXpFill');
      const xpVal = document.getElementById('hudXpVal');
      const coinsEl = document.getElementById('hudCoins');
      const streakEl = document.getElementById('hudStreak');
      const badgesEl = document.getElementById('hudBadges');

      if (callsignEl) callsignEl.textContent = this.state.callsign;
      if (avatarEl) avatarEl.textContent = this.state.avatar;
      if (rankEl) rankEl.textContent = this.getRank().name;
      if (lvlEl) lvlEl.textContent = this.state.level;
      if (coinsEl) coinsEl.textContent = this.state.coins;
      if (streakEl) streakEl.textContent = `${this.state.streak}d`;
      if (badgesEl) badgesEl.textContent = `${this.state.badges.length}/22`;

      const currentRank = this.getRank();
      const nextRank = this.getNextRank();
      if (xpFill && xpVal) {
        if (!nextRank) {
          xpFill.style.width = '100%';
          xpVal.textContent = 'MAX LEVEL';
        } else {
          const base = currentRank.xpReq;
          const target = nextRank.xpReq;
          const progress = Math.max(0, Math.min(1, (this.state.xp - base) / (target - base)));
          xpFill.style.width = `${Math.floor(progress * 100)}%`;
          xpVal.textContent = `${this.state.xp - base}/${target - base} XP`;
        }
      }
    }

    renderMissionsList() {
      const container = document.getElementById('missionsList');
      if (!container) return;
      container.innerHTML = this.state.missions.map(m => {
        const isDone = m.progress >= m.goal;
        return `
          <div class="mission-card ${isDone ? 'completed' : ''}">
            <div class="mission-header">
              <span style="color:#ffffff;">${m.title}</span>
              <span style="color:#ffd700; font-family:var(--ff-mono); font-size:0.75rem;">+${m.xp} XP / +${m.coins}🪙</span>
            </div>
            <div class="mission-desc">${m.desc}</div>
            <div class="mission-progress-bar">
              <div class="mission-progress-fill" style="width:${Math.floor((m.progress / m.goal) * 100)}%;"></div>
            </div>
            ${isDone && !m.claimed ? `<button class="mission-claim-btn" onclick="window.AeroGame.claimMission('${m.id}')">Claim Objective Reward</button>` : ''}
            ${m.claimed ? `<span style="font-size:0.75rem; color:#00e676; font-weight:700;">✓ CLAIMED</span>` : ''}
          </div>
        `;
      }).join('');
    }

    bindScavengerDrones() {
      document.querySelectorAll('.scavenger-drone').forEach(el => {
        const id = el.getAttribute('data-scavenger-id');
        if (this.state.scavengerFound.includes(id)) {
          el.classList.add('collected');
        }
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this.state.scavengerFound.includes(id)) {
            el.classList.add('collected');
            this.collectScavengerDrone(id);
          }
        });
      });
    }

    initEasterEggs() {
      // 1. Konami Code (up up down down left right left right b a)
      const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      let cursor = 0;
      window.addEventListener('keydown', (e) => {
        if (e.key === konami[cursor] || e.key.toLowerCase() === konami[cursor]) {
          cursor++;
          if (cursor === konami.length) {
            cursor = 0;
            this.unlockBadge('KONAMI_CHOPPER');
            this.addCoins(500);
            this.spawnFloatText('KONAMI CODE: +500 COINS!', 'coins');
          }
        } else {
          cursor = 0;
        }
      });

      // 2. Logo 5-click easter egg
      const logos = document.querySelectorAll('.navbar__logo');
      logos.forEach(logo => {
        let clicks = 0;
        logo.addEventListener('click', () => {
          clicks++;
          if (clicks >= 5) {
            clicks = 0;
            this.unlockBadge('FOUNDER_SECRET');
            this.addCoins(250);
            this.spawnFloatText('FOUNDER SECRET: +250 COINS!', 'coins');
          }
        });
      });
    }
  }

  // Instantiate and expose globally
  window.AeroGame = new GameManager();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.AeroGame.injectHUD());
  } else {
    window.AeroGame.injectHUD();
  }

})();
