"""
Embedding Adapter — Unidade 4.

Conecta memoria contextual a embeddings via API.
O adapter NAO decide o que indexar — o contrato diz.
Modelo, limiar e limites vem do contrato memory.md.
API key vem do .env — nunca do contrato.
"""

import json
import os
import uuid
from datetime import datetime

from openai import OpenAI


class EmbeddingAdapter:
    """Adapter de memoria contextual via embeddings.

    Indexa e busca fragmentos por similaridade semantica.
    Toda configuracao vem do contrato memory.md (tipo contextual).
    """

    def __init__(self, contrato_contextual: dict):
        self.contrato = contrato_contextual
        self.modelo = contrato_contextual.get(
            "modelo_embedding", "text-embedding-3-small"
        )
        self.limiar = contrato_contextual.get("limiar_similaridade", 0.7)
        self.max_resultados = contrato_contextual.get(
            "max_fragmentos_por_consulta", 5
        )
        self.diretorio = contrato_contextual.get(
            "diretorio", "memory_store/contextual/"
        )
        self.indice_path = os.path.join(self.diretorio, "indice.json")
        os.makedirs(self.diretorio, exist_ok=True)
        self.client = OpenAI()

    def _gerar_embedding(self, texto: str) -> list:
        """Gera embedding via API (modelo declarado no contrato)."""
        response = self.client.embeddings.create(
            model=self.modelo, input=texto
        )
        return response.data[0].embedding

    def _similaridade_cosseno(self, a: list, b: list) -> float:
        """Calcula similaridade de cosseno entre dois vetores."""
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x * x for x in a) ** 0.5
        norm_b = sum(x * x for x in b) ** 0.5
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def _carregar_indice(self) -> list:
        """Carrega indice do arquivo JSON."""
        if os.path.exists(self.indice_path):
            with open(self.indice_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _salvar_indice(self, indice: list) -> None:
        """Salva indice no arquivo JSON."""
        with open(self.indice_path, "w", encoding="utf-8") as f:
            json.dump(indice, f, ensure_ascii=False, indent=2)

    def indexar(self, texto: str, metadados: dict = None) -> str:
        """Gera embedding do texto e armazena no indice.

        Retorna o ID da entrada criada.
        """
        embedding = self._gerar_embedding(texto)

        indice = self._carregar_indice()
        entrada = {
            "id": f"emb_{uuid.uuid4().hex[:8]}",
            "texto": texto,
            "embedding": embedding,
            "metadados": metadados or {},
            "timestamp": datetime.now().isoformat(),
        }
        indice.append(entrada)
        self._salvar_indice(indice)

        return entrada["id"]

    def buscar(self, consulta: str, max_resultados: int = None,
               limiar: float = None) -> list:
        """Busca fragmentos por similaridade semantica.

        Retorna lista de fragmentos acima do limiar, ordenados por similaridade.
        Limiar e max_resultados vem do contrato se nao informados.
        """
        max_r = max_resultados or self.max_resultados
        lim = limiar or self.limiar

        embedding_consulta = self._gerar_embedding(consulta)
        indice = self._carregar_indice()

        resultados = []
        for entrada in indice:
            sim = self._similaridade_cosseno(
                embedding_consulta, entrada["embedding"]
            )
            if sim >= lim:
                resultados.append({
                    "id": entrada["id"],
                    "texto": entrada["texto"],
                    "similaridade": round(sim, 4),
                    "metadados": entrada.get("metadados", {}),
                })

        resultados.sort(key=lambda x: x["similaridade"], reverse=True)
        return resultados[:max_r]

    def reindexar(self, memory_adapter, tipos: list = None) -> int:
        """Reconstroi indice a partir das memorias longa e episodica.

        Retorna o total de fragmentos indexados.
        """
        tipos = tipos or ["longa", "episodica"]
        indice = []

        for tipo in tipos:
            registros = memory_adapter.recuperar(tipo)
            for reg in registros:
                conteudo = reg.get("conteudo", {})
                if isinstance(conteudo, dict):
                    texto = " ".join(str(v) for v in conteudo.values())
                else:
                    texto = str(conteudo)

                embedding = self._gerar_embedding(texto)
                indice.append({
                    "id": f"emb_{uuid.uuid4().hex[:8]}",
                    "texto": texto,
                    "embedding": embedding,
                    "metadados": {
                        "tipo": tipo,
                        "id_original": reg.get("id", ""),
                    },
                    "timestamp": datetime.now().isoformat(),
                })

        self._salvar_indice(indice)
        return len(indice)
