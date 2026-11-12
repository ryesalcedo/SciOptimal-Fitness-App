const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const PORT = String(process.env.PORT || '8787');
const LINK_FILE = path.join(__dirname, '..', 'SciOptimal-link.txt');

function tailscaleBin() {
  if (process.platform === 'win32') {
    const installed = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Tailscale', 'tailscale.exe');
    if (fs.existsSync(installed)) return installed;
  }
  return 'tailscale';
}

function run(bin, args) {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { windowsHide: true });
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk.toString(); });
    child.stderr.on('data', (chunk) => { out += chunk.toString(); });
    child.on('error', (error) => resolve({ code: 127, out: error.message }));
    child.on('exit', (code) => resolve({ code: code || 0, out }));
  });
}

function publicUrl(text) {
  const match = String(text).match(/https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)+\.ts\.net/i);
  return match ? match[0] : '';
}

function portFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', () => resolve(false));
    tester.once('listening', () => tester.close(() => resolve(true)));
    tester.listen(port, '127.0.0.1');
  });
}

function signUpCode() {
  if (process.env.SCIOPTIMAL_INVITE) return String(process.env.SCIOPTIMAL_INVITE).trim();
  try {
    const store = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'store.json'), 'utf8'));
    return store.inviteCode || '';
  } catch {
    return '';
  }
}

async function waitForCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = signUpCode();
    if (code) return code;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return '';
}

function writeLink(url, code) {
  fs.writeFileSync(LINK_FILE, [
    url,
    code ? `Sign-up code: ${code}` : 'Sign-up code: look in the SciOptimal window',
    'This address stays the same. It works while this PC is signed in and awake.',
    '',
  ].join('\n'));
}

function keepAwake() {
  if (process.platform !== 'win32') return null;
  const script = [
    'Add-Type -Namespace Sci -Name Power -MemberDefinition \'[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);\'',
    'while ($true) {',
    '  [Sci.Power]::SetThreadExecutionState([uint32]2147483651) | Out-Null',
    '  Start-Sleep -Seconds 30',
    '}',
  ].join('\n');
  return spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    stdio: 'ignore',
    windowsHide: true,
  });
}

async function staticAddress(bin) {
  const status = await run(bin, ['funnel', 'status']);
  const existing = publicUrl(status.out);
  if (existing && /127\.0\.0\.1:8787|localhost:8787/.test(status.out)) return { url: existing, out: status.out };

  let turnedOn = await run(bin, ['funnel', '--bg', '--yes', PORT]);
  if (turnedOn.code !== 0) turnedOn = await run(bin, ['funnel', '--bg', PORT]);
  const after = await run(bin, ['funnel', 'status']);
  const url = publicUrl(`${turnedOn.out}\n${after.out}`) || existing;
  return { url, out: `${turnedOn.out}\n${after.out}`.trim() };
}

async function main() {
  if (!(await portFree(PORT))) {
    console.log('SciOptimal is already running on this PC.');
    if (fs.existsSync(LINK_FILE)) console.log(fs.readFileSync(LINK_FILE, 'utf8').trim());
    process.exit(0);
  }

  const server = spawn(process.execPath, [path.join(__dirname, 'home.js')], {
    env: { ...process.env, HOST: '127.0.0.1', PORT, SCIOPTIMAL_SHARE: '1' },
    stdio: 'inherit',
  });
  const awake = keepAwake();
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    if (awake) awake.kill();
    server.kill();
  };
  process.on('SIGINT', () => { stop(); process.exit(0); });
  process.on('SIGTERM', () => { stop(); process.exit(0); });
  server.on('exit', (code) => {
    stop();
    process.exit(code || 0);
  });

  const bin = tailscaleBin();
  const tailscale = await run(bin, ['status']);
  if (tailscale.code === 127 || /not recognized|ENOENT|no such file/i.test(tailscale.out)) {
    console.error('Install Tailscale from https://tailscale.com/download/windows');
    console.error('Sign in once in the Tailscale app. It is free. Then start SciOptimal again.');
    stop();
    process.exit(1);
  }
  if (/stopped|logged out|log in/i.test(tailscale.out)) {
    console.error('Open the Tailscale app and sign in, then start SciOptimal again.');
    console.error(tailscale.out.trim());
    stop();
    process.exit(1);
  }

  const funnel = await staticAddress(bin);
  if (!funnel.url) {
    console.error('The permanent address did not start.');
    console.error(funnel.out || 'Open https://login.tailscale.com/admin/dns and turn Funnel on, then start SciOptimal again.');
    stop();
    process.exit(1);
  }

  const code = await waitForCode();
  writeLink(funnel.url, code);
  console.log('');
  console.log('Open this in Safari on both iPhones:');
  console.log(funnel.url);
  console.log('This address stays the same when you restart the PC.');
  console.log('It is saved in SciOptimal-link.txt');
  console.log('');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
