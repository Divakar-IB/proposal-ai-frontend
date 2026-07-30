import { describe, it, expect } from "vitest";
import { getInitials } from "../utils";

describe("getInitials", () => {
  it("returns initials for a full name", () => {
    expect(getInitials("John Smith")).toBe("JS");
  });

  it("returns single initial for a single word name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("is case-insensitive — always uppercases", () => {
    expect(getInitials("john smith")).toBe("JS");
  });

  it("returns only the first two initials for names with more than two words", () => {
    expect(getInitials("Mary Jane Watson")).toBe("MJ");
  });

  it("returns '?' for null", () => {
    expect(getInitials(null)).toBe("?");
  });

  it("returns '?' for empty string", () => {
    expect(getInitials("")).toBe("?");
  });
});
