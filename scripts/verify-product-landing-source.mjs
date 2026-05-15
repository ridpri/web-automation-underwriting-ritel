import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const app = readFileSync(join(root, "src", "App.jsx"), "utf8");
const css = readFileSync(join(root, "src", "index.css"), "utf8");

const requiredAppSnippets = [
  "production-page",
  "production-product-card",
  "Asuransi Kecelakaan Diri",
  "Asuransi Harta Benda",
  "Asuransi Kendaraan",
  "Life Guard",
  "Trip Guard",
  "Edu Protect",
  "Travel Safe",
  "View as",
];

const requiredCssSnippets = [
  ".production-page",
  ".production-product-card",
  ".production-product-section",
  ".production-view-as",
  ".production-footer",
];

const requiredAssets = [
  "danantara.57629308.png",
  "jasindo-white-all.814f5299.png",
  "Jasindo_Positive-2.adb9525c.png",
  "product-lintasan.df53665c.jpg",
  "product-kecelakaan-diri.31916e3d.jpg",
  "product-anak-sekolah.56785bac.jpg",
  "product-travel.51b3edff.jpg",
  "property-fire.jpg",
  "property-all-risk.jpg",
  "vehicle-motor-tlo.jpg",
  "vehicle-car-tlo.jpg",
  "vehicle-car-comp.jpg",
];

const failures = [];

for (const snippet of requiredAppSnippets) {
  if (!app.includes(snippet)) failures.push(`App.jsx missing ${snippet}`);
}

for (const snippet of requiredCssSnippets) {
  if (!css.includes(snippet)) failures.push(`index.css missing ${snippet}`);
}

const forbiddenAppSnippets = [
  ["Cek Premi", "App.jsx product landing must not include Cek Premi"],
];

for (const [snippet, message] of forbiddenAppSnippets) {
  if (app.includes(snippet)) failures.push(message);
}

for (const file of requiredAssets) {
  if (!existsSync(join(root, "public", "production-assets", file))) {
    failures.push(`Missing public/production-assets/${file}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Product landing source guard passed.");
