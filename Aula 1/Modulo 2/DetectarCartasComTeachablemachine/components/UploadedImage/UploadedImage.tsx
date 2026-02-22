interface UploadedImageProps {
  imagemUrl: string;
}

/**
 * Componente puro para exibir a imagem enviada
 */
export function UploadedImage({ imagemUrl }: UploadedImageProps) {
  return (
    <div className="bg-black/30 rounded-lg p-4">
      <h3 className="text-white font-bold mb-2 text-center">Imagem Enviada:</h3>
      <div className="flex justify-center">
        <img
          src={imagemUrl}
          alt="Carta enviada"
          className="max-w-xs rounded-lg border-2 border-white shadow-lg"
        />
      </div>
    </div>
  );
}
