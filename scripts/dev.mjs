import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const frontendDir = resolve(rootDir, 'frontend');
const backendDir = resolve(rootDir, 'backend');

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '🚀 Navi Mumbai Civic Router — Launching Full Stack Dev');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════');

const children = [];

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down services...');
  for (const child of children) {
    if (child && !child.killed) {
      try {
        child.kill('SIGTERM');
      } catch {}
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// 1. Detect Python executable
let pythonBin = 'python3';
const venvPythonRoot = resolve(rootDir, '.venv/bin/python');
const venvPythonBackend = resolve(backendDir, '.venv/bin/python');

if (existsSync(venvPythonRoot)) {
  pythonBin = venvPythonRoot;
} else if (existsSync(venvPythonBackend)) {
  pythonBin = venvPythonBackend;
}

// 2. Start Backend (FastAPI on port 8000)
try {
  const backendProc = spawn(pythonBin, ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8000', '--app-dir', backendDir], {
    cwd: rootDir,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false
  });

  backendProc.stdout.on('data', (chunk) => {
    process.stdout.write(`\x1b[35m[backend]\x1b[0m ${chunk}`);
  });
  backendProc.stderr.on('data', (chunk) => {
    process.stderr.write(`\x1b[35m[backend]\x1b[0m ${chunk}`);
  });
  backendProc.on('error', (err) => {
    console.warn('\x1b[33m[backend] Warning: could not launch python uvicorn:\x1b[0m', err.message);
    console.warn('\x1b[33m[backend] Frontend will continue in autonomous Demo Mode with local fallback.\x1b[0m');
  });

  children.push(backendProc);
} catch (err) {
  console.warn('\x1b[33m[backend] Failed to start backend:\x1b[0m', err.message);
}

// 3. Start Frontend (Vite on port 5173)
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontendProc = spawn(npmCmd, ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
  cwd: frontendDir,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

frontendProc.stdout.on('data', (chunk) => {
  process.stdout.write(`\x1b[32m[frontend]\x1b[0m ${chunk}`);
});
frontendProc.stderr.on('data', (chunk) => {
  process.stderr.write(`\x1b[32m[frontend]\x1b[0m ${chunk}`);
});
frontendProc.on('error', (err) => {
  console.error('\x1b[31m[frontend] Error:\x1b[0m', err.message);
});

children.push(frontendProc);
