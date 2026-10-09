const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const year = document.querySelector('#year');

const defaults = {
  site: {
    brand: { text: 'Chez Games', href: '#' },
    navigation: [
      { label: 'Games', href: '#games' },
      { label: 'About', href: '#about' },
      { label: 'Community', href: '#community' },
      { label: 'Contact', href: '#contact' }
    ],
    hero: {
      eyebrow: 'Roblox game studio',
      title: 'New Roblox worlds are in the works.',
      lead: 'We are building our first Roblox experiences now. Follow along for dev updates, launch news, and community events.',
      actions: [
        { label: 'View Roadmap', href: '#games', style: 'primary' },
        { label: 'Community Links', href: '#community', style: 'secondary' }
      ],
      statusCard: {
        title: 'Studio Status',
        subtitle: 'Pre-launch phase',
        items: [
          'First game concept in production',
          'Discord community setup in progress',
          'Website updates posted regularly'
        ]
      }
    },
    games: {
      title: 'Games in development',
      lead: 'No released games yet — these are current project ideas.'
    },
    about: {
      title: 'Built by players, for players',
      body: 'Chez Games is focused on creating fun, social Roblox experiences. Community feedback will help shape each update from day one.',
      stats: [
        { value: '0', label: 'Released games (for now)' },
        { value: '100%', label: 'Built in Roblox Studio' },
        { value: 'Always', label: 'Community-first updates' }
      ]
    },
    community: {
      title: 'Join the community',
      lead: 'Use these links to connect with the studio and follow progress.'
    },
    links: {
      discord: 'https://discord.gg/your-invite-code',
      robloxGroup: 'https://www.roblox.com/communities/00000000/your-group-name#!/about',
      youtube: 'https://www.youtube.com/@yourchannel',
      tiktok: 'https://www.tiktok.com/@yourname'
    },
    contact: {
      email: 'contact@chezgames.com'
    }
  },
  comingSoon: {
    items: [
      {
        title: 'Project Rush',
        description: 'Competitive obstacle courses with speedrun leaderboards.',
        status: 'Prototype'
      },
      {
        title: 'Project Clash',
        description: 'Small-team arena battles focused on movement and strategy.',
        status: 'Concept'
      },
      {
        title: 'Project Build',
        description: 'Sandbox world-building with community challenges and events.',
        status: 'Planning'
      }
    ]
  }
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

function setText(id, value) {
  const element = document.getElementById(id);
  if (element && value) {
    element.textContent = value;
  }
}

function setLink(id, href, label) {
  const element = document.getElementById(id);
  if (!element || !href) {
    return;
  }
  element.href = href;
  if (label) {
    element.textContent = label;
  }
  if (/^https?:\/\//.test(href)) {
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
  } else {
    element.removeAttribute('target');
    element.removeAttribute('rel');
  }
}

function renderNavigation(links = []) {
  if (!nav || !Array.isArray(links) || !links.length) {
    return;
  }
  nav.innerHTML = '';
  links.forEach((link) => {
    if (!link?.label || !link?.href) {
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    nav.appendChild(anchor);
  });
}

function renderStatusItems(items = []) {
  const list = document.getElementById('hero-status-list');
  if (!list || !Array.isArray(items) || !items.length) {
    return;
  }
  list.innerHTML = '';
  items.forEach((item) => {
    if (!item) {
      return;
    }
    const listItem = document.createElement('li');
    listItem.textContent = item;
    list.appendChild(listItem);
  });
}

function renderAboutStats(stats = []) {
  const statList = document.getElementById('about-stats');
  if (!statList || !Array.isArray(stats) || !stats.length) {
    return;
  }
  statList.innerHTML = '';
  stats.forEach((stat) => {
    if (!stat?.value || !stat?.label) {
      return;
    }
    const wrapper = document.createElement('div');
    wrapper.setAttribute('role', 'listitem');

    const strong = document.createElement('strong');
    strong.textContent = stat.value;

    const span = document.createElement('span');
    span.textContent = stat.label;

    wrapper.append(strong, span);
    statList.appendChild(wrapper);
  });
}

function renderComingSoon(items = []) {
  const grid = document.getElementById('coming-soon-grid');
  if (!grid || !Array.isArray(items) || !items.length) {
    return;
  }

  grid.innerHTML = '';
  items.forEach((item) => {
    if (!item?.title || !item?.description) {
      return;
    }
    const article = document.createElement('article');
    article.className = 'card';

    const title = document.createElement('h3');
    title.textContent = item.title;

    const description = document.createElement('p');
    description.textContent = item.description;

    const status = document.createElement('p');
    status.className = 'status';
    status.textContent = `Status: ${item.status || 'Coming soon'}`;

    article.append(title, description, status);

    if (item.link?.href && item.link?.label) {
      const action = document.createElement('a');
      action.className = 'btn btn-secondary';
      action.href = item.link.href;
      action.textContent = item.link.label;
      if (/^https?:\/\//.test(item.link.href)) {
        action.target = '_blank';
        action.rel = 'noopener noreferrer';
      }
      article.appendChild(action);
    }

    grid.appendChild(article);
  });
}

function applySiteContent(site) {
  if (!site) {
    return;
  }

  setText('hero-eyebrow', site.hero?.eyebrow);
  setText('hero-title', site.hero?.title);
  setText('hero-lead', site.hero?.lead);
  setText('hero-card-title', site.hero?.statusCard?.title);
  setText('hero-card-subtitle', site.hero?.statusCard?.subtitle);
  renderStatusItems(site.hero?.statusCard?.items);

  setText('games-title', site.games?.title);
  setText('games-lead', site.games?.lead);

  setText('about-title', site.about?.title);
  setText('about-body', site.about?.body);
  renderAboutStats(site.about?.stats);

  setText('community-title', site.community?.title);
  setText('community-lead', site.community?.lead);

  setLink('hero-primary-action', site.hero?.actions?.[0]?.href, site.hero?.actions?.[0]?.label);
  setLink('hero-secondary-action', site.hero?.actions?.[1]?.href, site.hero?.actions?.[1]?.label);
  setLink('brand-link', site.brand?.href, site.brand?.text);

  renderNavigation(site.navigation);

  setLink('discord-link', site.links?.discord, 'Discord');
  setLink('roblox-group-link', site.links?.robloxGroup, 'Roblox Group');
  setLink('youtube-link', site.links?.youtube, 'YouTube');
  setLink('tiktok-link', site.links?.tiktok, 'TikTok');

  const email = site.contact?.email;
  if (email) {
    setLink('contact-email', `mailto:${email}`, email);
  }
}

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function loadContent() {
  const [site, comingSoon] = await Promise.all([
    loadJson('./content/site.json').catch(() => defaults.site),
    loadJson('./content/coming-soon.json').catch(() => defaults.comingSoon)
  ]);

  applySiteContent(site || defaults.site);
  renderComingSoon(comingSoon?.items || defaults.comingSoon.items);
}

loadContent();
