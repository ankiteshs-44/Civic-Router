import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const androidDir = resolve(rootDir, 'android');
const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? 'gradlew.bat' : './gradlew';
const gradle = spawn(gradleCommand, ['assembleDebug'], {
  cwd: androidDir,
  shell: isWindows,
  stdio: 'inherit',
});

gradle.on('error', (error) => {
  console.error(`Could not start the Android build: ${error.message}`);
  process.exitCode = 1;
});

gradle.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
