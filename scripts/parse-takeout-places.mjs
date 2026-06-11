// Parse Google Takeout Maps exports (Reviews + Saved Places) into a CSV that
// matches the Airtable Places columns. Run: node scripts/parse-takeout-places.mjs
import fs from "node:fs";

const DIR = "C:/Users/ASUS/Downloads/takeout-google-data/Takeout/Maps (your places)";
const OUT = "C:/Users/ASUS/Downloads/places-backfill.csv";

const cleanRegion = (s) => s.replace(/\s*\b\d{5,6}\b/g, "").replace(/\s+,/g, ",").replace(/,\s*,/g, ",").trim();

function regionFromAddress(addr) {
  if (!addr) return "";
  const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
  const country = parts[parts.length - 1];
  if (country === "India" && parts.length >= 3) {
    const state = parts[parts.length - 2].replace(/\s*\d{5,6}\s*$/, "").trim();
    const city = parts[parts.length - 3];
    return cleanRegion(`${city}, ${state}`);
  }
  return cleanRegion(parts.slice(-2).join(", "));
}

function load(file) {
  const p = `${DIR}/${file}`;
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8")).features ?? [];
}

// Fallback "cool fact" for places I saved/reviewed but left no words on — keyed
// by exact place name. Used only when there's no review text (and no Food).
const FACT = {
  "Agashiye": "The rooftop thali at Ahmedabad's House of MG — an ever-changing, unlimited Gujarati feast served on silver.",
  "Momosan Ramen & Sake": "Iron Chef Morimoto's ramen-and-gyoza joint in Midtown Manhattan.",
  "NAGA DISH": "Authentic Naga plates in Guwahati — smoked pork, bamboo shoot and a raja-chilli kick.",
  "Desert Bikes Bikes On Rent": "Bike rentals for riding out into the Thar from the golden city of Jaisalmer.",
  "tribal brew daily | Indiranagar": "A specialty-coffee micro-roaster tucked into Indiranagar.",
  "The Planters Café": "Coffee-country calm in the Western Ghats — estate-fresh brews with a view.",
  "Nidhivana Farms & Resort": "A green farm-stay on the outskirts of Mangaluru.",
};

const rows = [];
const seen = new Set();
const add = (f, source) => {
  const pr = f.properties ?? {};
  const loc = pr.location ?? {};
  const [lng, lat] = f.geometry?.coordinates ?? [];
  const name = loc.name ?? "";
  if (!name) return;
  const key = `${name.toLowerCase()}|${(lat ?? 0).toFixed(3)},${(lng ?? 0).toFixed(3)}`;
  if (seen.has(key)) return; // reviews preferred (loaded first)
  seen.add(key);
  rows.push({
    Name: name,
    Region: regionFromAddress(loc.address),
    Food: "",
    Note: pr.review_text_published || FACT[name] || "",
    Rating: pr.five_star_rating_published ?? "",
    Lat: lat ?? "",
    Lng: lng ?? "",
    Date: pr.date ? String(pr.date).slice(0, 10) : "",
    _country: loc.country_code ?? "",
    _source: source,
  });
};

load("Reviews.json").forEach((f) => add(f, "review"));
load("Saved Places.json").forEach((f) => add(f, "saved"));

const KEEP = /(cafe|café|coffee|brew|roaster|restaurant|kitchen|dhaba|dish|flavour|flavor|\bfood\b|eatery|bistro|grill|pizza|biryani|baker|sweets|\bbar\b|pub|brewery|homestay|home stay|\bstay\b|resort|farms?\b|retreat|hotel|suites|lodge|hostel|beach|hills?|falls|fort|palace|temple|lake|\bpark\b|trail|trek|tea|chai|idli|dosa|meals|kebab|tandoor|punjab|naga)/i;
const DROP = /(salon|dental|orthodont|implant|optical|sunglass|physiother|physio|chiropract|clinic|hospital|gallery|\bstore\b|outlet|exclusive|jockey|asics|linen|ceramics|beauty|academy|tailor|boutique|jewel|mobile|electronics|hardware|service cent|garage|dentist|gym|fitness|sports club|dog studio|pet groom|watch|hairmagi)/i;

const bucket = (r) =>
  DROP.test(r.Name) || (r.Rating !== "" && Number(r.Rating) < 3) ? "drop" : KEEP.test(r.Name) ? "keep" : "uncertain";
for (const r of rows) r._b = bucket(r);

const cols = ["Name", "Region", "Food", "Note", "Rating", "Lat", "Lng", "Date"];
const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
const toCsv = (rs) => [cols.join(","), ...rs.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
fs.writeFileSync(OUT, toCsv(rows));
const curated = rows.filter((r) => r._b !== "drop");
const curatedPath = OUT.replace(".csv", "-curated.csv");
try {
  fs.writeFileSync(curatedPath, toCsv(curated));
} catch {
  // File is open (e.g. in Excel) — fall back to a fresh name so we never block.
  fs.writeFileSync(OUT.replace(".csv", "-final.csv"), toCsv(curated));
  console.log("\n(curated.csv was locked — wrote places-backfill-final.csv instead)");
}

const list = (b) => rows.filter((r) => r._b === b).map((r) => `  - ${r.Name}  [${r.Region}]${r.Rating ? ` ★${r.Rating}` : ""}`).join("\n");
console.log(`Total ${rows.length}  ·  in India ${rows.filter((r) => r._country === "IN").length}\n`);
console.log(`=== KEEP — food / travel / stays (${rows.filter((r) => r._b === "keep").length}) ===\n${list("keep")}`);
console.log(`\n=== UNCERTAIN — you decide (${rows.filter((r) => r._b === "uncertain").length}) ===\n${list("uncertain")}`);
console.log(`\n=== DROP — errands/retail/medical (${rows.filter((r) => r._b === "drop").length}) ===\n${list("drop")}`);
console.log(`\nFull CSV → ${OUT}`);
console.log(`Curated CSV (keep + uncertain) → ${OUT.replace(".csv", "-curated.csv")}`);
