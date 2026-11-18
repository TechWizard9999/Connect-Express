// Starts the real server without MongoDB (in-memory fallback) and tests the API over HTTP.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const backendDir = path.join(__dirname, '..');
const hasAddon = fs.existsSync(path.join(backendDir, 'build', 'Release', 'route_engine.node'));
const PORT = 20000 + Math.floor(Math.random() * 20000);
const API = `http://localhost:${PORT}/api`;

let server;
let log = '';

before(async () => {
  const args = hasAddon ? ['server.js'] : ['-r', path.join(__dirname, 'helpers', 'stub-addon.js'), 'server.js'];
  server = spawn(process.execPath, args, {
    cwd: backendDir,
    // empty MONGO_URI wins over any value in backend/.env, so tests never touch a real database
    env: { ...process.env, JWT_SECRET: 'test-secret', PORT: String(PORT), MONGO_URI: '', MONGODB_URI: '' }
  });
  server.stdout.on('data', (d) => { log += d; });
  server.stderr.on('data', (d) => { log += d; });

  const started = Date.now();
  while (!log.includes('Server running')) {
    if (server.exitCode !== null || Date.now() - started > 30000) {
      throw new Error(`server did not start (exit code ${server.exitCode}):\n${log}`);
    }
    await new Promise((r) => setTimeout(r, 100));
  }
});

after(() => {
  if (server) server.kill();
});

async function get(url) {
  const res = await fetch(API + url);
  return { status: res.status, body: await res.json() };
}

async function post(url, data) {
  const res = await fetch(API + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return { status: res.status, body: await res.json() };
}

test('starts with in-memory data when MONGO_URI is not set', () => {
  assert.match(log, /Using in-memory data/);
  assert.match(log, /Stations: 58/);
});

test('GET /stations returns the 58 built-in stations', async () => {
  const { status, body } = await get('/stations');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.count, 58);
});

test('register, duplicate register, login and wrong password', async () => {
  let res = await post('/auth/register', { name: 'Test User', email: 'Test@Example.com', password: 'secret1' });
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.email, 'test@example.com');

  res = await post('/auth/register', { name: 'Test User', email: 'test@example.com', password: 'secret1' });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.message, 'User already exists');

  res = await post('/auth/login', { email: 'TEST@example.com', password: 'secret1' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.user.name, 'Test User');

  res = await post('/auth/login', { email: 'test@example.com', password: 'wrong12' });
  assert.strictEqual(res.status, 401);

  res = await post('/auth/login', { email: 'nobody@example.com', password: 'secret1' });
  assert.strictEqual(res.status, 401);
});

test('register rejects an invalid email', async () => {
  const res = await post('/auth/register', { name: 'X', email: 'not-an-email', password: 'secret1' });
  assert.strictEqual(res.status, 400);
});

test('direct search MAS -> SBC returns trains with positive durations', async () => {
  const { status, body } = await get('/search?from=MAS&to=SBC');
  assert.strictEqual(status, 200);
  assert.ok(body.directCount > 0, 'expected at least one direct train');
  for (const r of body.results.direct) {
    assert.ok(r.duration > 0, `train ${r.trainNumber} has duration ${r.duration}`);
    assert.notStrictEqual(r.durationFormatted, 'N/A');
  }
});

test('connecting routes keep layovers between 1h and 12h',
  { skip: !hasAddon && 'C++ addon not built (run npm install with C++ build tools)' },
  async () => {
    const { body } = await get('/search?from=NCJ&to=YPR');
    for (const r of body.results.connecting) {
      assert.ok(r.layover >= 60 && r.layover <= 720, `layover ${r.layover} at ${r.connectionStation}`);
      assert.ok(r.totalDuration > 0);
    }
  });

test('search validates its input', async () => {
  let res = await get('/search?from=MAS');
  assert.strictEqual(res.status, 400);
  res = await get('/search?from=MAS&to=mas');
  assert.strictEqual(res.status, 400);
});
