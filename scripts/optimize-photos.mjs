// Re-runnable photo optimizer: resizes curated source folders into
// public/photos/<category>/<slug>/ and regenerates the matching data files.
// Auto-orients via EXIF then strips ALL metadata (incl. GPS) — sharp drops
// metadata by default. Run: node scripts/optimize-photos.mjs
//
// `limit` keeps only the N sharpest images (variance-of-Laplacian focus
// measure). A set whose source folder is missing keeps its already-optimized
// photos. Data files are rebuilt by scanning what's on disk.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, "public/photos");

// Travel galleries → src/data/travel-galleries.ts  ({slug, place, state, photos})
const TRAVEL = [
  { slug: "ooty", place: "Ooty", state: "Tamil Nadu", src: "C:/Users/ASUS/Downloads/Ooty" },
  { slug: "goa", place: "Goa", state: "Goa", src: "C:/Users/ASUS/Downloads/Goa/iCloud Photos" },
  { slug: "assam", place: "Assam", state: "Assam", src: "C:/Users/ASUS/Downloads/Assam/iCloud Photos" },
  { slug: "chettinad", place: "Chettinad", state: "Tamil Nadu", src: "C:/Users/ASUS/Downloads/Chettinadu/iCloud Photos" },
  { slug: "kashmir", place: "Kashmir", state: "Jammu & Kashmir", src: "C:/Users/ASUS/Downloads/Kashmir/iCloud Photos" },
  { slug: "ladakh", place: "Ladakh", state: "Ladakh", src: "C:/Users/ASUS/Downloads/Ladakh/iCloud Photos", limit: 20 },
  { slug: "westcoast-ka", place: "Chikmagalur", state: "Karnataka", src: "C:/Users/ASUS/Downloads/westcoast-ka/iCloud Photos", limit: 18 },
  { slug: "blr-chikkaballapur", place: "Bengaluru & Chikkaballapur", state: "Karnataka", src: "C:/Users/ASUS/Downloads/Bangalore-Chikkaballapur/iCloud Photos" },
];

// Movement galleries → src/data/movement-galleries.ts  ({slug, title, photos})
const MOVEMENT = [
  { slug: "trekking", title: "On the trail", src: "C:/Users/ASUS/Downloads/Trekking/iCloud Photos", limit: 20 },
];

// Cricket galleries → src/data/cricket-galleries.ts  ({slug, title, photos})
const CRICKET = [
  // cricket-action.jpg = the run-up shot, cropped free of the iPhone Photos UI.
  { slug: "cricket", title: "On the field", src: "C:/Users/ASUS/Downloads/Cricket/iCloud Photos", files: [
    "cricket-action.jpg",
    "IMG_3965.JPEG",
  ] },
];

// Baking: photos referenced directly from recipe MDX frontmatter (no data file).
// `files` is an explicit, ordered list (cover first) selected from the Bake folder.
const BAKE = "C:/Users/ASUS/Downloads/Bake";
const COOKING = "C:/Users/ASUS/Downloads/Cooking";
const BAKING = [
  // "From the bench" gallery on /baking — curated bread/bake shots only (no meat).
  { slug: "bench", src: COOKING, files: [
    "DSCF0863.jpg", "DSCF0680.jpg", "DSCF0443.jpg",
    "DSCF0431.jpg", // tiramisu (Old Monk rum)
    "DSCF0546.jpg", "DSCF0967.jpg", "DSCF0521.jpg",
    "DSCF0524.jpg", "DSCF0538.jpg",
    "DSCF0654.jpg", // burger on the rack (Mari's buns)
  ] },
  { slug: "semi-sourdough", src: BAKE, files: [
    "WhatsApp Image 2026-06-11 at 2.58.27 PM.jpeg",
    "WhatsApp Image 2026-06-11 at 2.53.41 PM.jpeg",
  ] },
  { slug: "shokupan", src: BAKE, files: [
    "WhatsApp Image 2026-06-11 at 2.53.34 PM.jpeg",
    "WhatsApp Image 2026-06-11 at 2.53.29 PM.jpeg",
    "WhatsApp Image 2026-06-11 at 2.53.33 PM.jpeg",
    "WhatsApp Image 2026-06-11 at 2.53.27 PM.jpeg", // golden sandwich loaf (lives here only)
    "WhatsApp Image 2026-06-11 at 2.53.32 PM.jpeg",
  ] },
  // Sweet Bread (cinnamon-roll dough): 2-loaf pull-apart cover + the rustic version.
  { slug: "sweet-bread", src: "C:/Users/ASUS/Downloads", files: [
    "WhatsApp Image 2026-06-11 at 6.00.25 PM.jpeg",
    "WhatsApp Image 2026-06-11 at 5.59.29 PM.jpeg", // same dough, less sugar/butter → rustic
  ] },
  { slug: "plantain-doughnuts", src: BAKE, files: [
    "WhatsApp Image 2026-06-11 at 2.53.22 PM.jpeg",
    "WhatsApp Image 2026-06-11 at 2.53.21 PM.jpeg",
  ] },
];

