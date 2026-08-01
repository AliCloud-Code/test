const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ============================================
// AUTO-INSTALL & AUTO-BUILD
// ============================================
const CLIENT_DIR = path.join(__dirname, 'client');
const CLIENT_DIST = path.join(CLIENT_DIR, 'dist');

const run = (cmd, cwd) => {
  console.log(`  → ${cmd}`);
  try { execSync(cmd, { cwd, stdio: 'pipe' }); return true; }
  catch (e) { console.error(`  ✗ Failed: ${e.stderr?.toString()?.slice(0, 200) || e.message}`); return false; }
};

if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('[SETUP] Installing root dependencies...');
  if (!run('npm install --omit=dev', __dirname)) {
    console.error('[SETUP] Root install failed. Exiting.');
    process.exit(1);
  }
}

if (!fs.existsSync(path.join(CLIENT_DIR, 'node_modules'))) {
  console.log('[SETUP] Installing client dependencies...');
  if (!run('npm install', CLIENT_DIR)) {
    console.error('[SETUP] Client install failed. Exiting.');
    process.exit(1);
  }
}

if (!fs.existsSync(CLIENT_DIST) || process.env.FORCE_BUILD === 'true') {
  console.log('[SETUP] Building React client...');
  if (!run('npx vite build', CLIENT_DIR)) {
    console.warn('[SETUP] Client build failed. Falling back.');
    console.warn('[SETUP] Run: cd client && npm install && npx vite build');
  }
}

// ============================================
// REQUIRE AFTER AUTO-INSTALL
// ============================================
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Google OAuth config — use env vars for production, hardcoded for dev
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ============================================
// DATA STORAGE PATHS
// ============================================
const DATA_DIR = path.join(__dirname, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readJSON = (filePath, defaultValue = []) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
  }
  return defaultValue;
};

const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// ============================================
// RANDOM ADMIN PATH
// ============================================
let ADMIN_PATH = process.env.ADMIN_PATH || '';
if (!ADMIN_PATH) {
  try {
    if (fs.existsSync(ADMIN_CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf8'));
      ADMIN_PATH = config.adminPath || '';
    }
  } catch (e) { /* ignore */ }
  if (!ADMIN_PATH) {
    ADMIN_PATH = '/admin-' + crypto.randomBytes(16).toString('hex');
    try {
      writeJSON(ADMIN_CONFIG_FILE, { adminPath: ADMIN_PATH, createdAt: new Date().toISOString() });
      console.log(`[SECURITY] Admin path generated: ${ADMIN_PATH}`);
    } catch (e) { /* ignore */ }
  }
}

// ============================================
// DATA INITIALIZATION
// ============================================
let messages = readJSON(MESSAGES_FILE, []);
const saveMessages = () => writeJSON(MESSAGES_FILE, messages);

let users = readJSON(USERS_FILE, []);
if (users.length === 0) {
  const hash = bcrypt.hashSync('Admin@Portfolio2026!', bcrypt.genSaltSync(12));
  users.push({
    id: uuidv4(),
    username: 'admin',
    passwordHash: hash,
    role: 'admin',
    provider: 'local',
    createdAt: new Date().toISOString()
  });
  writeJSON(USERS_FILE, users);
}

// ============================================
// 0. TRUST PROXY
// ============================================
app.set('trust proxy', 1);

// ============================================
// 1. SECURITY HEADERS (Helmet)
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://lh3.googleusercontent.com", "https://*.googleusercontent.com"],
      connectSrc: ["'self'", "https://api.github.com", "https://accounts.google.com", "https://*.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
  dnsPrefetchControl: { allow: false },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// ============================================
// 2. SESSION & COOKIE PARSER
// ============================================
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');
const cookieSecret = process.env.COOKIE_SECRET || crypto.randomBytes(64).toString('hex');

app.use(cookieParser(cookieSecret));

app.use(session({
  secret: sessionSecret,
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ============================================
// 3. PASSPORT (Google OAuth)
// ============================================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/api/auth/google/callback`,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    users = readJSON(USERS_FILE, []);
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value || `${googleId}@google.com`;
    const displayName = profile.displayName || email.split('@')[0];

    // Check if user already exists by Google ID
    let user = users.find(u => u.googleId === googleId);

    if (!user) {
      // Create new user from Google profile
      user = {
        id: uuidv4(),
        googleId: googleId,
        username: displayName,
        email: email,
        avatar: profile.photos?.[0]?.value || null,
        role: 'user',
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      writeJSON(USERS_FILE, users);
      console.log(`[GOOGLE AUTH] New user registered: ${displayName} (${email})`);
    } else {
      // Update existing user's info
      user.username = displayName;
      user.email = email;
      user.avatar = profile.photos?.[0]?.value || user.avatar;
      writeJSON(USERS_FILE, users);
      console.log(`[GOOGLE AUTH] User logged in: ${displayName} (${email})`);
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.id === id);
  done(null, user || null);
});

// ============================================
// 4. CSRF PROTECTION
// ============================================
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
});

const csrfProtection = (req, res, next) => {
  if (req.path === '/api/auth/login' || req.path.startsWith('/api/auth/google')) return next();
  const token = req.headers['x-csrf-token'] || req.body?._csrf;
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token.' });
  }
  next();
};

// ============================================
// 5. RATE LIMITING
// ============================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { status: 'error', message: 'Too many requests.' },
  standardHeaders: true, legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 60,
  message: { status: 'error', message: 'Too many API requests.' },
  standardHeaders: true, legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { status: 'error', message: 'Too many login attempts.' },
  standardHeaders: true, legacyHeaders: false
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: { status: 'error', message: 'Too many messages.' },
  standardHeaders: true, legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30,
  message: { status: 'error', message: 'Too many admin requests.' },
  standardHeaders: true, legacyHeaders: false
});

