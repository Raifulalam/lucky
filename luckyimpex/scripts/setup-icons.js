/**
 * setup-icons.js
 * Run from: luckyimpex/
 * node scripts/setup-icons.js
 */
const fs   = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");
const iconsDir  = path.join(publicDir, "icons");
const src       = path.join(publicDir, "lucky-logo.png");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log("Created public/icons/");
}

const targets = ["icon-192.png","icon-512.png","maskable-192.png","maskable-512.png"];
for (const name of targets) {
  fs.copyFileSync(src, path.join(iconsDir, name));
  console.log("Copied icons/" + name);
}
console.log("Done.");