const isImage = (f) => /\.(jpe?g|png|heic)$/i.test(f);

// Variance-of-Laplacian focus measure: higher = sharper / more in focus.
async function sharpness(file) {
  const { channels } = await sharp(file)
    .greyscale()
    .resize(512, 512, { fit: "inside" })
    .convolve({ width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] })
    .stats();
  return channels[0].stdev;
}

async function selectFiles(dir, files, limit) {
  if (!limit || files.length <= limit) return files;
  const scored = [];
  for (const f of files) {
    try { scored.push({ f, s: await sharpness(path.join(dir, f)) }); }
    catch { scored.push({ f, s: 0 }); }
  }
  scored.sort((a, b) => b.s - a.s);
  const kept = new Set(scored.slice(0, limit).map((x) => x.f));
  return files.filter((f) => kept.has(f));
}

async function processSet(category, set) {
  const outDir = path.join(PHOTOS_DIR, category, set.slug);
  if (set.src && fs.existsSync(set.src)) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    const all = set.files ?? fs.readdirSync(set.src).filter(isImage).sort();
    const files = set.files ? all : await selectFiles(set.src, all, set.limit);
    let i = 0;
    for (const f of files) {
      i += 1;
      const name = `${set.slug}-${String(i).padStart(2, "0")}.jpg`;
      await sharp(path.join(set.src, f))
        .rotate()
        .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(path.join(outDir, name));
    }
    console.log(`${category}/${set.slug}: kept ${i}${set.limit ? ` of ${all.length} (sharpest)` : ""}`);
  } else if (fs.existsSync(outDir)) {
    console.log(`${category}/${set.slug}: source missing — keeping ${fs.readdirSync(outDir).length} existing`);
  } else {
    console.log(`${category}/${set.slug}: no source and nothing on disk — skipped`);
  }
}

function listPhotos(category, slug) {
  const dir = path.join(PHOTOS_DIR, category, slug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.jpg$/i.test(f)).sort()
    .map((f) => `/photos/${category}/${slug}/${f}`);
}

function writeData(file, type, rows) {
  const ts = `// AUTO-GENERATED by scripts/optimize-photos.mjs — do not edit by hand.\n${type}\n\nexport const ${file.varName} = ${JSON.stringify(rows, null, 2)};\n`;
  fs.writeFileSync(path.join(ROOT, "src/data", file.name), ts);
  console.log(`Wrote src/data/${file.name} (${rows.length})`);
}

for (const s of TRAVEL) await processSet("travel", s);
for (const s of MOVEMENT) await processSet("movement", s);
for (const s of CRICKET) await processSet("cricket", s);
for (const s of BAKING) await processSet("baking", s);

const travelRows = TRAVEL
  .map((s) => ({ slug: s.slug, place: s.place, state: s.state, photos: listPhotos("travel", s.slug) }))
  .filter((r) => r.photos.length);
writeData(
  { name: "travel-galleries.ts", varName: "TRAVEL_GALLERIES" },
  "export type PlaceGallery = { slug: string; place: string; state: string; photos: string[] };",
  travelRows,
);

const movementRows = MOVEMENT
  .map((s) => ({ slug: s.slug, title: s.title, photos: listPhotos("movement", s.slug) }))
  .filter((r) => r.photos.length);
writeData(
  { name: "movement-galleries.ts", varName: "MOVEMENT_GALLERIES" },
  "export type MovementGallery = { slug: string; title: string; photos: string[] };",
  movementRows,
);

const cricketRows = CRICKET
  .map((s) => ({ slug: s.slug, title: s.title, photos: listPhotos("cricket", s.slug) }))
  .filter((r) => r.photos.length);
writeData(
  { name: "cricket-galleries.ts", varName: "CRICKET_GALLERIES" },
  "export type CricketGallery = { slug: string; title: string; photos: string[] };",
  cricketRows,
);
