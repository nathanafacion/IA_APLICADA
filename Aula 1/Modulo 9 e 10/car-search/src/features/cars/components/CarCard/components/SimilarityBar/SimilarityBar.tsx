import type { SimilarityBarProps } from "./SimilarityBar.types";

export function SimilarityBar({ score }: SimilarityBarProps) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 85 ? "bg-green-500"
    : pct >= 70 ? "bg-emerald-400"
    : pct >= 55 ? "bg-yellow-400"
    : "bg-orange-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-600 w-10 text-right">{pct}%</span>
    </div>
  );
}
