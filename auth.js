import {
  login,
  signup,
  getUser,
  handleAuthCallback,
  requestPasswordRecovery,
  updateUser,
  AuthError,
  MissingIdentityError
} from 'https://esm.sh/@netlify/identity@2.0.0';

const navBtn = document.getElementById('auth-nav-btn');
const modal = document.getElementById('auth-modal');
const form = document.getElementById('auth-form');
const title = document.getElementById('auth-title');
const subtitle = document.getElementById('auth-subtitle');
const nameField = document.getElementById('auth-name-field');
const passwordField = document.getElementById('auth-password-field');
const submitBtn = document.getElementById('auth-submit');
const message = document.getElementById('auth-message');
const tabs = modal ? modal.querySelectorAll('[data-auth-tab]') : [];
const forgotLink = document.getElementById('auth-forgot');

const MODES = {
  login: { title: 'Welcome back', subtitle: 'Log in to your Chez Games account.', submit: 'Log In' },
  signup: { title: 'Create an account', subtitle: 'Join the studio community in seconds.', submit: 'Sign Up' },
  recover: { title: 'Reset password', subtitle: 'We will email you a reset link.', submit: 'Send Reset Link' },
  reset: { title: 'Choose a new password', subtitle: 'Enter a new password for your account.', submit: 'Save Password' }
};

let mode = 'login';

function setNavState(user) {
  if (!navBtn) return;
  navBtn.textContent = user ? 'Dashboard' : 'Log In';
  navBtn.dataset.state = user ? 'user' : 'guest';
  navBtn.hidden = false;
}

function showMessage(text, type = 'error') {
  message.textContent = text;
  message.className = `auth-message ${type}`;
  message.hidden = !text;
}

function setMode(next) {
  mode = next;
  const config = MODES[next];
  title.textContent = config.title;
  subtitle.textContent = config.subtitle;
  submitBtn.textContent = config.submit;
  nameField.hidden = next !== 'signup';
  passwordField.hidden = next === 'recover';
  form.elements.email.closest('.field').hidden = next === 'reset';
  form.elements.email.required = next !== 'reset';
  form.elements.password.required = next !== 'recover';
  form.elements.password.autocomplete = next === 'login' ? 'current-password' : 'new-password';
  forgotLink.hidden = next !== 'login';
  tabs.forEach((tab) => {
    const active = tab.dataset.authTab === next;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.closest('.auth-tabs').hidden = next === 'recover' || next === 'reset';
  });
  showMessage('');
}

function openModal(next = 'login') {
  setMode(next);
  modal.hidden = false;
  document.body.classList.add('modal-open');
  const firstInput = modal.querySelector('.field:not([hidden]) input');
  if (firstInput) firstInput.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  form.reset();
  if (navBtn) navBtn.focus();
}

function friendlyError(error) {
  if (error instanceof MissingIdentityError) {
    return 'Accounts are not available right now. Please try again later.';
  }
  if (error instanceof AuthError) {
    if (error.status === 401 || error.status === 400) return 'Invalid email or password, or the email is not confirmed yet.';
    if (error.status === 403) return 'Sign ups are currently closed. Ask an admin for an invite.';
    if (error.status === 422) return error.message || 'Please check your email and password (min. 6 characters).';
    return error.message || 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

async function handleSubmit(event) {
  event.preventDefault();
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  const name = form.elements.name.value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Please wait…';
  showMessage('');

  try {
    if (mode === 'login') {
      await login(email, password);
      window.location.href = '/dashboard';
      return;
    }
    if (mode === 'signup') {
      const user = await signup(email, password, name ? { full_name: name } : undefined);
      if (user.emailVerified) {
        window.location.href = '/dashboard';
        return;
      }
      setMode('login');
      form.elements.email.value = email;
      showMessage('Account created! Check your inbox to confirm your email, then log in.', 'success');
      return;
    }
    if (mode === 'recover') {
      await requestPasswordRecovery(email);
      showMessage('If that account exists, a reset link is on its way.', 'success');
      return;
    }
    if (mode === 'reset') {
      await updateUser({ password });
      window.location.href = '/dashboard';
      return;
    }
  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = MODES[mode].submit;
  }
}

async function init() {
  if (!navBtn || !modal) return;

  navBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    if (navBtn.dataset.state === 'user') {
      window.location.href = '/dashboard';
    } else {
      openModal('login');
    }
  });

  tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.authTab)));
  forgotLink.addEventListener('click', (event) => {
    event.preventDefault();
    setMode('recover');
  });
  modal.querySelectorAll('[data-auth-close]').forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });
  form.addEventListener('submit', handleSubmit);

  try {
    const result = await handleAuthCallback();
    if (result?.type === 'recovery') {
      openModal('reset');
      return;
    }
    if (result?.user) {
      window.location.href = '/dashboard';
      return;
    }
  } catch (error) {
    openModal('login');
    showMessage(friendlyError(error));
  }

  setNavState(await getUser());
}

init();
