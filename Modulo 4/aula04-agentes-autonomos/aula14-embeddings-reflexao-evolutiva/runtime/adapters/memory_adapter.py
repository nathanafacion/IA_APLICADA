"""
Memory Adapter — Unidade 4.

Conecta o contrato memory.md ao armazenamento real.
O adapter NAO decide o que guardar — o contrato diz.
O adapter NAO decide quando descartar — as politicas dizem.
O adapter e agnostico ao agente — toda configuracao vem do contrato.
"""

import os
import uuid
from datetime import datetime

import yaml


class MemoryAdapter: 
    """Adapter generico de memoria persistente.

    Resolve o tipo de armazenamento a partir do contrato memory.md.
    Suporta memoria longa (fatos) e episodica (resumos de execucao).
    """

    def __init__(self, contrato_memoria: dict):
        self.contrato = contrato_memoria

    def _gerar_id(self, prefixo: str = "mem") -> str:
        return f"{prefixo}_{uuid.uuid4().hex[:8]}"

    def _garantir_diretorio(self, tipo: str) -> str:
        config = self.contrato["tipos_memoria"][tipo]
        diretorio = config.get("diretorio", f"memory_store/{tipo}/")
        os.makedirs(diretorio, exist_ok=True)
        return diretorio

    def gravar(self, tipo: str, conteudo) -> str:
        """Grava um registro no diretorio do tipo de memoria.

        Retorna o ID do registro criado.
        """
        diretorio = self._garantir_diretorio(tipo)

        registro = {
            "id": self._gerar_id(tipo[:3]),
            "timestamp": datetime.now().isoformat(),
            "conteudo": conteudo,
        }

        caminho = os.path.join(diretorio, f"{registro['id']}.yaml")
        with open(caminho, "w", encoding="utf-8") as f:
            yaml.dump(registro, f, allow_unicode=True, default_flow_style=False)

        return registro["id"]

    def recuperar(self, tipo: str, filtro: dict = None) -> list:
        """Busca registros por filtro simples (chave-valor no conteudo).

        Se filtro=None, retorna todos os registros do tipo.
        """
        diretorio = self._garantir_diretorio(tipo)
        registros = []

        for arquivo in sorted(os.listdir(diretorio)):
            if not arquivo.endswith(".yaml"):
                continue
            caminho = os.path.join(diretorio, arquivo)
            with open(caminho, "r", encoding="utf-8") as f:
                registro = yaml.safe_load(f)
                if registro and self._aplicar_filtro(registro, filtro):
                    registros.append(registro)

        return registros

    def atualizar(self, tipo: str, id_registro: str, conteudo_novo) -> None:
        """Atualiza o conteudo de um registro existente."""
        diretorio = self._garantir_diretorio(tipo)
        caminho = os.path.join(diretorio, f"{id_registro}.yaml")

        if not os.path.exists(caminho):
            raise FileNotFoundError(
                f"Registro {id_registro} nao encontrado em {tipo}"
            )

        with open(caminho, "r", encoding="utf-8") as f:
            registro = yaml.safe_load(f)

        registro["conteudo"] = conteudo_novo
        registro["atualizado_em"] = datetime.now().isoformat()

        with open(caminho, "w", encoding="utf-8") as f:
            yaml.dump(registro, f, allow_unicode=True, default_flow_style=False)

    def remover(self, tipo: str, id_registro: str) -> None:
        """Remove um registro do diretorio."""
        diretorio = self._garantir_diretorio(tipo)
        caminho = os.path.join(diretorio, f"{id_registro}.yaml")
        if os.path.exists(caminho):
            os.remove(caminho)

    def listar(self, tipo: str) -> list:
        """Lista registros com metadados resumidos."""
        registros = self.recuperar(tipo)
        return [
            {
                "id": r.get("id", "?"),
                "timestamp": r.get("timestamp", ""),
                "resumo": str(r.get("conteudo", ""))[:100],
            }
            for r in registros
        ]

    def _aplicar_filtro(self, registro: dict, filtro: dict) -> bool:
        """Aplica filtro simples: verifica se valores do filtro existem no conteudo."""
        if not filtro:
            return True

        conteudo = registro.get("conteudo", {})

        if isinstance(conteudo, str):
            return any(
                str(v).lower() in conteudo.lower() for v in filtro.values()
            )

        if isinstance(conteudo, dict):
            for chave, valor in filtro.items():
                campo = str(conteudo.get(chave, ""))
                if str(valor).lower() in campo.lower():
                    return True

        return False
