const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const form = document.querySelector('#subscribe-form');
const message = document.querySelector('#form-message');
const year = document.querySelector('#year');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

if (form && message) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput || !emailInput.value.trim()) {
      message.textContent = 'Please enter a valid email address.';
      return;
    }

    message.textContent = 'Thanks for subscribing! You are on the list.';
    form.reset();
  });
}
