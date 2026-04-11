import { describe, it, expect } from "vitest";
import {
  extractKeywords,
  calculateScore,
  generateFeedback,
  extractTopic,
  capitalize,
} from "@/features/analyzer/services/analyzeContent";

// ─── extractKeywords ───────────────────────────────────────

describe("extractKeywords", () => {
  describe("happy path", () => {
    it("should extract meaningful keywords from title and description", () => {
      // Arrange
      const title = "IA vai revolucionar o mundo";
      const description = "Inteligência artificial está mudando tudo";

      // Act
      const result = extractKeywords(title, description);

      // Assert
      expect(result).toContain("vai");
      expect(result).toContain("revolucionar");
      expect(result).toContain("mundo");
      expect(result).toContain("inteligência");
      expect(result).toContain("artificial");
    });

    it("should remove stopwords", () => {
      // Arrange
      const title = "O futuro da tecnologia";

      // Act
      const result = extractKeywords(title, "");

      // Assert
      expect(result).not.toContain("o");
      expect(result).not.toContain("da");
      expect(result).toContain("futuro");
      expect(result).toContain("tecnologia");
    });

    it("should return deduplicated keywords", () => {
      // Arrange
      const title = "IA e mais IA";
      const description = "IA é o futuro";

      // Act
      const result = extractKeywords(title, description);

      // Assert
      const filtered = result.filter((k) => k === "mais");
      expect(filtered.length).toBeLessThanOrEqual(1);
    });
  });

  describe("edge cases", () => {
    it("should handle empty title and description", () => {
      const result = extractKeywords("", "");
      expect(result).toEqual([]);
    });

    it("should filter words with less than 3 characters", () => {
      const result = extractKeywords("AI is ok", "");
      // "ai" = 2 chars, "is" = stopword, "ok" = 2 chars
      expect(result).toEqual([]);
    });

    it("should handle special characters", () => {
      const result = extractKeywords("Next.js é incrível!", "");
      expect(result).toContain("nextjs");
      expect(result).toContain("incrível");
    });

    it("should handle Portuguese accented words", () => {
      const result = extractKeywords("programação avançada", "");
      expect(result).toContain("programação");
      expect(result).toContain("avançada");
    });
  });
});

// ─── calculateScore ────────────────────────────────────────

describe("calculateScore", () => {
  describe("happy path", () => {
    it("should calculate score based on average interest", () => {
      // Arrange — all 50 → avg 50, no trend bonus, no peak bonus
      const values = [50, 50, 50, 50, 50, 50, 50, 50];

      // Act
      const score = calculateScore(values);

      // Assert
      expect(score).toBe(50);
    });

    it("should add trend bonus when recent values are above average", () => {
      // Arrange — avg ~30, recent (last 4) avg ~70 → trendBonus +15
      const values = [10, 10, 10, 10, 70, 70, 70, 70];

      // Act
      const score = calculateScore(values);

      // Assert
      const avg = 40;
      expect(score).toBe(avg + 15); // 55
    });

    it("should add peak bonus when max value >= 80", () => {
      // Arrange — all 80, avg 80, recent == avg so no trend bonus, but peak bonus +10
      const values = [80, 80, 80, 80];

      // Act
      const score = calculateScore(values);

      // Assert
      expect(score).toBe(90); // 80 + 10 peak
    });

    it("should add both bonuses when applicable", () => {
      // Arrange — avg ~52.5, recent avg ~85 > avg → trend +15, peak >= 80 → +10
      const values = [20, 20, 20, 20, 80, 80, 90, 90];

      // Act
      const score = calculateScore(values);

      // Assert
      const avg = Math.round((20 * 4 + 80 + 80 + 90 + 90) / 8); // 52.5 → 53
      expect(score).toBe(Math.min(100, avg + 15 + 10));
    });

    it("should cap score at 100", () => {
      // Arrange — high values that would exceed 100
      const values = [95, 95, 95, 95, 95, 95, 95, 95];

      // Act
      const score = calculateScore(values);

      // Assert
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("edge cases", () => {
    it("should return 0 for empty array", () => {
      expect(calculateScore([])).toBe(0);
    });

    it("should handle single value", () => {
      const score = calculateScore([60]);
      expect(score).toBeGreaterThan(0);
    });

    it("should handle all zeros", () => {
      const score = calculateScore([0, 0, 0, 0]);
      expect(score).toBe(0);
    });
  });
});

// ─── generateFeedback ──────────────────────────────────────

describe("generateFeedback", () => {
  it("should return excellent feedback for score >= 80", () => {
    const result = generateFeedback(80, ["ia", "tecnologia", "futuro"]);
    expect(result).toContain("Excelente potencial");
    expect(result).toContain("ia, tecnologia, futuro");
  });

  it("should return good feedback for score 60-79", () => {
    const result = generateFeedback(65, ["test"]);
    expect(result).toContain("Bom potencial");
  });

  it("should return moderate feedback for score 40-59", () => {
    const result = generateFeedback(45, ["test"]);
    expect(result).toContain("Potencial moderado");
  });

  it("should return low feedback for score < 40", () => {
    const result = generateFeedback(20, ["test"]);
    expect(result).toContain("Potencial baixo");
  });

  it("should include only first 3 keywords in excellent feedback", () => {
    const result = generateFeedback(90, ["alpha", "beta", "gamma", "delta", "epsilon"]);
    expect(result).toContain("alpha, beta, gamma");
    expect(result).not.toContain("delta");
    expect(result).not.toContain("epsilon");
  });
});

// ─── extractTopic ──────────────────────────────────────────

describe("extractTopic", () => {
  describe("happy path", () => {
    it("should keep the phrase intact", () => {
      expect(extractTopic("IA vai revolucionar o mundo")).toBe(
        "IA vai revolucionar o mundo",
      );
    });

    it("should remove leading articles", () => {
      expect(extractTopic("A IA vai revolucionar")).toBe(
        "IA vai revolucionar",
      );
      expect(extractTopic("O futuro da programação")).toBe(
        "futuro da programação",
      );
    });

    it("should remove trailing punctuation", () => {
      expect(extractTopic("IA vai revolucionar o mundo!")).toBe(
        "IA vai revolucionar o mundo",
      );
      expect(extractTopic("Como usar IA?")).toBe("Como usar IA");
      expect(extractTopic("Guia completo:")).toBe("Guia completo");
    });
  });

  describe("edge cases", () => {
    it("should handle already clean titles", () => {
      expect(extractTopic("Next.js Tutorial")).toBe("Next.js Tutorial");
    });

    it("should handle titles that are just an article", () => {
      const result = extractTopic("A");
      expect(result).toBeTruthy();
    });

    it("should handle empty string", () => {
      expect(extractTopic("")).toBe("");
    });

    it("should handle whitespace only", () => {
      expect(extractTopic("   ")).toBe("");
    });

    it("should be case insensitive for prefix removal", () => {
      expect(extractTopic("a programação avançada")).toBe(
        "programação avançada",
      );
      expect(extractTopic("THE future of AI")).toBe("future of AI");
    });
  });
});

// ─── capitalize ────────────────────────────────────────────

describe("capitalize", () => {
  it("should capitalize each word in a string", () => {
    expect(capitalize("hello world")).toBe("Hello World");
  });

  it("should handle single word", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("should handle already capitalized words", () => {
    expect(capitalize("Hello World")).toBe("Hello World");
  });

  it("should handle empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("should preserve uppercase characters in the middle", () => {
    expect(capitalize("chatGPT")).toBe("ChatGPT");
  });
});
