const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

process.env.SCIOPTIMAL_DATA = path.join(os.tmpdir(), `scioptimal-${Date.now()}-${process.pid}.json`);
process.env.OPENAI_API_KEY = '';
process.env.SCIOPTIMAL_INVITE = 'joinus';
const { server } = require('./home');

function call(port, method, pathname, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const request = http.request({
      hostname: '127.0.0.1',
      port,
      path: pathname,
      method,
      headers: {
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let parsed = {};
        try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
        resolve({ status: response.statusCode, body: parsed });
      });
    });
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

async function main() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const health = await call(port, 'GET', '/api/health');
  assert.strictEqual(health.body.service, 'scioptimal-home');
  assert.strictEqual(health.body.maxAccounts, 2);
  assert.strictEqual(health.body.inviteRequired, true);

  const missingCode = await call(port, 'POST', '/api/auth/register', {
    body: { name: 'Sam', email: 'sam@example.com', password: 'secret3', invite: 'nope' },
  });
  assert.strictEqual(missingCode.status, 403);

  const ryan = await call(port, 'POST', '/api/auth/register', {
    body: { name: 'Ryan', email: 'Ryan@Example.com', password: 'secret1', invite: 'joinus' },
  });
  assert.strictEqual(ryan.status, 201);
  const friend = await call(port, 'POST', '/api/auth/register', {
    body: { name: 'Alex', email: 'alex@example.com', password: 'secret2', invite: 'joinus' },
  });
  assert.strictEqual(friend.status, 201);
  const third = await call(port, 'POST', '/api/auth/register', {
    body: { name: 'Sam', email: 'sam@example.com', password: 'secret3', invite: 'joinus' },
  });
  assert.strictEqual(third.status, 403);

  const saved = await call(port, 'PUT', '/api/data', {
    token: ryan.body.token,
    body: { data: { goal: { type: 'lose', targetWeight: 170, physiqueSummary: 'Cut to 170 lb.' } } },
  });
  assert.strictEqual(saved.status, 200);
  const ryanData = await call(port, 'GET', '/api/data', { token: ryan.body.token });
  const friendData = await call(port, 'GET', '/api/data', { token: friend.body.token });
  assert.strictEqual(ryanData.body.data.goal.targetWeight, 170);
  assert.strictEqual(friendData.body.data.goal, undefined);
  const stranger = await call(port, 'GET', '/api/data');
  assert.strictEqual(stranger.status, 401);

  const photo = `data:image/png;base64,${'a'.repeat(80)}`;
  const coach = await call(port, 'POST', '/api/coach', {
    token: friend.body.token,
    body: { message: 'I want bigger arms', image: photo },
  });
  assert.strictEqual(coach.status, 200);
  assert.ok(coach.body.reply.includes('photo'));
  const disk = fs.readFileSync(process.env.SCIOPTIMAL_DATA, 'utf8');
  assert.ok(!disk.includes('data:image'));
  assert.ok(!disk.includes('secret1'));

  const again = await call(port, 'POST', '/api/auth/login', {
    body: { email: 'ryan@example.com', password: 'secret1' },
  });
  assert.strictEqual(again.status, 200);
  assert.strictEqual(again.body.data.goal.targetWeight, 170);
  const wrong = await call(port, 'POST', '/api/auth/login', {
    body: { email: 'ryan@example.com', password: 'nope' },
  });
  assert.strictEqual(wrong.status, 401);

  await call(port, 'POST', '/api/auth/logout', { token: again.body.token });
  const after = await call(port, 'GET', '/api/data', { token: again.body.token });
  assert.strictEqual(after.status, 401);

  server.close();
  fs.rmSync(process.env.SCIOPTIMAL_DATA, { force: true });
  console.log('home server checks passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
