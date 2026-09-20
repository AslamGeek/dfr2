import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'dist', 'gas');
const appsScriptSrcDir = path.resolve(rootDir, 'apps-script');

console.log('🚀 Starting Google Apps Script Build Workflow...');

// 1. Run Vite build with singlefile bundling configuration
console.log('📦 Bundling React + Tailwind UI into standalone Index.html...');
execSync('npx vite build --config vite.config.gas.ts', {
  cwd: rootDir,
  stdio: 'inherit',
});

// 2. Ensure target directory dist/gas exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 3. Move bundled index.html into dist/gas/Index.html
const bundledHtmlPath = path.resolve(rootDir, 'dist', 'index.html');
const targetHtmlPath = path.resolve(outDir, 'Index.html');

if (fs.existsSync(bundledHtmlPath)) {
  fs.copyFileSync(bundledHtmlPath, targetHtmlPath);
  console.log('✅ Copied Index.html to dist/gas/Index.html');
} else {
  console.error('❌ Could not find dist/index.html after Vite build');
  process.exit(1);
}

// 4. Copy all Apps Script backend files (*.gs and appsscript.json)
console.log('📄 Copying Apps Script backend files...');
const gsFiles = fs.readdirSync(appsScriptSrcDir);
for (const file of gsFiles) {
  const src = path.join(appsScriptSrcDir, file);
  const dest = path.join(outDir, file);
  fs.copyFileSync(src, dest);
  console.log(`   -> Copied ${file}`);
}

// 5. Generate .clasp.json template in dist/gas
const claspConfig = {
  scriptId: '',
  rootDir: '.',
};
fs.writeFileSync(
  path.join(outDir, '.clasp.json'),
  JSON.stringify(claspConfig, null, 2),
  'utf-8'
);

console.log('\n✨ Google Apps Script package ready in dist/gas/ !');
console.log('You can now deploy with:');
console.log('   cd dist/gas && clasp push');
