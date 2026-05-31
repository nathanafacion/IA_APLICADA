import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuggestionsDisplay } from "@/features/analyzer/components/SuggestionsDisplay";
import type { Suggestion } from "@/store/useAppStore";

const suggestions: Suggestion[] = [
  { title: "Como IA: Guia Completo 2026", description: "Descubra as melhores práticas.", estimatedScore: 85 },
  { title: "IA e ChatGPT: Tudo", description: "Aprenda tudo sobre.", estimatedScore: 72 },
  { title: "Por que IA Está em Alta", description: "Explore tendências.", estimatedScore: 60 },
];

describe("SuggestionsDisplay", () => {
  it("should render all suggestion titles", () => {
    render(<SuggestionsDisplay suggestions={suggestions} originalScore={50} />);

    expect(screen.getByText("Como IA: Guia Completo 2026")).toBeInTheDocument();
    expect(screen.getByText("IA e ChatGPT: Tudo")).toBeInTheDocument();
    expect(screen.getByText("Por que IA Está em Alta")).toBeInTheDocument();
  });

  it("should render suggestion descriptions", () => {
    render(<SuggestionsDisplay suggestions={suggestions} originalScore={50} />);

    expect(screen.getByText("Descubra as melhores práticas.")).toBeInTheDocument();
  });

  it("should render estimated scores", () => {
    render(<SuggestionsDisplay suggestions={suggestions} originalScore={50} />);

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("should show score difference when suggestion is higher than original", () => {
    render(<SuggestionsDisplay suggestions={suggestions} originalScore={50} />);

    // 85 - 50 = +35, 72 - 50 = +22, 60 - 50 = +10
    expect(screen.getByText("+35 pts")).toBeInTheDocument();
    expect(screen.getByText("+22 pts")).toBeInTheDocument();
    expect(screen.getByText("+10 pts")).toBeInTheDocument();
  });

  it("should not show score difference when suggestion equals original", () => {
    const equalSuggestions: Suggestion[] = [
      { title: "Test", description: "Desc", estimatedScore: 50 },
    ];

    render(<SuggestionsDisplay suggestions={equalSuggestions} originalScore={50} />);

    expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
  });

  it("should render numbered indicators", () => {
    render(<SuggestionsDisplay suggestions={suggestions} originalScore={50} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should render the section heading", () => {
    render(<SuggestionsDisplay suggestions={suggestions} originalScore={50} />);

    expect(screen.getByText(/Sugestões de Títulos Otimizados/)).toBeInTheDocument();
  });
});
