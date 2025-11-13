import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const rootDist = join(process.cwd(), '.next');
const storefrontDist = join(process.cwd(), 'apps', 'storefront', '.next');

if (!existsSync(storefrontDist)) {
  console.error(
    'Expected Next.js build output at "apps/storefront/.next" but none was found. Ensure the storefront build finishes before running postbuild.'
  );
  process.exit(1);
}

rmSync(rootDist, { recursive: true, force: true });
cpSync(storefrontDist, rootDist, { recursive: true, force: true });

console.log('Copied Next.js build output from apps/storefront/.next to workspace .next directory.');
