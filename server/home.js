const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 8787;
const HOST = process.env.HOST || '0.0.0.0';
const MAX_ACCOUNTS = 2;
const DATA_FILE = process.env.SCIOPTIMAL_DATA || path.join(__dirname, 'data', 'store.json');
const BUILD_DIR = path.join(__dirname, '..', 'build');
const MAX_BODY = 2_000_000;

const loginAttempts = new Map();

function emptyStore() {
  return { accounts: [], records: {}, sessions: {}, inviteCode: '' };
}

function inviteCode(store) {
  const fromEnv = String(process.env.SCIOPTIMAL_INVITE || '').trim().toLowerCase();
  if (fromEnv) return fromEnv;
  if (!store.inviteCode) {
    store.inviteCode = crypto.randomBytes(3).toString('hex');
    writeStore(store);
  }
  return store.inviteCode;
}

function clientKey(request) {
  const forwarded = request.headers['cf-connecting-ip'];
  if (typeof forwarded === 'string' && forwarded) return forwarded;
  return request.socket.remoteAddress || 'local';
}

function tooManyLogins(request) {
  const entry = loginAttempts.get(clientKey(request));
  return Boolean(entry && entry.reset > Date.now() && entry.fails >= 8);
}

function noteLoginFailure(request) {
  const key = clientKey(request);
  const entry = loginAttempts.get(key);
  if (!entry || entry.reset < Date.now()) {
    loginAttempts.set(key, { fails: 1, reset: Date.now() + 15 * 60 * 1000 });
    return;
  }
  entry.fails += 1;
}

