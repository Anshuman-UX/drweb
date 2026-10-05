/* ==========================================================================
   GRAVITAS — ENGINEERING EXPLODED VIEW CONTROLLER (explode.js)
   Deconstructs and reassembles the carbon-titanium monocoque architecture.
   ========================================================================== */

(function () {
  'use strict';

  const ExplodedEngine = {
    slider: null,
    statusText: null,
    layers: [],

    init() {
      this.slider = document.getElementById('explodeSlider');
      this.statusText = document.getElementById('explodeStatus');
      this.layers = [
        { id: 'layerFuselageTop', dx: 0, dy: -120, dz: 0 },
        { id: 'layerRotorsTop', dx: -60, dy: -60, dz: 0 },
        { id: 'layerCoreAvionics', dx: 0, dy: 0, dz: 0 },
        { id: 'layerBatteryTray', dx: 0, dy: 60, dz: 0 },
        { id: 'layerGimbalBottom', dx: 40, dy: 130, dz: 0 }
      ];

      if (this.slider) {
        this.slider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value) / 100;
          this.applyExplosion(val);
        });

        // Initialize at 0% (assembled)
        this.applyExplosion(0);
      }
    },

    applyExplosion(factor) {
      this.layers.forEach(layer => {
        const el = document.getElementById(layer.id);
        if (el) {
          const transY = layer.dy * factor;
          const transX = layer.dx * factor;
          el.style.transform = `translate3d(${transX}px, ${transY}px, 0)`;
          el.style.opacity = factor > 0 ? (0.6 + (1 - factor) * 0.4) : 1;
        }
      });

      if (this.statusText) {
        if (factor === 0) {
          this.statusText.textContent = 'STATE: MONOCOQUE ASSEMBLED (0% DISPERSION)';
        } else if (factor >= 0.95) {
          this.statusText.textContent = 'STATE: FULL ISOLATION (100% DISPERSION)';
        } else {
          this.statusText.textContent = `STATE: SEPARATION AT ${Math.round(factor * 100)}%`;
        }
      }
    }
  };

  window.GravitasExploded = ExplodedEngine;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ExplodedEngine.init());
  } else {
    ExplodedEngine.init();
  }
})();
