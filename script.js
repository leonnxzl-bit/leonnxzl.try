// script.js - mobile hamburger, splash fade, robust video play/resume

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const video = document.getElementById('bgVideo');
  const splash = document.getElementById('splash');
  const yearEl = document.getElementById('year');

  // set current year in footer
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------
     Mobile hamburger toggle (accessible)
     -------------------------*/
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });

    // Close menu on link click (mobile)
    mainNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (mainNav.classList.contains('open')) {
          mainNav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* -------------------------
     Splash hide: fade when video is ready, or after timeout
     -------------------------*/
  const hideSplash = () => {
    if (!splash) return;
    // prefer GSAP if available for smoothness
    if (window.gsap) {
      gsap.to(splash, { autoAlpha: 0, duration: 0.7, ease: 'power2.out', onComplete: () => splash.remove() });
    } else {
      splash.classList.add('hidden');
      setTimeout(() => splash.remove?.(), 800);
    }
  };

  // robust video play attempt
  function ensurePlay() {
    if (!video) return;
    if (!video.paused && !video.ended) return;
    video.play().catch(() => {
      // autoplay blocked — we stay muted; user gesture required to unmute with sound
    });
  }

  if (video) {
    // try play immediately
    ensurePlay();

    // when the video can play, hide splash
    video.addEventListener('canplaythrough', hideSplash, { once: true });
    video.addEventListener('canplay', hideSplash, { once: true });

    // fallback hide
    setTimeout(hideSplash, 2200);

    // restart if ended (loop should cover it but safe-guard)
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      ensurePlay();
    });

    // resume on visibility change / focus
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) setTimeout(ensurePlay, 150);
    });
    window.addEventListener('focus', () => setTimeout(ensurePlay, 120));
  } else {
    // if no video found, hide the splash after short delay
    setTimeout(hideSplash, 700);
  }

  /* -------------------------
     Respect prefers-reduced-motion
     -------------------------*/
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced && video) {
    video.pause();
    video.muted = true;
  }
});



  /* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    FOR PROJECR PAGE
     ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

     // script.js - Multi-row supporting carousel + lightbox + center snap + autoplay + infinite loop
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- LIGHTBOX ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  let lbCurrent = { row: null, index: 0, cards: [] };

  function openLightbox(rowId, index) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const cards = Array.from(row.querySelectorAll('.support-card'));
    const card = cards[index];
    if (!card) return;
    const img = card.querySelector('img');
    lbCurrent = { rowId, index, cards };
    lbImage.src = img.src;
    lbImage.alt = img.alt || '';
    lbCaption.textContent = card.querySelector('figcaption')?.innerText || '';
    lightbox.setAttribute('aria-hidden', 'false');
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    lbImage.src = '';
  }

  function lbShowIndex(delta) {
    let idx = lbCurrent.index + delta;
    const cards = lbCurrent.cards;
    if (!cards.length) return;
    if (idx < 0) idx = cards.length - 1;
    if (idx >= cards.length) idx = 0;
    lbCurrent.index = idx;
    const img = cards[idx].querySelector('img');
    lbImage.src = img.src;
    lbImage.alt = img.alt || '';
    lbCaption.textContent = cards[idx].querySelector('figcaption')?.innerText || '';
  }

  // LB events
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => lbShowIndex(-1));
  lbNext.addEventListener('click', () => lbShowIndex(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbShowIndex(-1);
      if (e.key === 'ArrowRight') lbShowIndex(1);
    }
  });

  /* ---------- CAROUSEL / ROW SETUP ---------- */
  const rows = document.querySelectorAll('.supporting-row');

  rows.forEach(row => setupRow(row));

  function setupRow(row) {
    const rowId = row.id;
    const wrapper = row.closest('.supporting-row-wrapper');
    const prevBtn = wrapper.querySelector(`.nav-btn.rewind[data-row="${rowId}"]`) || wrapper.querySelector('.nav-btn.rewind');
    const nextBtn = wrapper.querySelector(`.nav-btn.forward[data-row="${rowId}"]`) || wrapper.querySelector('.nav-btn.forward');
    const autoBtn = document.querySelector(`.auto-toggle[data-row="${rowId}"]`);
    const cards = Array.from(row.querySelectorAll('.support-card'));
    if (!cards.length) return;

    // Add click to open lightbox and also center the clicked card
    cards.forEach((card, idx) => {
      const img = card.querySelector('img');
      card.addEventListener('click', (e) => {
        // if clicked on image -> open lightbox
        if (e.target.tagName.toLowerCase() === 'img' || e.currentTarget.contains(e.target)) {
          openLightbox(rowId, idx);
        }
      });
    });

    // Center scroll calculation
    function centerCard(card) {
      const cardRect = card.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const offset = (cardRect.left + cardRect.right) / 2 - (rowRect.left + rowRect.right) / 2;
      // desired scrollLeft = current + offset
      row.scrollBy({ left: offset, behavior: 'smooth' });
    }

    // Scroll by one card (centered)
    function scrollByCard(direction = 1) {
      // find the currently centered card (if any) or nearest to center
      const centerIndex = findCenteredIndex(row);
      let targetIndex = centerIndex + direction;
      if (targetIndex < 0) targetIndex = cards.length - 1; // wrap
      if (targetIndex >= cards.length) targetIndex = 0; // wrap
      centerCard(cards[targetIndex]);
    }

    // Prev / Next buttons
    prevBtn && prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn && nextBtn.addEventListener('click', () => scrollByCard(1));

    // keyboard support when row is focused
    row.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByCard(-1); }
      if (e.key === 'Home')      { e.preventDefault(); centerCard(cards[0]); }
      if (e.key === 'End')       { e.preventDefault(); centerCard(cards[cards.length - 1]); }
    });

    // drag-to-scroll
    let isDown = false, startX = 0, scrollLeft = 0;
    row.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.pageX - row.offsetLeft;
      scrollLeft = row.scrollLeft;
      row.setPointerCapture(e.pointerId);
    });
    row.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - row.offsetLeft;
      const walk = (x - startX);
      row.scrollLeft = scrollLeft - walk;
    });
    ['pointerup','pointercancel','pointerleave'].forEach(ev => row.addEventListener(ev, () => (isDown = false)));

    // center-detection: highlight active card
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const card = entry.target;
        if (entry.intersectionRatio >= 0.6) {
          // mark active
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }, {
      root: row,
      threshold: [0.6] // card is active if >= 60% visible in the row's viewport
    });
    cards.forEach(c => obs.observe(c));

    // helper: find index of centered/active card
    function findCenteredIndex(container) {
      const children = Array.from(container.querySelectorAll('.support-card'));
      const containerRect = container.getBoundingClientRect();
      const containerCenter = (containerRect.left + containerRect.right) / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      children.forEach((child, i) => {
        const r = child.getBoundingClientRect();
        const childCenter = (r.left + r.right) / 2;
        const dist = Math.abs(childCenter - containerCenter);
        if (dist < closestDistance) { closestDistance = dist; closestIndex = i; }
      });
      return closestIndex;
    }

    /* ---------- AUTOPLAY + INFINITE ---------- */
    const autoplayInterval = parseInt(row.dataset.autoplayInterval) || 3000;
    const infinite = row.dataset.infinite === 'true';
    let autoplayTimer = null;

    function startAutoplay() {
      if (autoplayTimer) return;
      autoplayTimer = setInterval(() => {
        // scroll forward by one card
        scrollByCard(1);
        // if infinite, detect near-end and jump back to start smoothly (after slight delay)
        if (infinite) {
          // if we are near the end, after a tick, jump to start without visual flicker
          const nearEnd = Math.ceil(row.scrollLeft + row.clientWidth) >= row.scrollWidth - 2;
          if (nearEnd) {
            // after the smooth scroll finishes (~400ms), jump to start
            setTimeout(() => {
              row.scrollTo({ left: 0, behavior: 'auto' });
            }, 500);
          }
        }
      }, autoplayInterval);
    }

    function stopAutoplay() {
      if (!autoplayTimer) return;
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    // Auto toggle button
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        const isOn = autoBtn.getAttribute('aria-pressed') === 'true';
        if (isOn) {
          autoBtn.setAttribute('aria-pressed', 'false');
          autoBtn.textContent = '▶ Auto';
          stopAutoplay();
        } else {
          autoBtn.setAttribute('aria-pressed', 'true');
          autoBtn.textContent = '⏸ Auto';
          startAutoplay();
        }
      });
    }

    // pause autoplay on hover/focus interactions
    row.addEventListener('mouseenter', stopAutoplay);
    row.addEventListener('focusin', stopAutoplay);
    row.addEventListener('mouseleave', () => { if (autoBtn?.getAttribute('aria-pressed') === 'true') startAutoplay(); });
    row.addEventListener('focusout', () => { if (autoBtn?.getAttribute('aria-pressed') === 'true') startAutoplay(); });

    // update prev/next disabled states
    function updateButtons() {
      if (!prevBtn || !nextBtn) return;
      prevBtn.disabled = row.scrollLeft <= 5;
      nextBtn.disabled = Math.ceil(row.scrollLeft + row.clientWidth) >= row.scrollWidth - 5;
      prevBtn.style.opacity = prevBtn.disabled ? 0.45 : 1;
      nextBtn.style.opacity = nextBtn.disabled ? 0.45 : 1;
    }
    row.addEventListener('scroll', () => requestAnimationFrame(updateButtons));
    window.addEventListener('resize', () => requestAnimationFrame(updateButtons));
    updateButtons();

    // set up click-to-open lightbox for each card's image with correct index
    cards.forEach((card, idx) => {
      const img = card.querySelector('img');
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(rowId, idx);
      });
    });

    // optionally start autoplay if auto button has pressed true initially
    if (autoBtn && autoBtn.getAttribute('aria-pressed') === 'true') startAutoplay();
  }

});


 // POP UP

 // Lightbox for supporting images: click to open, prev/next within the same row,
