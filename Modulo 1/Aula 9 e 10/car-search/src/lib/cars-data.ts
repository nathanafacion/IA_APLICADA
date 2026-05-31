// Dataset de carros baseado no UCI Automobile Dataset
// Adaptado com dados brasileiros e informações adicionais para RAG

export interface Car {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  tipo: string; // sedan, hatchback, SUV, esportivo, pickup, van
  combustivel: string; // gasolina, diesel, alcool, flex, elétrico
  cambio: string; // manual, automático
  motor: string; // ex: "2.0L", "1.6L Turbo"
  potencia: number; // cv
  quilometragem: number;
  preco: number; // R$
  portas: number;
  descricao: string; // texto para embedding
}

// Texto para embedding — combina atributos relevantes de forma descritiva
export function buildCarDescription(car: Omit<Car, "id" | "descricao">): string {
  return (
    `${car.ano} ${car.marca} ${car.modelo} — ${car.tipo}, cor ${car.cor}. ` +
    `Motor ${car.motor} ${car.combustivel}, câmbio ${car.cambio}, ${car.potencia} cv. ` +
    `${car.portas} portas, ${car.quilometragem.toLocaleString("pt-BR")} km rodados. ` +
    `Preço R$${car.preco.toLocaleString("pt-BR")}. ` +
    `Carro ${car.tipo.toLowerCase()} ${
      car.ano <= 1995
        ? "clássico e vintage"
        : car.ano <= 2005
        ? "dos anos 2000"
        : car.ano <= 2015
        ? "moderno"
        : "recente e atual"
    } ideal para ${
      car.tipo === "SUV"
        ? "família e aventura off-road"
        : car.tipo === "esportivo"
        ? "performance e dirigibilidade esportiva"
        : car.tipo === "pickup"
        ? "trabalho, campo e carga"
        : car.tipo === "van"
        ? "transporte de passageiros ou carga"
        : "uso urbano e dia a dia"
    }.`
  );
}

