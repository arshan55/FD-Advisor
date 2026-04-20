const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const compDir = path.join(__dirname, 'src', 'components');

function replaceConfig(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceConfig(fullPath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace complex isLight ternaries to rely on CSS variables
      content = content.replace(/\$\{isLight \? '[^']*' : '[^']*'\}/g, '');
      content = content.replace(/ \?\s+"[^"]*"\s+:\s+"[^"]*"/g, '');
      content = content.replace(/isLight \? '[^']*' : '[^']*'/g, "''");
      // Remove any leftover empty string concats
      content = content.replace(/\$\{''\}/g, '');

      // Replace explicit colors with var mappings
      content = content.replace(/bg-white/g, 'bg-transparent');
      content = content.replace(/bg-\[#0B1220\]/g, 'bg-transparent');
      content = content.replace(/bg-orange-50/g, 'bg-[var(--modal-bg)]');
      content = content.replace(/bg-slate-50/g, 'bg-[var(--modal-bg)]');
      content = content.replace(/bg-slate-100/g, 'bg-[var(--modal-bg)]');
      content = content.replace(/bg-slate-200/g, 'bg-[var(--modal-bg)]');
      content = content.replace(/bg-slate-300/g, 'bg-[var(--modal-bg)]');
      content = content.replace(/bg-white\/[0-9]+/g, 'bg-[var(--modal-bg)]');
      
      content = content.replace(/text-slate-800/g, 'text-[var(--text-main)]');
      content = content.replace(/text-slate-700/g, 'text-[var(--text-main)]');
      content = content.replace(/text-white/g, 'text-[var(--text-main)]');
      content = content.replace(/text-slate-500/g, 'text-[var(--text-muted)]');
      content = content.replace(/text-slate-400/g, 'text-[var(--text-muted)]');
      content = content.replace(/text-gray-400/g, 'text-[var(--text-muted)]');
      content = content.replace(/text-gray-500/g, 'text-[var(--text-muted)]');
      
      content = content.replace(/text-orange-500/g, 'text-[var(--accent-green)]');
      content = content.replace(/from-orange-500/g, 'from-[var(--accent-green)]');
      content = content.replace(/to-orange-400/g, 'to-[var(--accent-blue)]');
      content = content.replace(/bg-orange-500/g, 'bg-[var(--accent-green)]');
      content = content.replace(/border-orange-500/g, 'border-[var(--accent-green)]');

      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceConfig(screensDir);
replaceConfig(compDir);
console.log('Update finished.');
