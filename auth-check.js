import { getUser } from '@netlify/identity';

document.addEventListener('DOMContentLoaded', async () => {
  const authNavBtn = document.getElementById('auth-nav-btn');
  if (!authNavBtn) return;
  try {
    const user = await getUser();
    if (user) {
      authNavBtn.textContent = 'Dashboard';
      authNavBtn.href = 'dashboard.html';
    }
  } catch (err) {
    console.error(err);
  }
});