const rawCars: Omit<Car, "id" | "descricao">[] = [
  // --- Anos 1990-1992 ---
  { marca: "Volkswagen", modelo: "Gol", ano: 1990, cor: "Vermelho", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.0L", potencia: 55, quilometragem: 210000, preco: 8000, portas: 2 },
  { marca: "Chevrolet", modelo: "Monza", ano: 1990, cor: "Vermelho", tipo: "sedan", combustivel: "gasolina", cambio: "manual", motor: "1.8L", potencia: 85, quilometragem: 195000, preco: 10000, portas: 4 },
  { marca: "Ford", modelo: "Escort", ano: 1991, cor: "Branco", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.6L", potencia: 75, quilometragem: 180000, preco: 9500, portas: 4 },
  { marca: "Fiat", modelo: "Uno", ano: 1991, cor: "Vermelho", tipo: "hatchback", combustivel: "alcool", cambio: "manual", motor: "1.0L", potencia: 50, quilometragem: 220000, preco: 7000, portas: 2 },
  { marca: "Volkswagen", modelo: "Parati", ano: 1992, cor: "Azul", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.6L", potencia: 72, quilometragem: 175000, preco: 12000, portas: 4 },
  { marca: "Chevrolet", modelo: "Kadett", ano: 1992, cor: "Prata", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.8L", potencia: 88, quilometragem: 160000, preco: 11000, portas: 2 },
  { marca: "Fiat", modelo: "Premio", ano: 1992, cor: "Bege", tipo: "sedan", combustivel: "alcool", cambio: "manual", motor: "1.5L", potencia: 65, quilometragem: 200000, preco: 8500, portas: 4 },
  { marca: "Volkswagen", modelo: "Santana", ano: 1990, cor: "Cinza", tipo: "sedan", combustivel: "gasolina", cambio: "manual", motor: "2.0L", potencia: 110, quilometragem: 215000, preco: 13000, portas: 4 },
  { marca: "Toyota", modelo: "Corolla", ano: 1991, cor: "Branco", tipo: "sedan", combustivel: "gasolina", cambio: "manual", motor: "1.6L", potencia: 95, quilometragem: 170000, preco: 15000, portas: 4 },
  { marca: "Honda", modelo: "Civic", ano: 1992, cor: "Vermelho", tipo: "sedan", combustivel: "gasolina", cambio: "manual", motor: "1.5L", potencia: 92, quilometragem: 155000, preco: 16000, portas: 4 },

  // --- Anos 1993-1999 ---
  { marca: "Volkswagen", modelo: "Golf", ano: 1994, cor: "Verde", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.8L", potencia: 100, quilometragem: 145000, preco: 18000, portas: 4 },
  { marca: "Fiat", modelo: "Palio", ano: 1996, cor: "Vermelho", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.0L", potencia: 58, quilometragem: 130000, preco: 14000, portas: 4 },
  { marca: "Chevrolet", modelo: "Corsa", ano: 1995, cor: "Amarelo", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.0L", potencia: 55, quilometragem: 140000, preco: 12500, portas: 4 },
  { marca: "Ford", modelo: "Fiesta", ano: 1997, cor: "Azul", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.0L", potencia: 65, quilometragem: 115000, preco: 13000, portas: 4 },
  { marca: "Toyota", modelo: "Hilux", ano: 1998, cor: "Branco", tipo: "pickup", combustivel: "diesel", cambio: "manual", motor: "2.8L Diesel", potencia: 95, quilometragem: 250000, preco: 45000, portas: 4 },
  { marca: "Mitsubishi", modelo: "Pajero", ano: 1997, cor: "Preto", tipo: "SUV", combustivel: "diesel", cambio: "automático", motor: "3.0L V6", potencia: 170, quilometragem: 180000, preco: 55000, portas: 4 },
  { marca: "Volkswagen", modelo: "Gol G3", ano: 1999, cor: "Prata", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.0L", potencia: 60, quilometragem: 100000, preco: 16000, portas: 4 },
  { marca: "Fiat", modelo: "Punto", ano: 1999, cor: "Laranja", tipo: "hatchback", combustivel: "gasolina", cambio: "manual", motor: "1.6L", potencia: 100, quilometragem: 120000, preco: 17000, portas: 4 },
  { marca: "Chevrolet", modelo: "Vectra", ano: 1998, cor: "Cinza", tipo: "sedan", combustivel: "gasolina", cambio: "manual", motor: "2.0L", potencia: 115, quilometragem: 135000, preco: 22000, portas: 4 },
  { marca: "Honda", modelo: "CR-V", ano: 1999, cor: "Verde", tipo: "SUV", combustivel: "gasolina", cambio: "automático", motor: "2.0L", potencia: 128, quilometragem: 145000, preco: 38000, portas: 4 },

  // --- Anos 2000-2009 ---
  { marca: "Volkswagen", modelo: "Polo", ano: 2002, cor: "Prata", tipo: "sedan", combustivel: "flex", cambio: "manual", motor: "1.6L", potencia: 101, quilometragem: 95000, preco: 24000, portas: 4 },
  { marca: "Fiat", modelo: "Stilo", ano: 2003, cor: "Vermelho", tipo: "hatchback", combustivel: "flex", cambio: "manual", motor: "1.8L", potencia: 116, quilometragem: 88000, preco: 26000, portas: 4 },
  { marca: "Ford", modelo: "EcoSport", ano: 2004, cor: "Azul", tipo: "SUV", combustivel: "flex", cambio: "manual", motor: "1.6L", potencia: 100, quilometragem: 80000, preco: 32000, portas: 4 },
  { marca: "Chevrolet", modelo: "Meriva", ano: 2005, cor: "Bege", tipo: "van", combustivel: "flex", cambio: "manual", motor: "1.8L", potencia: 102, quilometragem: 92000, preco: 20000, portas: 4 },
  { marca: "Toyota", modelo: "Corolla", ano: 2007, cor: "Branco", tipo: "sedan", combustivel: "flex", cambio: "automático", motor: "1.8L", potencia: 136, quilometragem: 70000, preco: 45000, portas: 4 },
  { marca: "Honda", modelo: "Fit", ano: 2006, cor: "Preto", tipo: "hatchback", combustivel: "flex", cambio: "automático", motor: "1.4L", potencia: 88, quilometragem: 65000, preco: 30000, portas: 4 },
  { marca: "Volkswagen", modelo: "Golf GTI", ano: 2008, cor: "Vermelho", tipo: "esportivo", combustivel: "gasolina", cambio: "manual", motor: "2.0L Turbo", potencia: 200, quilometragem: 55000, preco: 65000, portas: 4 },
  { marca: "Nissan", modelo: "Frontier", ano: 2009, cor: "Prata", tipo: "pickup", combustivel: "diesel", cambio: "manual", motor: "2.5L Diesel", potencia: 133, quilometragem: 120000, preco: 58000, portas: 4 },
  { marca: "Hyundai", modelo: "Tucson", ano: 2008, cor: "Cinza", tipo: "SUV", combustivel: "gasolina", cambio: "automático", motor: "2.0L", potencia: 140, quilometragem: 75000, preco: 42000, portas: 4 },
  { marca: "Peugeot", modelo: "207", ano: 2009, cor: "Verde", tipo: "hatchback", combustivel: "flex", cambio: "manual", motor: "1.4L", potencia: 75, quilometragem: 68000, preco: 22000, portas: 4 },

  // --- Anos 2010-2015 ---
  { marca: "Volkswagen", modelo: "Gol G6", ano: 2012, cor: "Branco", tipo: "hatchback", combustivel: "flex", cambio: "manual", motor: "1.0L", potencia: 76, quilometragem: 50000, preco: 28000, portas: 4 },
  { marca: "Fiat", modelo: "Bravo", ano: 2011, cor: "Prata", tipo: "hatchback", combustivel: "flex", cambio: "manual", motor: "1.8L", potencia: 130, quilometragem: 48000, preco: 34000, portas: 4 },
  { marca: "Ford", modelo: "New Fiesta", ano: 2013, cor: "Vermelho", tipo: "hatchback", combustivel: "flex", cambio: "automático", motor: "1.6L", potencia: 120, quilometragem: 42000, preco: 38000, portas: 4 },
  { marca: "Chevrolet", modelo: "Onix", ano: 2014, cor: "Azul", tipo: "hatchback", combustivel: "flex", cambio: "manual", motor: "1.0L", potencia: 75, quilometragem: 38000, preco: 33000, portas: 4 },
  { marca: "Toyota", modelo: "SW4", ano: 2013, cor: "Preto", tipo: "SUV", combustivel: "diesel", cambio: "automático", motor: "3.0L Diesel", potencia: 171, quilometragem: 65000, preco: 120000, portas: 4 },
  { marca: "Jeep", modelo: "Compass", ano: 2015, cor: "Cinza", tipo: "SUV", combustivel: "flex", cambio: "automático", motor: "2.0L", potencia: 156, quilometragem: 35000, preco: 95000, portas: 4 },
  { marca: "Honda", modelo: "HR-V", ano: 2015, cor: "Branco", tipo: "SUV", combustivel: "flex", cambio: "automático", motor: "1.8L", potencia: 141, quilometragem: 30000, preco: 82000, portas: 4 },
  { marca: "Mitsubishi", modelo: "L200 Triton", ano: 2014, cor: "Branco", tipo: "pickup", combustivel: "diesel", cambio: "manual", motor: "2.5L Diesel", potencia: 178, quilometragem: 85000, preco: 88000, portas: 4 },
  { marca: "Volkswagen", modelo: "Jetta", ano: 2012, cor: "Preto", tipo: "sedan", combustivel: "flex", cambio: "automático", motor: "2.0L TSI", potencia: 211, quilometragem: 45000, preco: 72000, portas: 4 },
  { marca: "Hyundai", modelo: "HB20", ano: 2013, cor: "Vermelho", tipo: "hatchback", combustivel: "flex", cambio: "manual", motor: "1.0L Turbo", potencia: 100, quilometragem: 40000, preco: 35000, portas: 4 },

  // --- Anos 2016-2020 ---
  { marca: "Chevrolet", modelo: "Onix Plus", ano: 2019, cor: "Branco", tipo: "sedan", combustivel: "flex", cambio: "automático", motor: "1.0L Turbo", potencia: 116, quilometragem: 22000, preco: 68000, portas: 4 },
  { marca: "Volkswagen", modelo: "T-Cross", ano: 2020, cor: "Laranja", tipo: "SUV", combustivel: "flex", cambio: "automático", motor: "1.0L TSI", potencia: 128, quilometragem: 18000, preco: 98000, portas: 4 },
  { marca: "Fiat", modelo: "Toro", ano: 2018, cor: "Prata", tipo: "pickup", combustivel: "diesel", cambio: "automático", motor: "2.0L Diesel", potencia: 170, quilometragem: 45000, preco: 105000, portas: 4 },
  { marca: "Jeep", modelo: "Renegade", ano: 2017, cor: "Amarelo", tipo: "SUV", combustivel: "flex", cambio: "automático", motor: "2.0L", potencia: 156, quilometragem: 38000, preco: 82000, portas: 4 },
  { marca: "Toyota", modelo: "Hilux", ano: 2019, cor: "Preto", tipo: "pickup", combustivel: "diesel", cambio: "automático", motor: "2.8L Diesel", potencia: 204, quilometragem: 30000, preco: 175000, portas: 4 },
  { marca: "Ford", modelo: "Ranger", ano: 2018, cor: "Cinza", tipo: "pickup", combustivel: "diesel", cambio: "automático", motor: "3.2L Diesel", potencia: 200, quilometragem: 55000, preco: 145000, portas: 4 },
  { marca: "BMW", modelo: "320i", ano: 2018, cor: "Preto", tipo: "sedan", combustivel: "gasolina", cambio: "automático", motor: "2.0L Turbo", potencia: 184, quilometragem: 32000, preco: 158000, portas: 4 },
  { marca: "Mercedes-Benz", modelo: "C180", ano: 2017, cor: "Branco", tipo: "sedan", combustivel: "gasolina", cambio: "automático", motor: "1.6L Turbo", potencia: 156, quilometragem: 28000, preco: 162000, portas: 4 },
  { marca: "Volkswagen", modelo: "Polo GTS", ano: 2020, cor: "Vermelho", tipo: "esportivo", combustivel: "gasolina", cambio: "automático", motor: "1.4L TSI", potencia: 150, quilometragem: 15000, preco: 95000, portas: 4 },
  { marca: "Honda", modelo: "Civic Sport", ano: 2019, cor: "Azul", tipo: "sedan", combustivel: "flex", cambio: "manual", motor: "1.5L Turbo", potencia: 174, quilometragem: 20000, preco: 115000, portas: 4 },

  // --- Anos 2021-2024 ---
  { marca: "Toyota", modelo: "Yaris", ano: 2022, cor: "Branco", tipo: "sedan", combustivel: "flex", cambio: "automático", motor: "1.5L", potencia: 107, quilometragem: 12000, preco: 102000, portas: 4 },
  { marca: "Chevrolet", modelo: "Tracker", ano: 2023, cor: "Vermelho", tipo: "SUV", combustivel: "flex", cambio: "automático", motor: "1.2L Turbo", potencia: 133, quilometragem: 8000, preco: 130000, portas: 4 },
  { marca: "Fiat", modelo: "Fastback", ano: 2023, cor: "Prata", tipo: "SUV", combustivel: "flex", cambio: "automático", motor: "1.3L Turbo", potencia: 185, quilometragem: 5000, preco: 148000, portas: 4 },
  { marca: "BYD", modelo: "Dolphin", ano: 2024, cor: "Azul", tipo: "hatchback", combustivel: "elétrico", cambio: "automático", motor: "Motor Elétrico", potencia: 204, quilometragem: 3000, preco: 175000, portas: 4 },
  { marca: "Tesla", modelo: "Model 3", ano: 2022, cor: "Branco", tipo: "sedan", combustivel: "elétrico", cambio: "automático", motor: "Motor Elétrico Dual", potencia: 351, quilometragem: 18000, preco: 320000, portas: 4 },
  { marca: "Volkswagen", modelo: "Amarok V6", ano: 2023, cor: "Preto", tipo: "pickup", combustivel: "diesel", cambio: "automático", motor: "3.0L V6 Diesel", potencia: 258, quilometragem: 10000, preco: 290000, portas: 4 },
  { marca: "Jeep", modelo: "Wrangler", ano: 2022, cor: "Verde", tipo: "SUV", combustivel: "gasolina", cambio: "manual", motor: "3.6L V6", potencia: 285, quilometragem: 14000, preco: 380000, portas: 4 },
  { marca: "BMW", modelo: "M240i", ano: 2023, cor: "Azul", tipo: "esportivo", combustivel: "gasolina", cambio: "automático", motor: "3.0L Turbo", potencia: 374, quilometragem: 6000, preco: 420000, portas: 4 },
  { marca: "Porsche", modelo: "Cayenne", ano: 2022, cor: "Preto", tipo: "SUV", combustivel: "gasolina", cambio: "automático", motor: "3.0L Turbo", potencia: 340, quilometragem: 9000, preco: 620000, portas: 4 },
  { marca: "Renault", modelo: "Kardian", ano: 2024, cor: "Laranja", tipo: "SUV", combustivel: "flex", cambio: "automático", motor: "1.0L Turbo", potencia: 130, quilometragem: 1000, preco: 105000, portas: 4 },
];

// Constrói o dataset completo com ID e descrição para embedding
export const carsDataset: Car[] = rawCars.map((car, idx) => ({
  ...car,
  id: `car_${String(idx + 1).padStart(3, "0")}`,
  descricao: buildCarDescription(car),
}));

export default carsDataset;
