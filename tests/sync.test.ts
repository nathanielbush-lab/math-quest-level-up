import { describe, expect, it } from "vitest";
import { decide, isScriptUrl, newSecret, parseSyncCode, scriptSource, serialize, syncCode } from "../src/sync/sync";
import { newState, parseImport } from "../src/engine/state";

const URL = "https://script.google.com/macros/s/AKfycbx_abc-123/exec";

describe("sync codes", () => {
  it("round-trips a URL and secret", () => {
    const key = newSecret();
    expect(key).toMatch(/^[A-Za-z0-9]{18}$/);
    expect(parseSyncCode(syncCode({ url: URL, key }))).toEqual({ url: URL, key });
    expect(parseSyncCode(`  ${URL}#${key}  `)).toEqual({ url: URL, key });
  });
  it("rejects things that aren't sync codes", () => {
    expect(parseSyncCode(URL)).toBeNull();
    expect(parseSyncCode("https://example.com/exec#abcdefghijklmnop")).toBeNull();
    expect(parseSyncCode(`${URL}#short`)).toBeNull();
    expect(isScriptUrl("https://script.google.com/a/macros/school.org/s/AKfy123/exec")).toBe(true);
    expect(isScriptUrl("https://script.google.com/macros/s/AKfy123/dev")).toBe(false);
  });
  it("puts the secret in the script", () => {
    expect(scriptSource("SECRET123abc")).toContain("const SECRET = 'SECRET123abc';");
    expect(scriptSource("x")).toContain("@OnlyCurrentDoc");
  });
});

describe("which copy wins", () => {
  const a = "2026-10-12T10:00:00.000Z";
  const b = "2026-10-12T11:00:00.000Z";
  const c = "2026-10-12T12:00:00.000Z";
  it("pushes when the Sheet is empty and does nothing when they match", () => {
    expect(decide(a, null, undefined)).toBe("push");
    expect(decide(a, a, undefined)).toBe("noop");
  });
  it("copies whichever side changed", () => {
    expect(decide(a, b, a)).toBe("pull");
    expect(decide(b, a, a)).toBe("push");
  });
  it("lets the more recent change win when both changed", () => {
    expect(decide(b, c, a)).toBe("take-remote");
    expect(decide(c, b, a)).toBe("keep-local");
  });
});

describe("serialize", () => {
  it("leaves out the API key and round-trips through import", () => {
    const s = newState();
    s.settings.studentName = "Sam";
    s.settings.apiKey = "sk-secret";
    const text = serialize(s);
    expect(text).not.toContain("sk-secret");
    expect(parseImport(text).settings.studentName).toBe("Sam");
  });
});
