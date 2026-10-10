import { getUser } from '@netlify/identity';

document.addEventListener('DOMContentLoaded', async () => {
  const authNavBtn = document.getElementById('auth-nav-btn');
  if (!authNavBtn) return;

  if (authNavBtn.dataset.bound === 'true') return;
  authNavBtn.dataset.bound = 'true';

  const updateButtonState = (user) => {
    if (user) {
      authNavBtn.textContent = 'Dashboard';
      authNavBtn.href = 'dashboard.html';
      authNavBtn.removeAttribute('data-netlify-identity-button');
    } else {
      authNavBtn.textContent = 'Log In';
      authNavBtn.href = '#login';
      authNavBtn.setAttribute('data-netlify-identity-button', 'true');
    }
  };

  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', user => {
      updateButtonState(user);
    });
    window.netlifyIdentity.on('login', user => {
      document.location.href = 'dashboard.html';
    });
    window.netlifyIdentity.on('logout', () => {
      updateButtonState(null);
    });
    
    authNavBtn.addEventListener('click', (e) => {
      if (authNavBtn.hasAttribute('data-netlify-identity-button')) {
        e.preventDefault();
        window.netlifyIdentity.open();
      }
    });
  }

  try {
    const user = await getUser();
    updateButtonState(user);
  } catch (err) {
    console.error(err);
  }
});
