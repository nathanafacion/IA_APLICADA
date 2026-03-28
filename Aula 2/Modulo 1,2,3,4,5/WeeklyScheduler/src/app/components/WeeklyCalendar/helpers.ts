export function horaParaLinha(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return (h - 7) * 4 + Math.floor(m / 15) + 2;
}

export function duracaoParaSpan(inicio: string, fim: string): number {
  const [sh, sm] = inicio.split(":").map(Number);
  const [eh, em] = fim.split(":").map(Number);
  return ((eh - sh) * 60 + (em - sm)) / 15;
}
