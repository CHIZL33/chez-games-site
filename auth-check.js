import { getUser } from '@netlify/identity';

document.addEventListener('DOMContentLoaded', async () => {
  const authNavBtn = document.getElementById('auth-nav-btn');
  
  // Initialize Netlify Identity Widget if available
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', user => {
      if (user) {
        if (authNavBtn) {
          authNavBtn.textContent = 'Dashboard';
          authNavBtn.href = 'dashboard.html';
          authNavBtn.removeAttribute('data-netlify-identity-button');
        }
      }
    });
    window.netlifyIdentity.on('login', user => {
      document.location.href = 'dashboard.html';
    });
    window.netlifyIdentity.on('logout', () => {
      if (authNavBtn) {
        authNavBtn.textContent = 'Log In / Sign Up';
        authNavBtn.href = '#login';
        authNavBtn.setAttribute('data-netlify-identity-button', 'true');
      }
    });
    
    if (authNavBtn && authNavBtn.hasAttribute('data-netlify-identity-button')) {
      authNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.netlifyIdentity.open();
      });
    }
  }

  try {
    const user = await getUser();
    if (user) {
      if (authNavBtn) {
        authNavBtn.textContent = 'Dashboard';
        authNavBtn.href = 'dashboard.html';
      }
    }
  } catch (err) {
    console.error(err);
  }
});
