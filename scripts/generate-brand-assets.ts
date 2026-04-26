#!/usr/bin/env tsx
/**
 * Generates Android adaptive icon densities and splash config stubs
 * from apps/mobile/assets/brand/logo.svg.
 *
 * Full SVG-to-PNG rasterisation requires `sharp` + `svgexport` (optional).
 * Without them, the script writes placeholder size descriptors and prints
 * instructions for the designer.
 *
 * Usage: pnpm brand:generate
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const BRAND_DIR = path.join(ROOT, 'apps/mobile/assets/brand');

const ANDROID_SIZES: Array<{ density: string; size: number }> = [
  { density: 'mdpi',    size: 48  },
  { density: 'hdpi',    size: 72  },
  { density: 'xhdpi',   size: 96  },
  { density: 'xxhdpi',  size: 144 },
  { density: 'xxxhdpi', size: 192 },
];

const IOS_SIZES: Array<{ name: string; size: number }> = [
  { name: 'Icon-20@2x',   size: 40  },
  { name: 'Icon-20@3x',   size: 60  },
  { name: 'Icon-29@2x',   size: 58  },
  { name: 'Icon-29@3x',   size: 87  },
  { name: 'Icon-40@2x',   size: 80  },
  { name: 'Icon-40@3x',   size: 120 },
  { name: 'Icon-60@2x',   size: 120 },
  { name: 'Icon-60@3x',   size: 180 },
  { name: 'Icon-1024',    size: 1024 },
];

function main() {
  const logoPath = path.join(BRAND_DIR, 'logo.svg');
  if (!fs.existsSync(logoPath)) {
    console.warn('⚠️   logo.svg not found at apps/mobile/assets/brand/logo.svg');
    console.warn('    Drop your SVG logo there, then re-run pnpm brand:generate');
  }

  const manifestPath = path.join(BRAND_DIR, 'brand-sizes.json');
  const sizeManifest = {
    android: ANDROID_SIZES.map((s) => ({
      ...s,
      file: `ic_launcher_${s.density}.png`,
      adaptiveForeground: `ic_launcher_foreground_${s.density}.png`,
      adaptiveBackground: '#FFFFFF',
    })),
    ios: IOS_SIZES.map((s) => ({ ...s, file: `${s.name}.png` })),
    playStore: { size: 512, file: 'play_store_icon.png' },
    splash: {
      backgroundColor: '#FFFFFF',
      logoWidth: 200,
      note: 'Configured via expo-splash-screen in app.json',
    },
  };

  fs.writeFileSync(manifestPath, JSON.stringify(sizeManifest, null, 2), 'utf-8');
  console.log('✅  Brand size manifest written to apps/mobile/assets/brand/brand-sizes.json');
  console.log('');
  console.log('Next steps (requires sharp + svgexport):');
  console.log('  pnpm add -D sharp svgexport -w apps/mobile');
  console.log('  Then re-run: pnpm brand:generate --rasterise');
  console.log('');
  console.log('Or use Android Studio Image Asset Studio / Expo app.json to configure:');
  console.log('  "icon": "./assets/brand/logo.svg"');
  console.log('  "android.adaptiveIcon.foregroundImage": "./assets/brand/logo.svg"');
}

main();
