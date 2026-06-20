import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logQuestion } from "./airtable-questions";

const realFetch = globalThis.fetch;
const realToken = process.env.AIRTABLE_TOKEN;

describe("logQuestion", () => {
  beforeEach(() => {
    process.env.AIRTABLE_TOKEN = "key-test";
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "" }) as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    if (realToken === undefined) delete process.env.AIRTABLE_TOKEN;
    else process.env.AIRTABLE_TOKEN = realToken;
    vi.restoreAllMocks();
  });

  it("does nothing when there is no token", async () => {
    delete process.env.AIRTABLE_TOKEN;
    await logQuestion("how do you bake?", "answered");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("skips empty or overlong questions", async () => {
    await logQuestion("   ", "answered");
    await logQuestion("x".repeat(501), "unanswered");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("POSTs a valid question to the Questions table with its outcome", async () => {
    await logQuestion("where do you bake?", "answered", "Bakery");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("/appOjONooljd6cwwi/Questions");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.fields.Question).toBe("where do you bake?");
    expect(body.fields.Status).toBe("answered");
    expect(body.fields.TopSource).toBe("Bakery");
    expect(body.typecast).toBe(true);
  });

  it("omits TopSource when none is given", async () => {
    await logQuestion("hey", "greeting");
    const [, init] = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.fields.Status).toBe("greeting");
    expect("TopSource" in body.fields).toBe(false);
  });

  it("never throws when the network fails", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;
    await expect(logQuestion("anything", "answered")).resolves.toBeUndefined();
  });
});
