// hamburger toggle
const hamburger = document.getElementById('hamburger');
const navList = document.querySelector('.nav ul');

if (hamburger && navList) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('open');
  });

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-shell') && navList.classList.contains('open')) {
      navList.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// set footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
