const portfolio = {
  name: 'AliEbrahimi',
  title: 'Frontend Developer',
  years: 3,
  email: 'alicloudcode@gmail.com',
  location: 'Iran - Isfahan',

  nav: [
    { id: 'home', label: 'Home', icon: 'fa-home' },
    { id: 'about', label: 'About', icon: 'fa-user' },
    { id: 'services', label: 'Services', icon: 'fa-briefcase' },
    { id: 'projects', label: 'Projects', icon: 'fa-code' },
    { id: 'articles', label: 'Blog', icon: 'fa-newspaper' },
    { id: 'social', label: 'Social', icon: 'fa-share-nodes' },
    { id: 'contact', label: 'Contact', icon: 'fa-envelope' },
  ],

  hero: {
    badge: 'Available for new projects',
    greeting: "Hi, I'm",
    role: 'Frontend developer',
    tagline: 'crafting performant, scalable website with modern technologies and clean architecture.',
  },

  stats: [
    { icon: 'fa-calendar-check', value: 3, label: 'Years Experience', trend: '+1 this year', color: '#007AFF' },
    { icon: 'fa-rocket', value: 'Soon', label: 'Projects Completed', trend: 'Coming soon', color: '#30D158' },
    { icon: 'fa-star', value: 'Soon', label: 'GitHub Stars', trend: 'Coming soon', color: '#FFD60A' },
    { icon: 'fa-mug-hot', value: 'Soon', label: 'Donate', trend: 'Always welcome', color: '#BF5AF2' },
  ],

  skills: [
    { name: 'JavaScript / TypeScript', pct: 63, icon: 'fa-js' },
    { name: 'HTML / CSS', pct: 89, icon: 'fa-html5' },
    { name: 'Node.js / Express', pct: 49, icon: 'fa-node-js' },
    { name: 'React / Next.js', pct: 55, icon: 'fa-react' },
    { name: 'Linux / DevOps', pct: 'Learning', icon: 'fa-linux' },
  ],

  skillTags: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'HTML', 'CSS', 'Linux', 'SQLite'],

  timeline: [
    { date: 'Year 2025', role: 'Discovered HTML and CSS', company: 'Finca', desc: 'Completed an HTML CSS course with a score of 93 out of 100.' },
    { date: '2025 — 2026', role: 'Learning hack & security + JavaScript', company: 'Aiorlern & Finca', desc: 'Started learning hacking, security, and JavaScript. Currently training professionally.' },
    { date: '2026', role: 'Building a personal website', company: 'WebDev', desc: 'Worked on this portfolio site for about 2 months, creating a personal website and introduction.' },
    { date: 'Not posted yet', role: 'Not posted yet', company: 'GitHub', desc: 'Not posted yet.' },
  ],

  services: [
    { icon: 'fa-code', title: 'Frontend Development', desc: 'End-to-end Website development using modern frameworks and best practices.', color: '#007AFF' },
    { icon: 'fa-linux', title: 'Linux Administration', desc: 'Learning', color: '#FFD60A' },
    { icon: 'fa-paint-brush', title: 'UX & UI', desc: 'Learning with Figma.', color: '#BF5AF2' },
    { icon: 'fa-shield-halved', title: 'Security Consulting', desc: 'Code audits, penetration testing and security best practices implementation.', color: '#5AC8FA' },
  ],

  projects: [
    { title: 'Not currently posted', desc: 'Not currently posted.', category: 'web', status: 'Live' },
  ],

  articles: [
    { title: 'Not currently posted', category: 'Code', desc: 'Not currently posted.', icon: 'fa-react' },
    { title: 'Not currently posted', category: 'Linux', desc: 'Not currently posted.', icon: 'fa-linux' },
    { title: 'Not currently posted', category: 'Docker', desc: 'Not currently posted.', icon: 'fa-docker' },
  ],

  socials: [
    { icon: 'fa-github', label: 'GitHub', handle: '@AliCloud-Code', url: 'https://github.com/AliCloud-Code', color: '#f0f6fc' },
    { icon: 'fa-discord', label: 'Discord', handle: 'alicloud1', url: 'https://discord.com/users/alicloud1', color: '#5865F2' },
    { icon: 'fa-telegram', label: 'Telegram', handle: '@A0L0I0X', url: 'https://t.me/A0L0I0X', color: '#26A5E4' },
    { icon: 'fa-instagram', label: 'Instagram', handle: '@Soon', url: 'https://instagram.com', color: '#E4405F' },
    { icon: 'fa-x-twitter', label: 'X / Twitter', handle: '@AliCloudCode', url: 'https://x.com/AliCloudCode', color: '#f0f0f0' },
    { icon: 'fa-linkedin-in', label: 'LinkedIn', handle: 'soon', url: 'https://linkedin.com', color: '#0A66C2' },
    { icon: 'fa-dev', label: 'Dev.to', handle: '@alicloud-code', url: 'https://dev.to/alicloud-code', color: '#3B49DF' },
    { icon: 'fa-envelope', label: 'Email', handle: 'alicloudcode@gmail.com', url: 'mailto:alicloudcode@gmail.com', color: '#EA4335' },
  ],

  contactMethods: [
    { icon: 'fa-envelope', title: 'Email', detail: 'alicloudcode@gmail.com', url: 'mailto:alicloudcode@gmail.com' },
    { icon: 'fa-discord', title: 'Discord', detail: 'Quick chat', url: 'https://discord.com/users/alicloud1' },
    { icon: 'fa-telegram', title: 'Telegram', detail: 'Instant message', url: 'https://t.me/A0L0I0X' },
    { icon: 'fa-map-marker-alt', title: 'Location', detail: 'Iran - Isfahan', url: null },
  ],

  footerSocials: [
    { icon: 'fa-github', url: 'https://github.com/AliCloud-Code' },
    { icon: 'fa-linkedin-in', url: 'https://linkedin.com' },
    { icon: 'fa-x-twitter', url: 'https://x.com/AliCloudCode' },
    { icon: 'fa-discord', url: 'https://discord.com/users/alicloud1' },
  ],
};

export default portfolio;