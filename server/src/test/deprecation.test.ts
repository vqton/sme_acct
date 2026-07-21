import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '../..');

function runUntilReady(
  cmd: string,
  args: string[],
  env: Record<string, string>,
  readyMarker: string,
  timeoutMs = 15000
): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd: serverRoot, env: { ...process.env, ...env } });
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];
    const timer = setTimeout(() => { proc.kill('SIGTERM'); reject(new Error('timeout')); }, timeoutMs);

    proc.stdout!.on('data', (d: Buffer) => {
      chunks.push(d);
      const out = Buffer.concat(chunks).toString('utf8');
      if (out.includes(readyMarker)) {
        clearTimeout(timer);
        proc.kill('SIGTERM');
        resolve({ stdout: out, stderr: Buffer.concat(errChunks).toString('utf8') });
      }
    });
    proc.stderr!.on('data', (d: Buffer) => { errChunks.push(d); });
    proc.on('error', (e: Error) => { clearTimeout(timer); reject(e); });
  });
}

describe('tsx deprecation warnings', () => {
  it('NODE_OPTIONS=--no-deprecation suppresses DEP0205 in tsx watch', async () => {
    const result = await runUntilReady(
      'npx', ['tsx', 'watch', 'src/index.ts'],
      { NODE_OPTIONS: '--no-deprecation' },
      'Nest application successfully started'
    );

    expect(result.stderr).not.toContain('DEP0205');
    expect(result.stderr).not.toContain('module.register() is deprecated');
    expect(result.stdout).toContain('Nest application successfully started');
  }, 25000);
});
