import { describe, expect, it } from "vitest";
import { formatTanggal, getJakartaNow, nextMealSlot, selisihHari, tambahHari } from "./date";

describe("6.6 waktu Jakarta", () => {
  it("2026-11-22T17:30:00Z → 2026-11-23 jam 0", () => {
    expect(getJakartaNow(new Date("2026-11-22T17:30:00Z"))).toEqual({ tanggal: "2026-11-23", jam: 0 });
  });

  it("sore hari UTC", () => {
    expect(getJakartaNow(new Date("2026-11-23T08:05:00Z"))).toEqual({ tanggal: "2026-11-23", jam: 15 });
  });

  it.each([
    [9, "sarapan"],
    [10, "makan_siang"],
    [15, "camilan"],
    [18, "makan_malam"],
    [22, null],
    [0, "sarapan"],
    [14, "makan_siang"],
    [17, "camilan"],
    [21, "makan_malam"],
    [23, null],
  ])("nextMealSlot(%s) → %s", (jam, slot) => {
    expect(nextMealSlot(jam)).toBe(slot);
  });
});

describe("util tanggal", () => {
  it("tambahHari lintas bulan", () => {
    expect(tambahHari("2026-12-01", -3)).toBe("2026-11-28");
    expect(tambahHari("2026-12-31", 1)).toBe("2027-01-01");
  });
  it("selisihHari", () => {
    expect(selisihHari("2026-11-20", "2026-11-23")).toBe(3);
  });
  it("formatTanggal", () => {
    expect(formatTanggal("2026-11-23")).toBe("Senin, 23 November");
  });
});
