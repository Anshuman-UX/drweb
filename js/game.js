/* ==========================================================================
   DRWEB AERO / AMR-PD — CENTRAL GAMIFICATION ENGINE (game.js)
   Manages XP, Levels, Coins, Quests, Badges, Audio Synth, and Persistent HUD
   ========================================================================== */

(function () {
  'use strict';

  // --- XP & RANKS CONFIGURATION ---
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

  // --- 20+ ACHIEVEMENTS DEFINITION ---
  const BADGES = {
    FIRST_STEPS: { id: 'FIRST_STEPS', title: 'First Steps', icon: '🛩️', tier: 'common', desc: 'Boarded the DRWEB AERO platform.' },
    PAGE_HOPPER: { id: 'PAGE_HOPPER', title: 'Scout Navigator', icon: '🗺️', tier: 'common', desc: 'Explored 3 different mission sectors.' },
    STUDIO_CREATOR: { id: 'STUDIO_CREATOR', title: 'Drone Architect', icon: '🛠️', tier: 'rare', desc: 'Crafted your first custom drone in the Studio.' },
    THREE_BUILDS: { id: 'THREE_BUILDS', title: 'Master Tinkerer', icon: '📐', tier: 'rare', desc: 'Saved 3 unique drone builds to your Hangar.' },
    PERFECT_BALANCE: { id: 'PERFECT_BALANCE', title: 'Harmonic CoG', icon: '⚖️', tier: 'epic', desc: 'Engineered a build with Speed, Battery, & Stability above 70.' },
    RARE_COMBO: { id: 'RARE_COMBO', title: 'Apex Config', icon: '💎', tier: 'epic', desc: 'Equipped VTOL Frame, LiDAR, and Neon Trail.' },
    SCAVENGER_1: { id: 'SCAVENGER_1', title: 'Eagle Eye', icon: '🔍', tier: 'common', desc: 'Discovered your first hidden micro drone.' },
    SCAVENGER_5: { id: 'SCAVENGER_5', title: 'Recon Specialist', icon: '🎯', tier: 'rare', desc: 'Located 5 hidden micro drones across the site.' },
    SCAVENGER_10: { id: 'SCAVENGER_10', title: 'Surveyor General', icon: '🏆', tier: 'legendary', desc: 'Found all 10 hidden micro drones in the fleet.' },
    DASH_ROOKIE: { id: 'DASH_ROOKIE', title: 'First Flight', icon: '⚡', tier: 'common', desc: 'Scored 100 points in Drone Dash.' },
    DASH_PRO: { id: 'DASH_PRO', title: 'Storm Runner', icon: '🌪️', tier: 'rare', desc: 'Scored 500 points in Drone Dash.' },
    SKY_DROP_1: { id: 'SKY_DROP_1', title: 'Payload Dropped', icon: '📦', tier: 'common', desc: 'Successfully delivered humanitarian aid in Sky Delivery.' },
    BULLSEYE: { id: 'BULLSEYE', title: 'Precision Winch', icon: '🎯', tier: 'epic', desc: 'Achieved a 95%+ precision drop score.' },
    NIGHT_VISION: { id: 'NIGHT_VISION', title: 'FLIR Certified', icon: '🕶️', tier: 'common', desc: 'Toggled Thermal Vision in the live demo.' },
    KONAMI_CHOPPER: { id: 'KONAMI_CHOPPER', title: 'Secret Agent', icon: '👾', tier: 'legendary', desc: 'Entered the legendary aviator override code.' },
    FOUNDER_SECRET: { id: 'FOUNDER_SECRET', title: 'Backer Insider', icon: '🤝', tier: 'rare', desc: 'Tapped the logo 5 times to reveal lab data.' },
    STREAK_3: { id: 'STREAK_3', title: 'On Duty', icon: '🔥', tier: 'rare', desc: 'Maintained a 3-day operational flight streak.' },
    SOUND_EXPLORER: { id: 'SOUND_EXPLORER', title: 'Radio Check', icon: '🔊', tier: 'common', desc: 'Engaged audio synthesizer telemetry.' },
    REVENUE_ANALYST: { id: 'REVENUE_ANALYST', title: 'CapEx Strategist', icon: '📊', tier: 'rare', desc: 'Explored all 4 streams of the AMR-PD diagram.' },
    HIGH_ROLLER: { id: 'HIGH_ROLLER', title: 'Aero Tycoon', icon: '💰', tier: 'epic', desc: 'Accumulated 1,000 Aero Coins.' }
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
      { id: 'm_pages', title: 'Mission Recon', desc: 'Visit at least 3 pages on the platform.', progress: 1, goal: 3, xp: 80, coins: 50, claimed: false },
      { id: 'm_studio', title: 'Custom Prototype', desc: 'Design and assemble a drone in the Studio.', progress: 0, goal: 1, xp: 120, coins: 100, claimed: false },
      { id: 'm_arcade', title: 'Combat Simulation', desc: 'Play Drone Dash or Sky Delivery in Arcade.', progress: 0, goal: 1, xp: 150, coins: 80, claimed: false },
      { id: 'm_scavenge', title: 'Search & Rescue', desc: 'Find 3 hidden micro drones across pages.', progress: 0, goal: 3, xp: 200, coins: 120, claimed: false }
    ],
    hangar: [],
    scavengerFound: [],
    highScores: { dash: 0, delivery: 0 },
    soundEnabled: false,
    reducedMotion: false
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
  }

  // --- WEB AUDIO API SYNTHESIZER (ZERO ASSETS) ---
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
      if (!game.state.soundEnabled) return;
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
    click() {
      this.playTone(600, 'sine', 0.04, 0.06);
    }
    drop() {
      this.playTone(320, 'sawtooth', 0.3, 0.18);
    }
  }

  // --- CORE GAME CONTROLLER ---
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
        this.addCoins(25, false); // Daily check-in bonus
        this.save();
      }
    }

    trackPageVisit() {
      const page = location.pathname.split('/').pop() || 'index.html';
      if (!this.state.pagesVisited.includes(page)) {
        this.state.pagesVisited.push(page);
        this.addXP(25, false);
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

      // Check level progression
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
      this.addCoins(100, false);
      const modal = document.getElementById('levelUpModal');
      if (modal) {
        const nameEl = document.getElementById('levelUpRankName');
        const numEl = document.getElementById('levelUpNum');
        if (nameEl) nameEl.textContent = rank.name;
        if (numEl) numEl.textContent = `LEVEL ${rank.level}`;
        modal.classList.add('active');
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

    spawnFloatText(text, type = 'xp') {
      const el = document.createElement('div');
      el.className = `floating-reward ${type}`;
      el.textContent = text;
      el.style.left = (window.innerWidth / 2 - 40 + (Math.random() * 80 - 40)) + 'px';
      el.style.top = '70px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
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
        <div class="hud-pilot-badge" id="hudPilotBtn" title="View Pilot Profile">
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
          <div class="hud-stat-chip hud-streak" title="Daily Flight Streak">
            🔥 <span id="hudStreak">${this.state.streak}d</span>
          </div>
          <div class="hud-stat-chip" title="Badges Unlocked" style="color:#b388ff;">
            🏅 <span id="hudBadges">${this.state.badges.length}/20</span>
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
          <h3 style="font-size:1.15rem; color:#ffffff; font-family:var(--ff-heading);">PILOT MISSIONS</h3>
          <button id="closeMissionsBtn" style="color:#00e5ff; font-size:1.5rem; cursor:pointer;">&times;</button>
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
          <div class="achievement-toast-name" id="toastName">Master Aviator</div>
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
            Your flight telemetry standards have unlocked new payload configurations and higher airspace clearance.
          </p>
          <div style="font-size:1.1rem; color:#ffd700; margin-bottom:1.5rem; font-weight:700;">
            +100 BONUS AERO COINS!
          </div>
          <button class="btn btn--primary" id="closeLevelUpBtn" style="padding:0.75rem 2.5rem;">
            Claim Rank Upgrade
          </button>
        </div>
      `;

      document.body.prepend(bar);
      document.body.appendChild(drawer);
      document.body.appendChild(toast);
      document.body.appendChild(modal);

      this.attachHUDEvents();
      this.updateHUD();
      this.renderMissionsList();
      this.initEasterEggs();
      this.bindScavengerDrones();
    }

    attachHUDEvents() {
      const pilotBtn = document.getElementById('hudPilotBtn');
      if (pilotBtn) pilotBtn.addEventListener('click', () => { location.href = 'profile.html'; });

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
            this.unlockBadge('SOUND_EXPLORER');
          }
          this.save();
        });
      }

      const closeLvlBtn = document.getElementById('closeLevelUpBtn');
      const lvlModal = document.getElementById('levelUpModal');
      if (closeLvlBtn && lvlModal) {
        closeLvlBtn.addEventListener('click', () => lvlModal.classList.remove('active'));
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
      if (badgesEl) badgesEl.textContent = `${this.state.badges.length}/20`;

      // XP Progress Bar Calculation
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
            ${isDone && !m.claimed ? `<button class="mission-claim-btn" onclick="window.AeroGame.claimMission('${m.id}')">Claim Mission Rewards</button>` : ''}
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
        logo.addEventListener('click', (e) => {
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