app.use(globalLimiter);
app.use('/api/', apiLimiter);

// ============================================
// 6. DATA SANITIZATION
// ============================================
app.use(mongoSanitize({ replaceWith: '_' }));

const deepSanitize = (obj) => {
  if (typeof obj === 'string') {
    return xss(obj, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script', 'style'] });
  }
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (typeof obj === 'object' && obj !== null && obj.constructor === Object) {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) sanitized[key] = deepSanitize(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) req.body = deepSanitize(req.body);
  if (req.query) req.query = deepSanitize(req.query);
  if (req.params) req.params = deepSanitize(req.params);
  next();
});

app.use(hpp({ whitelist: [] }));

// ============================================
// 7. REQUEST PARSING
// ============================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================
// 8. COMPRESSION
// ============================================
app.use(compression({ level: 6, threshold: 1024 }));

// ============================================
// 9. LOGGING
// ============================================
app.use(isProduction ? morgan('combined') : morgan('dev'));

// ============================================
// 10. CUSTOM SECURITY MIDDLEWARE
// ============================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// ============================================
// 11. STATIC FILES
// ============================================
const useReactBuild = fs.existsSync(CLIENT_DIST);

app.use((req, res, next) => {
  const blocked = ['.env', '.git', 'node_modules', 'package.json', 'package-lock.json', '.htaccess', 'config.js', 'secret', 'data/'];
  if (blocked.some(b => req.path.toLowerCase().includes(b))) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});

if (useReactBuild) {
  app.use('/assets', express.static(path.join(CLIENT_DIST, 'assets'), {
    dotfiles: 'deny',
    etag: true,
    index: false,
    fallthrough: false,
    maxAge: isProduction ? '7d' : 0,
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(css|js)$/)) {
        res.set('Cache-Control', `public, max-age=${isProduction ? 604800 : 0}, immutable`);
      }
    }
  }));
}

// ============================================
// 12. AUTH MIDDLEWARE
// ============================================
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized. Please login first.' });
};

// ============================================
// 13. API ROUTES - HEALTH
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: isProduction ? 'production' : 'development',
    version: '4.0.0',
    clientBuilt: useReactBuild
  });
});

// ============================================
// 14. AUTH ROUTES — Local
// ============================================
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });
  if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Invalid input type.' });
  if (username.length > 50 || password.length > 100) return res.status(400).json({ error: 'Input too long.' });

  const user = users.find(u => u.username === username.toLowerCase().trim());
  if (!user) {
    bcrypt.compareSync(password, '$2a$12$0000000000000000000000000000000000000000000000000000000');
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const oldSession = req.session;
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error.' });
    req.session.csrfToken = oldSession.csrfToken;
    req.session.isAdmin = true;
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.loginTime = Date.now();
    req.session.save(() => {
      res.json({ success: true, user: { username: user.username, role: user.role } });
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Logged out.' });
  });
});

app.get('/api/auth/check', (req, res) => {
  res.json({
    authenticated: !!(req.session && req.session.isAdmin),
    username: req.session?.username
  });
});

// ============================================
// 15. AUTH ROUTES — Google OAuth
// ============================================
app.get('/api/auth/google',
  (req, res, next) => {
    req.session.googleRedirect = req.query.redirect || '/';
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/?login=failed' }),
  (req, res) => {
    const oldSession = req.session;
    req.session.regenerate((err) => {
      if (err) return res.redirect('/?login=error');

      req.session.csrfToken = oldSession.csrfToken;
      req.session.isAdmin = true;
      req.session.userId = req.user.id;
      req.session.username = req.user.username;
      req.session.role = req.user.role;
      req.session.googleId = req.user.googleId;
      req.session.avatar = req.user.avatar;
      req.session.loginTime = Date.now();

      req.session.save(() => {
        const redirect = oldSession.googleRedirect || '/';
        res.redirect(`${redirect}?login=success`);
      });
    });
  }
);

// ============================================
// 16. USER PROFILE ENDPOINT
// ============================================
app.get('/api/auth/user', (req, res) => {
  if (req.session && req.session.userId) {
    const user = users.find(u => u.id === req.session.userId);
    if (user) {
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        provider: user.provider
      });
    }
  }
  res.json(null);
});

