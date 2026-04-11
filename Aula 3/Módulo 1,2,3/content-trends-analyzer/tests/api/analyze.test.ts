import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock analyzeContent before importing the route
vi.mock("@/features/analyzer/services/analyzeContent", () => ({
  analyzeContent: vi.fn(),
  // Re-export the other functions that are now exported
  extractKeywords: vi.fn(),
  calculateScore: vi.fn(),
  generateFeedback: vi.fn(),
  extractTopic: vi.fn(),
  capitalize: vi.fn(),
}));

import { analyzeContent } from "@/features/analyzer/services/analyzeContent";
import { POST } from "@/app/api/analyze/route";
import { NextRequest } from "next/server";

const mockAnalyze = vi.mocked(analyzeContent);

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return analysis result for valid input", async () => {
    // Arrange
    const mockResult = {
      score: 75,
      feedback: "Bom potencial.",
      suggestedKeywords: ["ia"],
      trendData: [],
      suggestions: [],
    };
    mockAnalyze.mockResolvedValue(mockResult);

    const request = createRequest({
      title: "IA vai revolucionar o mundo",
      description: "Artigo sobre IA",
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.score).toBe(75);
    expect(data.feedback).toBe("Bom potencial.");
    expect(mockAnalyze).toHaveBeenCalledWith(
      "IA vai revolucionar o mundo",
      "Artigo sobre IA",
    );
  });

  it("should return 400 when title is missing", async () => {
    // Arrange
    const request = createRequest({ description: "sem título" });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toContain("title");
  });

  it("should return 400 when title is not a string", async () => {
    // Arrange
    const request = createRequest({ title: 123 });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(400);
  });

  it("should handle missing description by defaulting to empty string", async () => {
    // Arrange
    mockAnalyze.mockResolvedValue({
      score: 50,
      feedback: "test",
      suggestedKeywords: [],
      trendData: [],
      suggestions: [],
    });
    const request = createRequest({ title: "Test Title" });

    // Act
    await POST(request);

    // Assert
    expect(mockAnalyze).toHaveBeenCalledWith("Test Title", "");
  });
});
