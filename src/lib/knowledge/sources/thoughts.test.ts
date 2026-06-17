import { vi, afterEach } from "vitest";
import { collectThoughts } from "./thoughts";

const OLD = process.env.AIRTABLE_TOKEN;
afterEach(() => { process.env.AIRTABLE_TOKEN = OLD; vi.restoreAllMocks(); });

test("returns [] when no token is set", async () => {
  delete process.env.AIRTABLE_TOKEN;
  expect(await collectThoughts()).toEqual([]);
});

test("maps Thoughts rows to RawDocs", async () => {
  process.env.AIRTABLE_TOKEN = "tok";
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
    records: [
      { id: "t1", fields: { Thought: "Sourdough is mostly patience.", Topic: "baking", Date: "2026-06-01" } },
      { id: "t2", fields: { Thought: "" } },
    ],
  }), { status: 200 })));
  const docs = await collectThoughts();
  expect(docs).toHaveLength(1);
  expect(docs[0]).toMatchObject({ id: "thought:t1", source: "thought", title: "baking" });
  expect(docs[0].text).toMatch(/patience/);
});

test("returns [] when the table is missing (non-ok response)", async () => {
  process.env.AIRTABLE_TOKEN = "tok";
  vi.stubGlobal("fetch", vi.fn(async () => new Response("not found", { status: 404 })));
  expect(await collectThoughts()).toEqual([]);
});
