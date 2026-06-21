/** @type {import('next').NextConfig} */

// next.config.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionPath = path.join(__dirname, '.version');
let templateVersion = null;

if (fs.existsSync(versionPath)) {
  templateVersion = fs.readFileSync(versionPath, 'utf8').trim();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    TEMPLATE_VERSION: templateVersion,
  },
};

export default nextConfig;
