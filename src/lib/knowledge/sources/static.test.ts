import {
  collectCricket, collectTravel, collectWork, collectMovement, collectProfile,
} from "./static";

test("cricket adapter mentions the bowling heroes", async () => {
  const [doc] = await collectCricket();
  expect(doc.source).toBe("cricket");
  expect(doc.text).toMatch(/Dale Steyn/);
});

test("travel adapter lists visited regions", async () => {
  const [doc] = await collectTravel();
  expect(doc.source).toBe("travel");
  expect(doc.text).toMatch(/Karnataka/);
});

test("work adapter returns projects + roles incl. the flight pipeline", async () => {
  const docs = await collectWork();
  expect(docs.length).toBeGreaterThan(3);
  expect(docs.every((d) => d.source === "work")).toBe(true);
  expect(docs.some((d) => /flight-search/i.test(d.text))).toBe(true);
});

test("movement adapter returns overview, Shitidhar and Yunam docs", async () => {
  const docs = await collectMovement();
  expect(docs.map((d) => d.id)).toEqual([
    "movement:overview", "movement:shitidhar", "movement:yunam",
  ]);
  expect(docs.every((d) => d.source === "movement" && d.url === "/movement")).toBe(true);
});

test("movement Shitidhar doc names the course, peak and the 15,500 ft height", async () => {
  const docs = await collectMovement();
  const shitidhar = docs.find((d) => d.id === "movement:shitidhar")!;
  expect(shitidhar.text).toMatch(/ABVMAS/);
  expect(shitidhar.text).toMatch(/Shitidhar/);
  expect(shitidhar.text).toMatch(/15,500/);
});

test("movement Yunam doc carries the 'broke me / turned back' failure language", async () => {
  const docs = await collectMovement();
  const yunam = docs.find((d) => d.id === "movement:yunam")!;
  expect(yunam.text).toMatch(/broke me/i);
  expect(yunam.text).toMatch(/turned back/i);
});

test("profile adapter includes location and the physical stats", async () => {
  const [doc] = await collectProfile();
  expect(doc.text).toMatch(/Bengaluru/);
  expect(doc.text).toMatch(/185 cm/);
  expect(doc.text).toMatch(/75 kg/);
});
