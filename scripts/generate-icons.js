// Script to generate PWA icons from SVG
// Requires: npm install -D sharp
// Run: node scripts/generate-icons.js

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const svgPath = join(publicDir, 'icon.svg');

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

async function generateIcons() {
  try {
    const svgBuffer = readFileSync(svgPath);
    
    for (const { size, name } of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(publicDir, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
    
    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
      console.error('❌ Error: sharp module not found.');
      console.log('Please install it with: npm install -D sharp');
    } else {
      console.error('❌ Error generating icons:', error.message);
    }
    process.exit(1);
  }
}

generateIcons();

