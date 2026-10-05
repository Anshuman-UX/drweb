/* ==========================================================================
   GARUD — CORE MONOGRAPH SCRIPTS (main.js)
   Navigation, Lightbox, FAQ Accordion, Soft Enquiry Form Validation.
   ========================================================================== */

(function () {
  'use strict';

  // 1. Mobile Drawer Navigation
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.textContent = isOpen ? 'CLOSE [✕]' : 'MENU [≡]';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.textContent = 'MENU [≡]';
        document.body.style.overflow = '';
      });
    });
  }

  // 2. Active Link Highlighting
  const path = window.location.pathname.split('/').filter(Boolean);
  const currentFile = path[path.length - 1] || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentFile || href.endsWith(currentFile))) {
      link.classList.add('active');
    }
  });

  // 3. Editorial Lightbox for Gallery
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (galleryItems.length && lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const fullSrc = item.getAttribute('data-full') || item.querySelector('img')?.src;
        if (fullSrc) {
          lightboxImg.src = fullSrc;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // 4. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close siblings for clean accordion
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            const otherContent = other.querySelector('.faq-content');
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });

        item.classList.toggle('open', !isOpen);
        if (!isOpen) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = null;
        }
      });
    }
  });

  // 5. Contact Enquiry Form (Non-Sales)
  const contactForm = document.getElementById('enquiryForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('enquiryStatus');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) {
        statusEl.textContent = 'TRANSMITTING TECHNICAL ENQUIRY...';
        statusEl.style.display = 'block';
      }

      setTimeout(() => {
        if (statusEl) {
          statusEl.textContent = 'Enquiry received. Our engineering and testing team will respond within 48 hours.';
          statusEl.style.color = '#FF4B26';
        }
        contactForm.reset();
        if (submitBtn) submitBtn.disabled = false;
      }, 900);
    });
  }

  // 6. Optional Newsletter / Bulletin
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const btn = newsletterForm.querySelector('button');
      if (input && input.value) {
        if (btn) btn.textContent = 'SUBSCRIBED';
        input.value = '';
        setTimeout(() => { if (btn) btn.textContent = 'SUBSCRIBE'; }, 3000);
      }
    });
  }

  console.log('[Garud Monograph] Core systems initialized.');
})();
