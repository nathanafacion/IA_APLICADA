import { COR_CLASSES, TIPO_ICONS, COMBUSTIVEL_COLORS } from "./CarCard.constants";
import { SimilarityBar } from "./components/SimilarityBar";
import type { CarCardProps } from "./CarCard.types";

export default function CarCard({ car, rank }: CarCardProps) {
  const corClass = COR_CLASSES[car.cor] ?? "bg-gray-300";
  const icon = TIPO_ICONS[car.tipo] ?? "🚗";
  const fuelClass = COMBUSTIVEL_COLORS[car.combustivel] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-300 transition-all duration-300 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">
              {car.marca} {car.modelo}
            </h3>
            <span className="text-green-200 text-sm">{car.ano}</span>
          </div>
        </div>
        <span className="text-white/50 text-4xl font-black">#{rank}</span>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Similaridade Vetorial
          </span>
          <SimilarityBar score={car.score} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className={`w-4 h-4 rounded-full flex-shrink-0 ${corClass}`} />
            <span className="text-sm text-gray-700">{car.cor}</span>
          </div>
          <div className={`rounded-lg px-3 py-2 text-sm font-medium ${fuelClass}`}>
            {car.combustivel.charAt(0).toUpperCase() + car.combustivel.slice(1)}
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500">Motor</span>
            <p className="text-sm font-semibold text-gray-800">{car.motor}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500">Câmbio</span>
            <p className="text-sm font-semibold text-gray-800 capitalize">{car.cambio}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500">Potência</span>
            <p className="text-sm font-semibold text-gray-800">{car.potencia} cv</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500">Quilometragem</span>
            <p className="text-sm font-semibold text-gray-800">
              {car.quilometragem.toLocaleString("pt-BR")} km
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-gray-500 text-sm">{car.tipo} · {car.portas}p</span>
          <span className="text-xl font-black text-green-700">
            R$ {car.preco.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}