function readStore() {
  try {
    return { ...emptyStore(), ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  } catch {
    return emptyStore();
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const parts = String(stored).split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const actual = Buffer.from(crypto.scryptSync(password, parts[1], 32).toString('hex'), 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function publicAccount(account) {
  return { id: account.id, name: account.name, email: account.email };
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function userFromRequest(store, request) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const session = store.sessions[tokenHash(token)];
  if (!session || session.expires < Date.now()) return null;
  return store.accounts.find((account) => account.id === session.userId) || null;
}

function createSession(store, userId) {
  const token = crypto.randomBytes(24).toString('hex');
  store.sessions[tokenHash(token)] = { userId, expires: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  return token;
}

function localCoachReply(message, image, record) {
  const goal = record && record.goal;
  const parts = [];
  if (image) {
    parts.push('The photo stays on this request and is not saved. Say what you want changed in words so the plan can follow it.');
  }
  if (goal && goal.physiqueSummary) parts.push(goal.physiqueSummary);
  else if (goal) parts.push(`You are set to ${goal.type} toward ${goal.targetWeight} lb.`);
  if (!parts.length) {
    parts.push('Tell me the physique in one sentence, such as shredded at 170 with bigger shoulders.');
  }
  if (message && /hurt|pain|injury|dizzy/i.test(message)) {
    parts.push('Stop the set if something hurts. This coach does not diagnose injuries.');
  }
  return parts.join(' ');
}

function modelReply(message, image, record) {
  return new Promise((resolve) => {
    if (!process.env.OPENAI_API_KEY) {
      resolve(localCoachReply(message, image, record));
      return;
    }
    const key = process.env.OPENAI_API_KEY;
    const context = record && record.goal
      ? `Plan: ${record.goal.type}, target ${record.goal.targetWeight} lb. ${record.goal.physiqueSummary || ''}`
      : 'No plan yet.';
    const userContent = image
      ? [
        { type: 'text', text: message || 'What should change for this photo?' },
        { type: 'image_url', image_url: { url: image } },
      ]
      : (message || 'Hello');
    const payload = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You coach one person in SciOptimal. Keep it under 80 words. Do not diagnose injuries. ${context}` },
        { role: 'user', content: userContent },
      ],
    });
    const https = require('https');
    const request = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const text = body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content;
          resolve(text || localCoachReply(message, image, record));
        } catch {
          resolve(localCoachReply(message, image, record));
        }
      });
    });
    request.on('error', () => resolve(localCoachReply(message, image, record)));
    request.setTimeout(20000, () => {
      request.destroy();
      resolve(localCoachReply(message, image, record));
    });
    request.end(payload);
  });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('bad json'));
      }
    });
  });
}

function send(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  response.end(payload);
}

async function handleApi(request, response, url) {
  const store = readStore();
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return send(response, 200, {
      service: 'scioptimal-home',
      accounts: store.accounts.length,
      maxAccounts: MAX_ACCOUNTS,
      coachModel: Boolean(process.env.OPENAI_API_KEY),
      inviteRequired: true,
    });
  }

  if (request.method === 'POST' && (url.pathname === '/api/auth/register' || url.pathname === '/api/auth/login')) {
    let body;
    try {
      body = await readBody(request);
    } catch {
      return send(response, 400, { message: 'Could not read that request' });
    }
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (url.pathname === '/api/auth/register') {
      const name = String(body.name || '').trim();
      if (!name) return send(response, 400, { message: 'Name is required' });
      if (!email.includes('@') || !email.includes('.')) return send(response, 400, { message: 'Enter a valid email address' });
      if (password.length < 6) return send(response, 400, { message: 'Password must be at least 6 characters' });
      const invite = String(body.invite || '').trim().toLowerCase();
      if (invite !== inviteCode(store)) {
        return send(response, 403, { message: 'That sign-up code is wrong. It is shown on the PC running the server.' });
      }
      if (store.accounts.length >= MAX_ACCOUNTS) {
        return send(response, 403, { message: 'This server already has its two accounts.' });
      }
      if (store.accounts.some((account) => account.email === email)) {
        return send(response, 400, { message: 'An account with that email already exists' });
      }
      const account = {
        id: `user_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        name,
        email,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      store.accounts.push(account);
      store.records[account.id] = {};
      const token = createSession(store, account.id);
      writeStore(store);
      return send(response, 201, { token, user: publicAccount(account), data: {} });
    }
    if (tooManyLogins(request)) {
      return send(response, 429, { message: 'Too many sign-in tries. Wait a few minutes.' });
    }
    const account = store.accounts.find((item) => item.email === email);
    if (!account || !checkPassword(password, account.passwordHash)) {
      noteLoginFailure(request);
      return send(response, 401, { message: 'Email or password is wrong' });
    }
    loginAttempts.delete(clientKey(request));
    const token = createSession(store, account.id);
    writeStore(store);
    return send(response, 200, { token, user: publicAccount(account), data: store.records[account.id] || {} });
  }

  const account = userFromRequest(store, request);
  if (!account) return send(response, 401, { message: 'Sign-in is required.' });

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    const header = request.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    delete store.sessions[tokenHash(token)];
    writeStore(store);
    return send(response, 200, { ok: true });
  }

  if (request.method === 'GET' && url.pathname === '/api/data') {
    return send(response, 200, { data: store.records[account.id] || {} });
  }

  if (request.method === 'PUT' && url.pathname === '/api/data') {
    let body;
    try {
      body = await readBody(request);
    } catch {
      return send(response, 400, { message: 'Could not read that request' });
    }
    store.records[account.id] = body.data || {};
    writeStore(store);
    return send(response, 200, { ok: true });
  }

  if (request.method === 'POST' && url.pathname === '/api/coach') {
    let body;
    try {
      body = await readBody(request);
    } catch (error) {
      const status = error.message === 'too large' ? 413 : 400;
      return send(response, status, { message: 'Could not read that request' });
    }
    const message = String(body.message || '').slice(0, 2000);
    const image = typeof body.image === 'string' && body.image.startsWith('data:image/') ? body.image : '';
    const reply = await modelReply(message, image, store.records[account.id]);
    return send(response, 200, { reply, model: Boolean(process.env.OPENAI_API_KEY) });
  }

  return send(response, 404, { message: 'Not found' });
}

function serveFile(response, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
    response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (url.pathname.startsWith('/api/')) {
    handleApi(request, response, url).catch(() => {
      if (!response.headersSent) send(response, 500, { message: 'Server error' });
    });
    return;
  }
  if (!fs.existsSync(BUILD_DIR)) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Build the app first with npm run build, then start this server again.');
    return;
  }
  let requested = '/index.html';
  try {
    requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad path');
    return;
  }
  const filePath = path.resolve(BUILD_DIR, requested.replace(/^\/+/, ''));
  const root = path.resolve(BUILD_DIR) + path.sep;
  if (filePath !== path.resolve(BUILD_DIR) && !filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }
  fs.stat(filePath, (error, stat) => {
    if (!error && stat.isFile()) {
      serveFile(response, filePath);
      return;
    }
    serveFile(response, path.join(BUILD_DIR, 'index.html'));
  });
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    const code = inviteCode(readStore());
    console.log(`Sign-up code: ${code}`);
    console.log(`Accounts allowed: ${MAX_ACCOUNTS}. Coach model: ${process.env.OPENAI_API_KEY ? 'on' : 'off'}.`);
    if (process.env.SCIOPTIMAL_SHARE) {
      console.log('Leave this window open. Both iPhones use the link printed below.');
      return;
    }
    console.log(`On this PC: http://127.0.0.1:${PORT}`);
    console.log('Your friend is on another network, so stop this and run: npm run share');
  });
}

module.exports = { server, MAX_ACCOUNTS };
