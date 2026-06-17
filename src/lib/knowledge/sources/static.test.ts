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

test("work adapter returns featured + projects + roles", async () => {
  const docs = await collectWork();
  expect(docs.length).toBeGreaterThan(3);
  expect(docs.every((d) => d.source === "work")).toBe(true);
  expect(docs[0].text).toMatch(/Flight-Search/);
});

test("movement adapter mentions the trek height", async () => {
  const [doc] = await collectMovement();
  expect(doc.text).toMatch(/15,500/);
});

test("profile adapter includes location and the physical stats", async () => {
  const [doc] = await collectProfile();
  expect(doc.text).toMatch(/Bengaluru/);
  expect(doc.text).toMatch(/185 cm/);
  expect(doc.text).toMatch(/75 kg/);
});
