const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../node_modules/html2pdf.js/node_modules/html2canvas'),
  path.join(__dirname, '../node_modules/jspdf/node_modules/html2canvas')
];

targetDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist, skipping: ${dir}`);
    return;
  }

  console.log(`Patching html2canvas-pro inside: ${dir}`);

  // 1. Patch package.json
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkgContent = fs.readFileSync(pkgPath, 'utf8');
      const pkg = JSON.parse(pkgContent);

      pkg.type = 'commonjs';
      delete pkg.module;
      delete pkg.exports;

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
      console.log(`  Successfully updated package.json`);
    } catch (err) {
      console.error(`  Error patching package.json:`, err);
    }
  }

  // 2. Patch dist/html2canvas-pro.js
  const jsPath = path.join(dir, 'dist/html2canvas-pro.js');
  if (fs.existsSync(jsPath)) {
    try {
      let content = fs.readFileSync(jsPath, 'utf8');

      // Regex matching the top UMD wrapper
      const wrapperRegex = /\(function\s*\(global,\s*factory\)\s*\{\s*typeof\s*exports\s*===\s*'object'\s*&&\s*typeof\s*module\s*!==\s*'undefined'\s*\?\s*factory\(exports\)\s*:\s*typeof\s*define\s*===\s*'function'\s*&&\s*define\.amd\s*\?\s*define\(\['exports'\],\s*factory\)\s*:\s*\(global\s*=\s*typeof\s*globalThis\s*!==\s*'undefined'\s*\?\s*globalThis\s*:\s*global\s*\|\|\s*self,\s*factory\(global\.html2canvas\s*=\s*\{\}\)\);\s*\}\)\(this,\s*\(function\s*\(exports\)\s*\{\s*'use strict';/;

      const replacementWrapper = `(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        const m = {};
        factory(m);
        module.exports = m.default;
        module.exports.default = m.default;
        module.exports.html2canvas = m.default;
        module.exports.setCspNonce = m.setCspNonce;
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        global = typeof globalThis !== 'undefined' ? globalThis : global || self;
        factory(global.html2canvas = {});
    }
})(this, (function (exports) { 'use strict';`;

      if (wrapperRegex.test(content)) {
        content = content.replace(wrapperRegex, replacementWrapper);
        fs.writeFileSync(jsPath, content, 'utf8');
        console.log(`  Successfully patched dist/html2canvas-pro.js`);
      } else {
        console.warn(`  Warning: Could not match UMD wrapper in dist/html2canvas-pro.js. It might already be patched.`);
      }
    } catch (err) {
      console.error(`  Error patching dist/html2canvas-pro.js:`, err);
    }
  }
});
console.log('Finished patching all directories.');
