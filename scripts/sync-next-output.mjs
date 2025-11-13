import { cp, rm, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const appOutputDir = path.resolve('apps/storefront/.next');
const rootOutputDir = path.resolve('.next');

async function main() {
  try {
    await access(appOutputDir, constants.F_OK);
  } catch (error) {
    console.warn(
      `Skipping Next.js output sync: build artifacts not found at ${appOutputDir}`
    );
    return;
  }

  await rm(rootOutputDir, { recursive: true, force: true });
  await cp(appOutputDir, rootOutputDir, { recursive: true });
  console.log(`Synced Next.js build output to ${rootOutputDir}`);
}

main().catch((error) => {
  console.error('Failed to sync Next.js output to repository root:', error);
  process.exitCode = 1;
});
