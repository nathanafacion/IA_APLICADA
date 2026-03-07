export interface CarResult {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  tipo: string;
  combustivel: string;
  cambio: string;
  motor: string;
  potencia: number;
  quilometragem: number;
  preco: number;
  portas: number;
  descricao: string;
  score: number; // similaridade coseno (0-1)
}
