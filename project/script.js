/* ===================================================
   Al Ewan Al Hadith - Main Script
   =================================================== */

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  scrollTopBtn.classList.toggle('show', window.scrollY > 400);
});

// ===== MOBILE MENU BUTTON =====
const menuBtn  = document.getElementById('menuBtn');
const navMenu  = document.getElementById('navMenu');

menuBtn.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', isOpen);
});

// Close menu when a link is clicked
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  });
});

// Close menu when clicking outside
document.addEventListener('click', e => {
  if (!header.contains(e.target)) {
    navMenu.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  }
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}
window.addEventListener('scroll', updateActiveLink);

// ===== ANIMATED COUNTERS =====
const statNums = document.querySelectorAll('.stat-num');
let countersStarted = false;

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step     = target / (duration / 16);
  let current    = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

function checkCounters() {
  if (countersStarted) return;
  const statsSection = document.getElementById('stats');
  if (!statsSection) return;
  if (statsSection.getBoundingClientRect().top < window.innerHeight - 80) {
    countersStarted = true;
    statNums.forEach(animateCounter);
  }
}
window.addEventListener('scroll', checkCounters);
checkCounters();

// ===== PROJECT MODAL =====
const modal       = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose  = document.getElementById('modalClose');
const modalImg    = document.getElementById('modalImg');
const modalTitle  = document.getElementById('modalTitle');
const modalDesc   = document.getElementById('modalDesc');

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    modalImg.src          = card.dataset.img;
    modalImg.alt          = card.dataset.title;
    modalTitle.textContent = card.dataset.title;
    modalDesc.textContent  = card.dataset.desc;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== CONTACT FORM VALIDATION =====
const form       = document.getElementById('contactForm');
const successMsg = document.getElementById('successMsg');

function showError(fieldId, errId, msg) {
  document.getElementById(fieldId).classList.add('error');
  document.getElementById(errId).textContent = msg;
}
function clearError(fieldId, errId) {
  document.getElementById(fieldId).classList.remove('error');
  document.getElementById(errId).textContent = '';
}

function validateForm() {
  let valid = true;

  const name = document.getElementById('name').value.trim();
  if (!name) { showError('name', 'nameErr', 'الاسم مطلوب'); valid = false; }
  else clearError('name', 'nameErr');

  const phone = document.getElementById('phone').value.trim();
  if (!phone) { showError('phone', 'phoneErr', 'رقم الهاتف مطلوب'); valid = false; }
  else if (!/^[0-9+\s\-]{7,15}$/.test(phone)) { showError('phone', 'phoneErr', 'رقم الهاتف غير صحيح'); valid = false; }
  else clearError('phone', 'phoneErr');

  const email = document.getElementById('email').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', 'emailErr', 'البريد الإلكتروني غير صحيح'); valid = false; }
  else clearError('email', 'emailErr');

  const subject = document.getElementById('subject').value.trim();
  if (!subject) { showError('subject', 'subjectErr', 'الموضوع مطلوب'); valid = false; }
  else clearError('subject', 'subjectErr');

  const message = document.getElementById('message').value.trim();
  if (!message) { showError('message', 'messageErr', 'الرسالة مطلوبة'); valid = false; }
  else if (message.length < 10) { showError('message', 'messageErr', 'الرسالة قصيرة جداً'); valid = false; }
  else clearError('message', 'messageErr');

  return valid;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validateForm()) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'جارٍ الإرسال...';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.reset();
      successMsg.textContent = '✅ تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.';
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 6000);
    } else {
      const data = await response.json();
      const msg = data?.errors?.map(e => e.message).join(', ') || 'حدث خطأ، يرجى المحاولة مجدداً.';
      successMsg.textContent = '❌ ' + msg;
      successMsg.style.background = '#fdecea';
      successMsg.style.borderColor = '#f5c6cb';
      successMsg.style.color = '#c0392b';
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 6000);
    }
  } catch {
    successMsg.textContent = '❌ تعذّر الإرسال، تحقق من اتصالك بالإنترنت.';
    successMsg.style.background = '#fdecea';
    successMsg.style.borderColor = '#f5c6cb';
    successMsg.style.color = '#c0392b';
    successMsg.classList.add('show');
    setTimeout(() => successMsg.classList.remove('show'), 6000);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'إرسال الرسالة';
  }
});

['name', 'phone', 'email', 'subject', 'message'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('error');
    const errEl = document.getElementById(id + 'Err');
    if (errEl) errEl.textContent = '';
  });
});

// ===== SCROLL TO TOP =====
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll(
  '.service-card, .why-card, .project-card, .stat-item, .feature-item, .about-img-wrap'
);
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});
