const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const year = document.querySelector('#year');
const communityLinks = {
  discord: 'https://discord.gg/your-invite-code',
  robloxGroup: 'https://www.roblox.com/communities/00000000/your-group-name#!/about',
  youtube: 'https://www.youtube.com/@yourchannel',
  tiktok: 'https://www.tiktok.com/@yourname'
};

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

const linkBindings = [
  ['discord-link', communityLinks.discord],
  ['roblox-group-link', communityLinks.robloxGroup],
  ['youtube-link', communityLinks.youtube],
  ['tiktok-link', communityLinks.tiktok]
];

linkBindings.forEach(([id, url]) => {
  const link = document.getElementById(id);
  if (link && url) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
});
