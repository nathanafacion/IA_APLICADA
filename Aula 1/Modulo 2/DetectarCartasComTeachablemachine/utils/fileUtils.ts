/**
 * Converte um arquivo em uma URL de dados
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Erro ao ler arquivo"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"));
    };
    
    reader.readAsDataURL(file);
  });
}
