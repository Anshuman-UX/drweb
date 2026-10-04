/* ==========================================================================
   DRWEB AERO / AMR-PD — FLIGHT ARCADE ENGINE (arcade.js)
   Two Playable Mini-Games: "Drone Dash" & "Sky Delivery"
   ========================================================================== */

(function () {
  'use strict';

  // --- GAME 1: DRONE DASH (ENDLESS FLYER) ---
  class DroneDashGame {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.running = false;
      this.score = 0;
      this.coinsCollected = 0;
      this.speed = 4;
      this.player = { x: 80, y: 150, vy: 0, targetY: 150, width: 44, height: 26, shield: false };
      this.obstacles = [];
      this.collectibles = [];
      this.particles = [];
      this.frame = 0;
      this.initEvents();
    }

    initEvents() {
      // Mouse/Touch controls
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.player.targetY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      });

      this.canvas.addEventListener('touchmove', (e) => {
        if (!e.touches.length) return;
        const rect = this.canvas.getBoundingClientRect();
        this.player.targetY = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
        e.preventDefault();
      }, { passive: false });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.player.targetY -= 30;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.player.targetY += 30;
      });
    }

    start() {
      this.running = true;
      this.score = 0;
      this.coinsCollected = 0;
      this.speed = 4;
      this.obstacles = [];
      this.collectibles = [];
      this.particles = [];
      this.player.y = this.canvas.height / 2;
      this.player.targetY = this.canvas.height / 2;
      this.loop();
      if (window.AeroGame) window.AeroGame.updateMission('m_arcade', 1);
    }

    loop() {
      if (!this.running) return;
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }

    update() {
      this.frame++;
      this.score += 1;
      if (this.frame % 300 === 0) this.speed += 0.5;

      // Smooth vertical movement towards target
      this.player.y += (this.player.targetY - this.player.y) * 0.12;
      this.player.y = Math.max(20, Math.min(this.canvas.height - 30, this.player.y));

      // Spawn Obstacles (Towers & Storm Clouds)
      if (this.frame % 85 === 0) {
        const isTop = Math.random() > 0.5;
        this.obstacles.push({
          x: this.canvas.width + 40,
          y: isTop ? 0 : this.canvas.height - (70 + Math.random() * 80),
          width: 32,
          height: 70 + Math.random() * 80,
          color: '#ff1744'
        });
      }

      // Spawn Coins / Battery Packs
      if (this.frame % 60 === 0) {
        this.collectibles.push({
          x: this.canvas.width + 20,
          y: 30 + Math.random() * (this.canvas.height - 60),
          radius: 9,
          type: Math.random() > 0.8 ? 'battery' : 'coin'
        });
      }

      // Update Obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= this.speed;

        // Collision Check
        if (
          this.player.x + this.player.width / 2 > obs.x &&
          this.player.x - this.player.width / 2 < obs.x + obs.width &&
          this.player.y + this.player.height / 2 > obs.y &&
          this.player.y - this.player.height / 2 < obs.y + obs.height
        ) {
          if (this.player.shield) {
            this.player.shield = false;
            this.obstacles.splice(i, 1);
            continue;
          }
          this.gameOver();
          return;
        }

        if (obs.x < -60) this.obstacles.splice(i, 1);
      }

      // Update Collectibles
      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const c = this.collectibles[i];
        c.x -= this.speed;

        const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
        if (dist < c.radius + 16) {
          if (c.type === 'coin') {
            this.coinsCollected += 1;
            if (window.AeroGame) window.AeroGame.audio.coin();
          } else {
            this.player.shield = true;
            if (window.AeroGame) window.AeroGame.audio.levelUp();
          }
          this.collectibles.splice(i, 1);
          continue;
        }

        if (c.x < -30) this.collectibles.splice(i, 1);
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Background Sky & Grid
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Speed lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (this.canvas.height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width, y);
        ctx.stroke();
      }

      // Draw Collectibles
      this.collectibles.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = c.type === 'battery' ? '#00e5ff' : '#ffd700';
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
      });
      ctx.shadowBlur = 0;

      // Draw Obstacles
      this.obstacles.forEach(obs => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = '#ff1744';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      });

      // Draw Player Drone
      ctx.save();
      ctx.translate(this.player.x, this.player.y);
      const tilt = (this.player.targetY - this.player.y) * 0.04;
      ctx.rotate(tilt);

      // Drone Body
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-20, -10, 40, 20, 4);
      ctx.fill();
      ctx.stroke();

      // Spinning Rotors
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(-16, -14, 16, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(16, -14, 16, 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Shield Aura
      if (this.player.shield) {
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // In-Game HUD overlay
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`SCORE: ${this.score}`, 16, 26);
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`COINS: ${this.coinsCollected}`, 16, 46);
    }

    gameOver() {
      this.running = false;
      const payoutCoins = Math.floor(this.score / 20) + this.coinsCollected * 5;
      const payoutXP = Math.floor(this.score / 10);

      if (window.AeroGame) {
        window.AeroGame.addCoins(payoutCoins);
        window.AeroGame.addXP(payoutXP);
        if (this.score >= 100) window.AeroGame.unlockBadge('DASH_ROOKIE');
        if (this.score >= 500) window.AeroGame.unlockBadge('DASH_PRO');
        if (this.score > window.AeroGame.state.highScores.dash) {
          window.AeroGame.state.highScores.dash = this.score;
          window.AeroGame.save();
        }
      }

      const screen = document.getElementById('dashGameOverScreen');
      if (screen) {
        document.getElementById('dashFinalScore').textContent = this.score;
        document.getElementById('dashEarnedCoins').textContent = `+${payoutCoins}🪙`;
        document.getElementById('dashEarnedXP').textContent = `+${payoutXP} XP`;
        screen.style.display = 'flex';
      }
    }
  }

  // --- GAME 2: SKY DELIVERY (PRECISION WINCH DROP) ---
  class SkyDeliveryGame {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.running = false;
      this.droneX = 40;
      this.droneSpeed = 3.5;
      this.packagesLeft = 3;
      this.score = 0;
      this.package = null;
      this.target = { x: 300, y: 320, width: 80, speed: 1.2, dir: 1 };
      this.windShear = (Math.random() * 2 - 1).toFixed(1);
      this.initEvents();
    }

    initEvents() {
      const dropAction = () => {
        if (!this.running || this.package || this.packagesLeft <= 0) return;
        this.package = {
          x: this.droneX,
          y: 70,
          vx: this.droneSpeed + parseFloat(this.windShear) * 0.8,
          vy: 1
        };
        this.packagesLeft--;
        if (window.AeroGame) window.AeroGame.audio.drop();
      };

      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') dropAction();
      });
      this.canvas.addEventListener('click', dropAction);
    }

    start() {
      this.running = true;
      this.droneX = 40;
      this.packagesLeft = 3;
      this.score = 0;
      this.package = null;
      this.target.x = 200 + Math.random() * 250;
      this.windShear = (Math.random() * 2 - 1).toFixed(1);
      this.loop();
      if (window.AeroGame) window.AeroGame.updateMission('m_arcade', 1);
    }

    loop() {
      if (!this.running) return;
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }

    update() {
      // Move Drone
      this.droneX += this.droneSpeed;
      if (this.droneX > this.canvas.width + 40) this.droneX = -40;

      // Move Target Rescue Boat
      this.target.x += this.target.speed * this.target.dir;
      if (this.target.x < 100 || this.target.x > this.canvas.width - 150) this.target.dir *= -1;

      // Package Physics
      if (this.package) {
        this.package.x += this.package.vx;
        this.package.y += this.package.vy;
        this.package.vy += 0.25; // gravity

        // Hit water level
        if (this.package.y >= this.target.y - 10) {
          const hitDistance = Math.abs(this.package.x - (this.target.x + this.target.width / 2));
          let precision = Math.max(0, 100 - hitDistance * 2);

          if (precision > 30) {
            this.score += Math.floor(precision * 5);
            if (window.AeroGame) {
              window.AeroGame.unlockBadge('SKY_DROP_1');
              if (precision >= 95) window.AeroGame.unlockBadge('BULLSEYE');
            }
          }

          this.package = null;
          this.windShear = (Math.random() * 3 - 1.5).toFixed(1);

          if (this.packagesLeft <= 0) {
            setTimeout(() => this.finishSortie(), 800);
          }
        }
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Flooded river landscape
      ctx.fillStyle = '#061325';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#03203c';
      ctx.fillRect(0, this.target.y, this.canvas.width, this.canvas.height - this.target.y);

      // Rescue Target (Raft / Submerged Rooftop)
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(this.target.x, this.target.y - 12, this.target.width, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillText('SURVIVOR RAFT', this.target.x + 4, this.target.y + 1);

      // Drone at altitude
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.roundRect(this.droneX - 25, 45, 50, 16, 4);
      ctx.fill();

      // Dropped Package
      if (this.package) {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.package.x - 8, this.package.y - 8, 16, 16);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(this.package.x - 8, this.package.y - 8, 16, 16);
      }

      // HUD Readout
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`SORTIE SCORE: ${this.score}`, 16, 26);
      ctx.fillText(`PAYLOADS LEFT: ${this.packagesLeft}`, 16, 46);
      ctx.fillStyle = '#00e5ff';
      ctx.fillText(`WIND SHEAR: ${this.windShear} m/s`, this.canvas.width - 200, 26);
      ctx.font = '12px "JetBrains Mono"';
      ctx.fillStyle = '#7e8ba6';
      ctx.fillText('[SPACEBAR / TAP TO DROP PAYLOAD]', this.canvas.width / 2 - 130, this.canvas.height - 15);
    }

    finishSortie() {
      this.running = false;
      const earnedCoins = Math.floor(this.score / 15);
      const earnedXP = Math.floor(this.score / 8);

      if (window.AeroGame) {
        window.AeroGame.addCoins(earnedCoins);
        window.AeroGame.addXP(earnedXP);
      }

      const modal = document.getElementById('deliveryGameOverScreen');
      if (modal) {
        document.getElementById('deliveryFinalScore').textContent = this.score;
        document.getElementById('deliveryEarnedCoins').textContent = `+${earnedCoins}🪙`;
        document.getElementById('deliveryEarnedXP').textContent = `+${earnedXP} XP`;
        modal.style.display = 'flex';
      }
    }
  }

  window.Arcade = {
    dash: null,
    delivery: null,
    init() {
      this.dash = new DroneDashGame('droneDashCanvas');
      this.delivery = new SkyDeliveryGame('skyDeliveryCanvas');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.Arcade.init());
  } else {
    window.Arcade.init();
  }

})();
