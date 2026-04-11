import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreDisplay } from "@/features/analyzer/components/ScoreDisplay";
import type { AnalysisResult } from "@/store/useAppStore";

const baseResult: AnalysisResult = {
  score: 75,
  feedback: "Bom potencial. O conteúdo tem interesse consistente.",
  suggestedKeywords: ["ia", "tecnologia", "futuro"],
  trendData: [],
  suggestions: [],
};

describe("ScoreDisplay", () => {
  it("should render the score value", () => {
    render(<ScoreDisplay result={baseResult} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("should render /100 label", () => {
    render(<ScoreDisplay result={baseResult} />);
    expect(screen.getByText("/100")).toBeInTheDocument();
  });

  it("should render the feedback text", () => {
    render(<ScoreDisplay result={baseResult} />);
    expect(
      screen.getByText(/Bom potencial/),
    ).toBeInTheDocument();
  });

  it("should render suggested keywords as badges", () => {
    render(<ScoreDisplay result={baseResult} />);
    expect(screen.getByText("ia")).toBeInTheDocument();
    expect(screen.getByText("tecnologia")).toBeInTheDocument();
    expect(screen.getByText("futuro")).toBeInTheDocument();
  });

  it("should render score badge label", () => {
    render(<ScoreDisplay result={baseResult} />);
    // formatScore(75) = "Bom"
    expect(screen.getByText("Bom")).toBeInTheDocument();
  });

  it("should render heading text", () => {
    render(<ScoreDisplay result={baseResult} />);
    expect(screen.getByText(/Resultado da Análise/)).toBeInTheDocument();
  });

  it("should render different score values", () => {
    const lowResult = { ...baseResult, score: 15 };
    render(<ScoreDisplay result={lowResult} />);
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Muito Fraco")).toBeInTheDocument();
  });
});
