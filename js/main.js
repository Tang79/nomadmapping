/* Nomad Mapping - Main Application Logic */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initContactForm();
  highlightActiveNav();
});

// Mobile Navigation Toggle
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      }
    });
  }
}

// Highlight Active Nav Link based on Current URL
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Contact Form Handler
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    showNotification(`Thank you, ${name}! Your inquiry has been sent to nomadmapping@gmail.com. I will respond to ${email} as soon as possible.`);

    form.reset();
  });
}

// Custom Toast Notification System
function showNotification(message) {
  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background-color: #214E45;
    color: #FFFFFF;
    border-left: 5px solid #8FAF9A;
    padding: 1.1rem 1.6rem;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    z-index: 9999;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    max-width: 440px;
    animation: slideIn 0.3s ease-out;
  `;

  toast.innerHTML = `
    <div style="display:flex; align-items:flex-start; gap:0.85rem;">
      <i class="fa-solid fa-circle-check" style="color:#8FAF9A; font-size:1.4rem; margin-top:2px;"></i>
      <div>
        <strong style="display:block; margin-bottom:4px; font-family:'Roboto',sans-serif; color:#FFFFFF;">Conversation Started</strong>
        <span style="color:rgba(255,255,255,0.9); line-height:1.5; display:block;">${message}</span>
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}
