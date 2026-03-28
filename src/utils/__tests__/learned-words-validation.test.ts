import { describe, expect, it } from "vitest";

import { validateLearnedWordInput } from "~/utils/learned-words";

describe("validateLearnedWordInput", () => {
  it("accepts valid word and translation", () => {
    const result = validateLearnedWordInput({
      word: "hello",
      translation: "halo",
    });

    expect(result.word).toBe("hello");
    expect(result.translation).toBe("halo");
  });

  it("trims whitespace from inputs", () => {
    const result = validateLearnedWordInput({
      word: "  hello  ",
      translation: "  halo  ",
    });

    expect(result.word).toBe("hello");
    expect(result.translation).toBe("halo");
  });

  it("rejects empty word", () => {
    expect(() =>
      validateLearnedWordInput({ word: "", translation: "halo" }),
    ).toThrow();
  });

  it("rejects empty translation", () => {
    expect(() =>
      validateLearnedWordInput({ word: "hello", translation: "" }),
    ).toThrow();
  });

  it("rejects whitespace-only word", () => {
    expect(() =>
      validateLearnedWordInput({ word: "   ", translation: "halo" }),
    ).toThrow();
  });

  it("rejects whitespace-only translation", () => {
    expect(() =>
      validateLearnedWordInput({ word: "hello", translation: "   " }),
    ).toThrow();
  });
});
