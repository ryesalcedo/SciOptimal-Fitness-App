const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');

const PORT = process.env.PORT || '8787';
const BIN_DIR = path.join(__dirname, 'bin');

function asset() {
  const arch = os.arch() === 'arm64' ? 'arm64' : 'amd64';
  if (os.platform() === 'win32') {
    return { name: 'cloudflared.exe', url: `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-${arch}.exe` };
  }
  if (os.platform() === 'darwin') {
    return { name: 'cloudflared', url: `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-${arch}.tgz`, archive: true };
  }
  return { name: 'cloudflared', url: `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${arch}` };
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        resolve(download(response.headers.location, dest));
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Could not download the link helper (${response.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
    request.on('error', reject);
  });
}

async function cloudflaredPath() {
  const info = asset();
  const dest = path.join(BIN_DIR, info.name);
  if (fs.existsSync(dest)) return dest;
  fs.mkdirSync(BIN_DIR, { recursive: true });
  process.stdout.write('Getting the iPhone link helper...\n');
  if (info.archive) {
    const archive = path.join(BIN_DIR, 'cloudflared.tgz');
    await download(info.url, archive);
    await new Promise((resolve, reject) => {
      const tar = spawn('tar', ['-xzf', archive, '-C', BIN_DIR], { stdio: 'inherit' });
      tar.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('Could not unpack the link helper'))));
    });
    fs.rmSync(archive, { force: true });
  } else {
    await download(info.url, dest);
  }
  fs.chmodSync(dest, 0o755);
  return dest;
}

function printLink(buffer) {
  const match = buffer.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (!match) return '';
  console.log('');
  console.log('Open this in Safari on both iPhones:');
  console.log(match[0]);
  console.log('Text that link and the sign-up code to your friend.');
  console.log('The link changes if you close this window. The code stays the same.');
  console.log('Keep the PC awake.');
  console.log('');
  return match[0];
}

async function main() {
  const server = spawn(process.execPath, [path.join(__dirname, 'home.js')], {
    env: { ...process.env, HOST: '127.0.0.1', PORT, SCIOPTIMAL_SHARE: '1' },
    stdio: 'inherit',
  });
  let tunnel;
  const stop = () => {
    if (tunnel) tunnel.kill();
    server.kill();
  };
  process.on('SIGINT', () => { stop(); process.exit(0); });
  process.on('SIGTERM', () => { stop(); process.exit(0); });
  server.on('exit', (code) => {
    if (tunnel) tunnel.kill();
    process.exit(code || 0);
  });

  let bin;
  try {
    bin = await cloudflaredPath();
  } catch (error) {
    console.error(error.message);
    console.error('Install Cloudflare Tunnel from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ and run this again.');
    stop();
    process.exit(1);
  }

  tunnel = spawn(bin, ['tunnel', '--url', `http://127.0.0.1:${PORT}`, '--no-autoupdate', '--protocol', 'http2'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let announced = '';
  let log = '';
  const onData = (chunk) => {
    log += chunk.toString();
    if (!announced) announced = printLink(log);
  };
  tunnel.stdout.on('data', onData);
  tunnel.stderr.on('data', onData);
  tunnel.on('exit', (code) => {
    if (!announced) {
      console.error('The iPhone link did not start.');
      console.error(log.trim());
    }
    server.kill();
    process.exit(code || 1);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
