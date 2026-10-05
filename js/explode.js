/* ==========================================================================
   GRAVITAS — INTERACTIVE EXPLODED VIEW ENGINE (explode.js)
   Physical stratum dispersion along the central vertical datum axis.
   Translates individual mechanical layers (canopy, sensors, avionics,
   battery, chassis, and gimbal) based on slider percentage.
   ========================================================================== */

(function () {
  'use strict';

  const ExplodeEngine = {
    init() {
      this.slider = document.getElementById('exploded-slider');
      this.valDisplay = document.getElementById('dispersion-value');
      this.container = document.getElementById('exploded-container');
      this.presets = document.querySelectorAll('.btn-preset');

      if (!this.slider || !this.container) return;

      this.cacheLayers();
      this.bindEvents();
      this.updateDispersion(parseInt(this.slider.value, 10) || 0);
    },

    cacheLayers() {
      // Find SVG layer groups inside the container
      this.layerCanopy = this.container.querySelector('#layer-canopy');
      this.layerSensors = this.container.querySelector('#layer-sensors');
      this.layerAvionics = this.container.querySelector('#layer-avionics');
      this.layerBattery = this.container.querySelector('#layer-battery');
      this.layerChassis = this.container.querySelector('#layer-chassis');
      this.layerGimbal = this.container.querySelector('#layer-gimbal');
      this.centralAxis = this.container.querySelector('.datum');
    },

    bindEvents() {
      this.slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.updateDispersion(val);
        this.updatePresetButtons(val);
      });

      this.presets.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const percent = parseInt(e.currentTarget.getAttribute('data-percent'), 10);
          this.slider.value = percent;
          this.updateDispersion(percent);
          this.updatePresetButtons(percent);
        });
      });
    },

    updatePresetButtons(val) {
      this.presets.forEach(btn => {
        const btnVal = parseInt(btn.getAttribute('data-percent'), 10);
        if (btnVal === val) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    },

    updateDispersion(percent) {
      if (this.valDisplay) {
        this.valDisplay.textContent = `${percent}%`;
      }

      const factor = percent / 100;

      // Physically displace individual mechanical layers along vertical axis
      if (this.layerCanopy) {
        const dy = -100 * factor;
        this.layerCanopy.style.transform = `translateY(${dy}px)`;
        this.layerCanopy.style.transition = 'transform 0.15s ease-out';
      }
      if (this.layerSensors) {
        const dy = -55 * factor;
        this.layerSensors.style.transform = `translateY(${dy}px)`;
        this.layerSensors.style.transition = 'transform 0.15s ease-out';
      }
      if (this.layerAvionics) {
        const dy = -20 * factor;
        this.layerAvionics.style.transform = `translateY(${dy}px)`;
        this.layerAvionics.style.transition = 'transform 0.15s ease-out';
      }
      if (this.layerBattery) {
        const dy = 25 * factor;
        this.layerBattery.style.transform = `translateY(${dy}px)`;
        this.layerBattery.style.transition = 'transform 0.15s ease-out';
      }
      if (this.layerChassis) {
        const dy = 45 * factor;
        this.layerChassis.style.transform = `translateY(${dy}px)`;
        this.layerChassis.style.transition = 'transform 0.15s ease-out';
      }
      if (this.layerGimbal) {
        const dy = 95 * factor;
        this.layerGimbal.style.transform = `translateY(${dy}px)`;
        this.layerGimbal.style.transition = 'transform 0.15s ease-out';
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => ExplodeEngine.init());
})();
