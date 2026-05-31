import { describe, it, expect } from "vitest";
import { formatScore, scoreColor, scoreBg, formatDate } from "@/utils/formatting";

describe("formatScore", () => {
  describe("happy path", () => {
    it("should return 'Excelente' for score >= 80", () => {
      expect(formatScore(80)).toBe("Excelente");
      expect(formatScore(100)).toBe("Excelente");
    });

    it("should return 'Bom' for score 60-79", () => {
      expect(formatScore(60)).toBe("Bom");
      expect(formatScore(79)).toBe("Bom");
    });

    it("should return 'Moderado' for score 40-59", () => {
      expect(formatScore(40)).toBe("Moderado");
      expect(formatScore(59)).toBe("Moderado");
    });

    it("should return 'Fraco' for score 20-39", () => {
      expect(formatScore(20)).toBe("Fraco");
      expect(formatScore(39)).toBe("Fraco");
    });

    it("should return 'Muito Fraco' for score < 20", () => {
      expect(formatScore(0)).toBe("Muito Fraco");
      expect(formatScore(19)).toBe("Muito Fraco");
    });
  });

  describe("edge cases", () => {
    it("should handle exact boundary values", () => {
      expect(formatScore(80)).toBe("Excelente");
      expect(formatScore(60)).toBe("Bom");
      expect(formatScore(40)).toBe("Moderado");
      expect(formatScore(20)).toBe("Fraco");
    });
  });
});

describe("scoreColor", () => {
  it("should return emerald for score >= 80", () => {
    expect(scoreColor(80)).toBe("text-emerald-500");
    expect(scoreColor(100)).toBe("text-emerald-500");
  });

  it("should return cyan for score 60-79", () => {
    expect(scoreColor(60)).toBe("text-cyan-500");
  });

  it("should return amber for score 40-59", () => {
    expect(scoreColor(40)).toBe("text-amber-500");
  });

  it("should return orange for score 20-39", () => {
    expect(scoreColor(20)).toBe("text-orange-500");
  });

  it("should return rose for score < 20", () => {
    expect(scoreColor(0)).toBe("text-rose-500");
    expect(scoreColor(19)).toBe("text-rose-500");
  });
});

describe("scoreBg", () => {
  it("should return emerald gradient for score >= 80", () => {
    expect(scoreBg(80)).toContain("emerald");
  });

  it("should return cyan gradient for score 60-79", () => {
    expect(scoreBg(65)).toContain("cyan");
  });

  it("should return amber gradient for score 40-59", () => {
    expect(scoreBg(50)).toContain("amber");
  });

  it("should return orange gradient for score 20-39", () => {
    expect(scoreBg(30)).toContain("orange");
  });

  it("should return rose gradient for score < 20", () => {
    expect(scoreBg(10)).toContain("rose");
  });
});

describe("formatDate", () => {
  it("should format a date in pt-BR", () => {
    // Arrange
    const dateStr = "2025-06-15";

    // Act
    const result = formatDate(dateStr);

    // Assert - check it returns a non-empty localized string containing year
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/jun/i);
  });

  it("should handle ISO date strings", () => {
    const result = formatDate("2025-07-15T12:00:00Z");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/jul/i);
  });
});