// ESC to close, click overlay to close. Works for multiple supporting rows.

document.addEventListener('DOMContentLoaded', () => {
  // create lightbox DOM once
  const lb = document.createElement('div');
  lb.className = 'lb-overlay';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = `
    <button class="lb-close" aria-label="Close">×</button>
    <button class="lb-prev" aria-label="Previous">‹</button>
    <div class="lb-panel" role="document">
      <img class="lb-image" src="" alt="" />
      <div class="lb-caption" aria-live="polite"></div>
    </div>
    <button class="lb-next" aria-label="Next">›</button>
  `;
  document.body.appendChild(lb);

  const lbImage = lb.querySelector('.lb-image');
  const lbCaption = lb.querySelector('.lb-caption');
  const btnClose = lb.querySelector('.lb-close');
  const btnPrev = lb.querySelector('.lb-prev');
  const btnNext = lb.querySelector('.lb-next');

  // state: current row images and index
  let state = { images: [], idx: 0, prevActive: null };

  // helper: open lightbox with images array and index
  function openLightbox(images, index, triggerEl = null) {
    state.images = images;
    state.idx = index;
    state.prevActive = document.activeElement;
    render();
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll
    btnClose.focus();
  }

  function closeLightbox() {
    lb.setAttribute('aria-hidden', 'true');
    lbImage.src = '';
    lbImage.alt = '';
    lbCaption.textContent = '';
    document.body.style.overflow = '';
    // restore previous focus if available
    try { state.prevActive && state.prevActive.focus(); } catch (e) {}
    state = { images: [], idx: 0, prevActive: null };
  }

  function render() {
    const img = state.images[state.idx];
    if (!img) return;
    lbImage.src = img.src;
    lbImage.alt = img.alt || '';
    lbCaption.textContent = `${state.idx + 1} / ${state.images.length}`;
  }

  // prev/next
  function prev() {
    if (!state.images.length) return;
    state.idx = (state.idx - 1 + state.images.length) % state.images.length;
    render();
  }
  function next() {
    if (!state.images.length) return;
    state.idx = (state.idx + 1) % state.images.length;
    render();
  }

  // events on lightbox controls
  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  // click overlay to close (but ignore clicks inside panel)
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // keyboard handling
  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
  });

  // wire up all support-card images
  // For each supporting-row, gather its images; clicking one opens lightbox with that row's images
  const rows = Array.from(document.querySelectorAll('.supporting-row'));
  rows.forEach(row => {
    const imgs = Array.from(row.querySelectorAll('img'));
    // build image objects with src/alt
    const images = imgs.map(img => ({ src: img.src, alt: img.alt || '' }));

    // click on any image
    row.addEventListener('click', (e) => {
      const card = e.target.closest('.support-card');
      if (!card) return;
      const imgEl = card.querySelector('img');
      if (!imgEl) return;
      const idx = images.findIndex(i => i.src === imgEl.src);
      if (idx >= 0) openLightbox(images, idx, imgEl);
    });

    // allow keyboard activation: Enter / Space on focused .support-card
    row.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (active && active.classList && active.classList.contains('support-card')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const imgEl = active.querySelector('img');
          const idx = images.findIndex(i => i.src === imgEl.src);
          if (idx >= 0) openLightbox(images, idx, imgEl);
        }
      }
    });

    // ensure each card is focusable
    row.querySelectorAll('.support-card').forEach(c => {
      if (!c.hasAttribute('tabindex')) c.setAttribute('tabindex', '0');
    });
  });

});

 /* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    FOR CONTACT PAGE
     ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
// script.js — Formspree integration + hamburger/menu + form handling
// Endpoint already set to your Formspree URL.

document.addEventListener('DOMContentLoaded', () => {
  // ---------- UI: year + nav/hamburger behavior ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const backdrop = document.getElementById('backdrop');
  const mainNav = document.getElementById('mainNav');

  function openMenu() {
    if (mobileNav) mobileNav.classList.add('show');
    if (backdrop) backdrop.classList.add('show');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (mobileNav) mobileNav.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu(); else openMenu();
    });
  }

  if (backdrop) backdrop.addEventListener('click', () => closeMenu());

  document.addEventListener('click', (ev) => {
    if (!mobileNav) return;
    const isOpen = mobileNav.classList.contains('show');
    if (!isOpen) return;
    const target = ev.target;
    if (!mobileNav.contains(target) && !(hamburger && hamburger.contains(target))) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  if (mobileNav) {
    mobileNav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) setTimeout(() => closeMenu(), 120);
    });
  }

  function handleResize() {
    const desktopBreakpoint = 1024;
    if (window.innerWidth >= desktopBreakpoint) {
      closeMenu();
      if (mainNav) mainNav.style.display = 'flex';
    } else {
      if (mainNav) mainNav.style.display = '';
    }
  }
  window.addEventListener('resize', handleResize);
  handleResize();

  // ---------- FORMSPREE submit handling ----------
  const form = document.getElementById('contactForm');
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn && form) clearBtn.addEventListener('click', () => form.reset());

  if (!form) return;

  // Your Formspree endpoint
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xyzrjdez';

  // Optional: fallback mailto
  const MAILTO_FALLBACK = 'deleondianarafaela@gmail.com';
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation + honeypot
    const gotcha = form.querySelector('input[name="_gotcha"]')?.value || '';
    if (gotcha.trim() !== '') {
      console.warn('Honeypot triggered, ignoring submission.');
      return;
    }

    const name = (form.name && form.name.value.trim()) || '';
    const email = (form.email && form.email.value.trim()) || '';
    const subject = (form.subject && form.subject.value.trim()) || 'Contact from website';
    const message = (form.message && form.message.value.trim()) || '';

    if (!name) { alert('Please enter your name.'); form.name.focus(); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email.'); form.email.focus(); return; }

    // Build FormData (Formspree expects form fields)
    const fd = new FormData();
    fd.append('name', name);
    fd.append('email', email);
    fd.append('subject', subject);
    fd.append('message', message);
    fd.append('_replyto', email);

    // Disable submit to prevent double sends
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        alert('Message sent — thank you!');
        form.reset();
        closeMenu();
      } else {
        console.error('Formspree error', res.status, json);
        const msg = (json && json.error) ? json.error : `Failed to send (${res.status})`;
        const tryMail = confirm(`${msg}\n\nWould you like to open your mail client as a fallback?`);
        if (tryMail) {
          const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
          window.location.href = `mailto:${MAILTO_FALLBACK}?subject=${encodeURIComponent(subject)}&body=${body}`;
        } else {
          alert('Failed to send message. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Network/submit error', err);
      const tryMail = confirm('Network error while sending. Open your mail client as a fallback?');
      if (tryMail) {
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:${MAILTO_FALLBACK}?subject=${encodeURIComponent(subject)}&body=${body}`;
      } else {
        alert('Failed to send message. Please try again later.');
      }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
    }
  });

});

 /* -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    ABOUT
     ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
