/* ==========================================================================
   GRAVITAS — CORE INTERACTIONS (main.js)
   Mobile navigation drawer, active link state, keyboard-accessible lightbox,
   FAQ smooth accordion, and non-sales technical inquiry validation.
   ========================================================================== */

(function () {
  'use strict';

  // Signal progressive enhancement
  document.documentElement.classList.add('js-enabled');

  const GravitasUI = {
    init() {
      this.initMobileNav();
      this.initAccordion();
      this.initLightbox();
      this.initForms();
    },

    // 1. Mobile Drawer Navigation
    initMobileNav() {
      const toggleBtn = document.querySelector('.nav-toggle');
      const closeBtn = document.querySelector('.drawer-close');
      const drawer = document.getElementById('mobile-nav-drawer');

      if (!toggleBtn || !drawer) return;

      const openDrawer = () => {
        drawer.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
      };

      const closeDrawer = () => {
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggleBtn.focus();
      };

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = drawer.classList.contains('active');
        if (isOpen) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeDrawer();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
          closeDrawer();
        }
      });
    },

    // 2. Smooth Accessible FAQ Accordion
    initAccordion() {
      const headers = document.querySelectorAll('.accordion-header');
      headers.forEach(header => {
        header.addEventListener('click', () => {
          const isExpanded = header.getAttribute('aria-expanded') === 'true';
          const content = header.nextElementSibling;

          // Close all sibling accordions
          headers.forEach(otherHeader => {
            if (otherHeader !== header) {
              otherHeader.setAttribute('aria-expanded', 'false');
              if (otherHeader.nextElementSibling) {
                otherHeader.nextElementSibling.style.maxHeight = null;
              }
            }
          });

          // Toggle current accordion
          if (isExpanded) {
            header.setAttribute('aria-expanded', 'false');
            content.style.maxHeight = null;
          } else {
            header.setAttribute('aria-expanded', 'true');
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        });
      });
    },

    // 3. Accessible Gallery Lightbox
    initLightbox() {
      const items = document.querySelectorAll('.gallery-item');
      const lightbox = document.getElementById('gallery-lightbox');
      if (!lightbox || !items.length) return;

      const closeBtn = lightbox.querySelector('.lightbox-close');
      const backdrop = lightbox.querySelector('.lightbox-backdrop');
      const canvasSlot = lightbox.querySelector('.lightbox-canvas-slot');
      const captionText = document.getElementById('lightbox-caption');
      const telemetryText = document.getElementById('lightbox-telemetry');

      let lastFocusedElement = null;

      const openLightbox = (item) => {
        lastFocusedElement = document.activeElement;
        const caption = item.getAttribute('data-caption') || '';
        const telemetry = item.getAttribute('data-telemetry') || '';
        const mediaBox = item.querySelector('.gallery-media-box');

        if (captionText) captionText.textContent = caption;
        if (telemetryText) telemetryText.textContent = telemetry;

        if (canvasSlot && mediaBox) {
          canvasSlot.innerHTML = '';
          // Clone only the SVG or visual content, stripping fixed layout constraints and badges
          const svgEl = mediaBox.querySelector('svg');
          if (svgEl) {
            const svgClone = svgEl.cloneNode(true);
            svgClone.removeAttribute('style');
            canvasSlot.appendChild(svgClone);
          } else {
            const imgEl = mediaBox.querySelector('img');
            if (imgEl) {
              const imgClone = imgEl.cloneNode(true);
              canvasSlot.appendChild(imgClone);
            }
          }
        }

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
      };

      const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedElement) lastFocusedElement.focus();
      };

      items.forEach(item => {
        item.addEventListener('click', () => openLightbox(item));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(item);
          }
        });
      });

      if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
      if (backdrop) backdrop.addEventListener('click', closeLightbox);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
          closeLightbox();
        }
      });
    },

    // 4. Non-Sales Technical Inquiry Form Validation
    initForms() {
      const enquiryForm = document.getElementById('enquiry-form');
      if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
          e.preventDefault();
          let valid = true;

          const name = document.getElementById('contact-name');
          const email = document.getElementById('contact-email');
          const topic = document.getElementById('contact-topic');
          const message = document.getElementById('contact-message');
          const consent = document.getElementById('contact-consent');

          // Name validation (min 2 chars)
          if (!name || name.value.trim().length < 2) {
            document.getElementById('name-error').style.display = 'block';
            valid = false;
          } else {
            document.getElementById('name-error').style.display = 'none';
          }

          // Email validation
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email || !emailPattern.test(email.value.trim())) {
            document.getElementById('email-error').style.display = 'block';
            valid = false;
          } else {
            document.getElementById('email-error').style.display = 'none';
          }

          // Topic validation
          if (!topic || !topic.value) {
            document.getElementById('topic-error').style.display = 'block';
            valid = false;
          } else {
            document.getElementById('topic-error').style.display = 'none';
          }

          // Message validation (min 20 chars)
          if (!message || message.value.trim().length < 20) {
            document.getElementById('message-error').style.display = 'block';
            valid = false;
          } else {
            document.getElementById('message-error').style.display = 'none';
          }

          // Non-commercial consent checkbox validation
          if (!consent || !consent.checked) {
            document.getElementById('consent-error').style.display = 'block';
            valid = false;
          } else {
            document.getElementById('consent-error').style.display = 'none';
          }

          if (valid) {
            const feedback = document.getElementById('enquiry-feedback');
            if (feedback) {
              feedback.className = 'form-feedback success';
              feedback.textContent = 'Transmitted successfully to Gravitas Archival Repository. A technical curator will respond within 48 hours.';
              feedback.style.display = 'block';
            }
            enquiryForm.reset();
          }
        });
      }

      // Archival monograph bulletin subscription form
      const bulletinForm = document.getElementById('bulletin-form');
      if (bulletinForm) {
        bulletinForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const emailInput = bulletinForm.querySelector('input[type="email"]');
          const feedback = document.getElementById('bulletin-feedback');
          if (emailInput && emailInput.checkValidity()) {
            if (feedback) {
              feedback.className = 'form-feedback success';
              feedback.textContent = 'Subscribed. You will receive technical updates as monographs publish.';
              feedback.style.display = 'block';
            }
            bulletinForm.reset();
          }
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => GravitasUI.init());
})();
