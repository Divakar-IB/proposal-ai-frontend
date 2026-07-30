import { describe, it, expect } from "vitest";
import { formatDate, formatTime, formatDateTime } from "../date-format";

const ISO = "2026-07-09T07:51:00.000Z";

describe("formatDate", () => {
  it("formats an ISO string as DD Mon YYYY", () => {
    expect(formatDate(ISO)).toMatch(/09 Jul 2026/);
  });

  it("accepts a Date object", () => {
    expect(formatDate(new Date(ISO))).toMatch(/09 Jul 2026/);
  });
});

describe("formatTime", () => {
  it("returns a time string with AM/PM", () => {
    const result = formatTime(ISO);
    expect(result).toMatch(/am|pm/i);
  });

  it("accepts a Date object", () => {
    const result = formatTime(new Date(ISO));
    expect(result).toMatch(/am|pm/i);
  });
});

describe("formatDateTime", () => {
  it("contains the date portion", () => {
    expect(formatDateTime(ISO)).toMatch(/09 Jul 2026/);
  });

  it("contains an AM/PM time portion", () => {
    expect(formatDateTime(ISO)).toMatch(/am|pm/i);
  });

  it("accepts a Date object", () => {
    expect(formatDateTime(new Date(ISO))).toMatch(/09 Jul 2026/);
  });
});