// ============================================
// 17. CONTACT FORM
// ============================================
app.post('/api/contact', contactLimiter, (req, res) => {
  const { name, email, subject, message } = req.body || {};
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) errors.push('Name must be 2-100 characters.');
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 200) errors.push('Valid email required.');
  if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) errors.push('Message must be 10-5000 characters.');
  if (errors.length > 0) return res.status(400).json({ error: 'Validation failed.', details: errors });

  const newMessage = {
    id: uuidv4(), name: name.trim(), email: email.toLowerCase().trim(),
    subject: (subject && typeof subject === 'string') ? subject.trim() : 'No subject',
    message: message.trim(), read: false,
    ip: req.ip, userAgent: req.get('user-agent') || 'Unknown',
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  saveMessages();
  res.status(201).json({ success: true, message: 'Thank you! Your message has been received.', id: newMessage.id });
});

// ============================================
// 18. ADMIN API ROUTES (Protected + CSRF)
// ============================================
app.get('/api/admin/messages', requireAdmin, adminLimiter, (req, res) => {
  messages = readJSON(MESSAGES_FILE, []);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(5, parseInt(req.query.limit) || 20));
  const filter = req.query.filter || 'all';
  let filtered = [...messages];
  if (filter === 'unread') filtered = filtered.filter(m => !m.read);
  if (filter === 'read') filtered = filtered.filter(m => m.read);
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = filtered.length, totalPages = Math.ceil(total / limit);
  const paged = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);
  res.json({ messages: paged, pagination: { page, limit, total, totalPages, hasMore: page < totalPages } });
});

app.patch('/api/admin/messages/:id/read', csrfProtection, requireAdmin, adminLimiter, (req, res) => {
  messages = readJSON(MESSAGES_FILE, []);
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found.' });
  msg.read = !msg.read;
  saveMessages();
  res.json({ success: true, read: msg.read });
});

app.delete('/api/admin/messages/:id', csrfProtection, requireAdmin, adminLimiter, (req, res) => {
  messages = readJSON(MESSAGES_FILE, []);
  const idx = messages.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Message not found.' });
  messages.splice(idx, 1);
  saveMessages();
  res.json({ success: true, message: 'Message deleted.' });
});

app.delete('/api/admin/messages', csrfProtection, requireAdmin, adminLimiter, (req, res) => {
  messages = [];
  saveMessages();
  res.json({ success: true, message: 'All messages deleted.' });
});

app.get('/api/admin/stats', requireAdmin, adminLimiter, (req, res) => {
  messages = readJSON(MESSAGES_FILE, []);
  const today = new Date().toISOString().split('T')[0];
  res.json({ total: messages.length, unread: messages.filter(m => !m.read).length, todayCount: messages.filter(m => m.createdAt.startsWith(today)).length });
});

// ============================================
// 19. SPA FALLBACK
// ============================================
const serveSpaIndex = (req, res) => {
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(503).send('Client not built. Run: cd client && npx vite build');
  }

  let html = fs.readFileSync(indexPath, 'utf8');
  const adminScript = `<script>window.__ADMIN_PATH = "${ADMIN_PATH}";</script>`;
  html = html.replace('</head>', `${adminScript}\n</head>`);

  res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
  res.send(html);
};

app.get('/', serveSpaIndex);
app.get(ADMIN_PATH, serveSpaIndex);
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  serveSpaIndex(req, res);
});

// ============================================
// 20. ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  if (statusCode >= 500) console.error('Server Error:', err.message, req.originalUrl);
  res.status(statusCode).json({ error: isProduction ? 'Internal Server Error' : err.message });
});

// ============================================
// 21. START SERVER
// ============================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`  Portfolio Server v4.0.0`);
  console.log(`  URL:        http://0.0.0.0:${PORT}`);
  console.log(`  Admin:      http://0.0.0.0:${PORT}${ADMIN_PATH}`);
  console.log(`  Mode:       ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`  Client:     ${useReactBuild ? 'React Build (dist/)' : 'Not built'}`);
  console.log(`  Google OAuth: ${GOOGLE_CLIENT_ID ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`  CSRF: ACTIVE | CSP: ACTIVE | RateLimit: ACTIVE`);
  console.log('='.repeat(50));
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(() => { console.log('Server closed.'); process.exit(0); });
  setTimeout(() => { console.error('Forced shutdown.'); process.exit(1); }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  server.close(() => process.exit(1));
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason instanceof Error ? reason.message : reason);
});

module.exports = app;
