// Parse Google Takeout "Saved" lists (Want to go / Favourites / per-trip lists)
// into a CSV for the Airtable Places base. These exports carry no coordinates or
// dates — the list name itself supplies Region and intent (Tag).
// Run: node scripts/parse-saved-lists.mjs
import fs from "node:fs";
import path from "node:path";

const DIR = "C:/Users/ASUS/Downloads/takeout-saved/Takeout/Saved";
const OUT = "C:/Users/ASUS/Downloads/places-saved-lists.csv";

// Lists that aren't travel places at all (articles, wallpapers, errands).
const SKIP = new Set([
  "Saved for later", "Images", "My Cookbook", "Temp", "Temp(1)",
  "Construction", "Hotels", "Runs",
]);

// List name → Region shown on the site. "" = unsorted (grouped as Elsewhere).
const REGION = {
  "Assam": "Assam",
  "Bangalore tourist": "Bengaluru, Karnataka",
  "Blr restaurants": "Bengaluru, Karnataka",
  "In Bangalore misc": "Bengaluru, Karnataka",
  "Indiranagar restaurants": "Bengaluru, Karnataka",
  "Resorts near by": "Around Bengaluru",
  "Treks near Blr": "Around Bengaluru",
  "Chikkaballapur": "Chikkaballapur, Karnataka",
  "Chandigarh": "Chandigarh",
  "Chettinad": "Chettinad, Tamil Nadu",
  "Coonoor": "Coonoor, Tamil Nadu",
  "Ooty": "Ooty, Tamil Nadu",
  "Tamil nadu": "Tamil Nadu",
  "Dec2023": "Malnad, Karnataka", // the Kavaledurga / Hidlumane trek trip
  "Malnad restaurants": "Malnad, Karnataka",
  "Ghatis of KA": "Western Ghats, Karnataka",
  "Karnataka": "Karnataka",
  "Mysore": "Mysuru, Karnataka",
  "Delhi": "Delhi",
  "Gujarat": "Gujarat",
  "Himachal": "Himachal Pradesh",
  "Kashmir": "Kashmir",
  "Kashmir(1)": "Kashmir",
  "Srinagar": "Srinagar, Kashmir",
  "Kerala": "Kerala",
  "Leh": "Ladakh",
  "Leh hotels": "Ladakh",
  "Leh treks": "Ladakh",
  "Monastery": "Ladakh",
  "Road to leh": "Ladakh",
  "Meghalaya": "Meghalaya",
  "Nagaland": "Nagaland",
  "Tezpur": "Tezpur, Assam",
  "Pondi": "Puducherry",
  "Telangana": "Telangana",
  "Udaipur": "Udaipur, Rajasthan",
  "West Bengal": "West Bengal",
  "Usa food": "USA",
  "Vietnam": "Vietnam",
};

const TAG = (list) =>
  list === "Favourite places" ? "loved it" : list === "Been here" ? "been" : "on the list";

// Minimal proper CSV parser (quoted fields can hold commas/newlines).
function parseCsv(text) {
  const rows = [];
  let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const byKey = new Map(); // dedupe across lists; prefer the entry that has a Region
let skippedRows = 0;

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".csv"))) {
  const list = path.basename(file, ".csv");
  if (SKIP.has(list)) continue;
  const rows = parseCsv(fs.readFileSync(`${DIR}/${file}`, "utf8"));
  rows.shift(); // header
  for (const r of rows) {
    const [title, note, url] = [r[0]?.trim(), r[1]?.trim(), r[2]?.trim()];
    if (!title) continue;
    if (!/google\.[^/]+\/maps/.test(url ?? "")) { skippedRows++; continue; } // not a place
    const id = url.match(/1s(0x[0-9a-f]+:0x[0-9a-f]+)/)?.[1] ?? title.toLowerCase();
    const entry = {
      Name: title.replace(/\s+/g, " "),
      Region: REGION[list] ?? "",
      Food: "",
      Note: note ?? "",
      Rating: "", Lat: "", Lng: "", Date: "",
      Tag: TAG(list),
      _list: list,
    };
    const prev = byKey.get(id);
    if (!prev || (!prev.Region && entry.Region) || (prev.Tag === "on the list" && entry.Tag !== "on the list")) {
      if (prev) { // keep the stronger tag / region from either copy
        entry.Region = entry.Region || prev.Region;
        entry.Tag = entry.Tag === "on the list" ? prev.Tag : entry.Tag;
        entry.Note = entry.Note || prev.Note;
      }
      byKey.set(id, entry);
    }
  }
}

const all = [...byKey.values()];
const cols = ["Name", "Region", "Food", "Note", "Rating", "Lat", "Lng", "Date", "Tag"];
const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
fs.writeFileSync(OUT, [cols.join(","), ...all.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n"));

const groups = {};
for (const r of all) (groups[r.Region || "(unsorted)"] ??= []).push(r);
console.log(`Places: ${all.length} (deduped) · non-place rows skipped: ${skippedRows}\n`);
for (const [region, rs] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${String(rs.length).padStart(3)}  ${region}${rs.some((r) => r.Tag !== "on the list") ? `  (${rs.filter((r) => r.Tag !== "on the list").map((r) => r.Tag + ": " + r.Name).join("; ")})` : ""}`);
}
console.log(`\nCSV → ${OUT}`);
