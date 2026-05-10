"""
Telemetria Estruturada.

Coleta eventos, mede latencia por fase, rastreia tokens,
resultados de ferramentas, ativacoes de circuit breaker
e falhas de validacao de payload.

Expoe: telemetry_stream, audit_logs, health_metrics,
       performance_data, kpis_etapa, resumo_completo.
"""

import time
import uuid
from datetime import datetime


class Telemetria:
    """Coletor de telemetria para o ciclo do agente."""

    def __init__(self, agente: str, tipo_agente: str):
        self.trace_id = uuid.uuid4().hex[:12]
        self.agente = agente
        self.tipo_agente = tipo_agente
        self.inicio = time.time()

        # fluxo completo de eventos
        self.eventos: list = []

        # fases: {etapa: {nome_fase: {"inicio": float, "fim": float, "duracao_ms": int}}}
        self._fases: dict = {}

        # acumuladores
        self.tokens = {"prompt": 0, "completion": 0, "total": 0}
        self.chamadas_llm: int = 0
        self.resultados_ferramentas: list = []
        self.circuit_breaker_ativacoes: int = 0
        self.validacao_payload_falhas: int = 0

    # ------------------------------------------------------------------
    # Registro de eventos
    # ------------------------------------------------------------------

    def registrar(self, tipo: str, dados: dict = None):
        """Registra um evento no fluxo de telemetria."""
        self.eventos.append({
            "timestamp": datetime.now().isoformat(),
            "elapsed_ms": round((time.time() - self.inicio) * 1000),
            "trace_id": self.trace_id,
            "tipo": tipo,
            "dados": dados or {},
        })

    # ------------------------------------------------------------------
    # Fases com latencia
    # ------------------------------------------------------------------

    def iniciar_fase(self, nome_fase: str, etapa: int) -> dict:
        """Inicia a medicao de uma fase. Retorna marcador (dict mutavel)."""
        marcador = {
            "nome_fase": nome_fase,
            "etapa": etapa,
            "inicio": time.time(),
            "duracao_ms": 0,
        }
        if etapa not in self._fases:
            self._fases[etapa] = {}
        self._fases[etapa][nome_fase] = marcador
        return marcador

    def finalizar_fase(self, marcador: dict):
        """Finaliza a medicao de uma fase e preenche duracao_ms no marcador."""
        duracao_ms = round((time.time() - marcador["inicio"]) * 1000)
        marcador["duracao_ms"] = duracao_ms
        self.registrar(f"fase_{marcador['nome_fase']}", {
            "etapa": marcador["etapa"],
            "duracao_ms": duracao_ms,
        })

    # ------------------------------------------------------------------
    # Tokens
    # ------------------------------------------------------------------

    def registrar_tokens(self, uso: dict):
        """Acumula tokens e conta chamada LLM."""
        for chave in ("prompt", "completion", "total"):
            self.tokens[chave] += uso.get(chave, 0)
        if uso.get("total", 0) > 0:
            self.chamadas_llm += 1

    # ------------------------------------------------------------------
    # Ferramentas
    # ------------------------------------------------------------------

    def registrar_resultado_ferramenta(self, sucesso: bool):
        """Registra o resultado (bool) de uma chamada de ferramenta."""
        self.resultados_ferramentas.append(sucesso)

    # ------------------------------------------------------------------
    # Circuit breaker e payload
    # ------------------------------------------------------------------

    def registrar_circuit_breaker(self, motivo: str):
        """Incrementa contador de ativacoes do circuit breaker."""
        self.circuit_breaker_ativacoes += 1
        self.registrar("circuit_breaker", {"motivo": motivo})

    def registrar_validacao_payload_falha(self, ferramenta: str, erros: list):
        """Incrementa contador de falhas de validacao de payload."""
        self.validacao_payload_falhas += 1
        self.registrar("validacao_payload_falha", {"ferramenta": ferramenta, "erros": erros})

    # ------------------------------------------------------------------
    # Metricas e exportacao
    # ------------------------------------------------------------------

    def telemetry_stream(self) -> list:
        """Retorna o fluxo completo de eventos."""
        return self.eventos

    def audit_logs(self) -> list:
        """Retorna apenas eventos relevantes para auditoria."""
        tipos_auditoria = {
            "circuit_breaker",
            "confirmacao_humana",
            "limite_tempo_excedido",
            "limite_tokens_excedido",
            "ferramenta_executada",
            "validacao_payload_falha",
            "finalizado",
        }
        return [e for e in self.eventos if e["tipo"] in tipos_auditoria]

    def health_metrics(self) -> dict:
        """Metricas de saude do agente."""
        total_ferramentas = len(self.resultados_ferramentas)
        sucessos = sum(1 for r in self.resultados_ferramentas if r)
        taxa = round(sucessos / total_ferramentas * 100, 1) if total_ferramentas > 0 else 0.0

        return {
            "taxa_sucesso_ferramentas": taxa,
            "total_chamadas_ferramenta": total_ferramentas,
            "circuit_breaker_ativacoes": self.circuit_breaker_ativacoes,
            "validacao_payload_falhas": self.validacao_payload_falhas,
            "chamadas_llm": self.chamadas_llm,
        }

    def performance_data(self) -> dict:
        """Dados de performance por fase."""
        fases: dict = {}

        for dados_etapa in self._fases.values():
            for nome_fase, marcador in dados_etapa.items():
                duracao = marcador.get("duracao_ms", 0)
                if nome_fase not in fases:
                    fases[nome_fase] = {"total_ms": 0, "max_ms": 0, "contagem": 0}
                fases[nome_fase]["total_ms"] += duracao
                fases[nome_fase]["max_ms"] = max(fases[nome_fase]["max_ms"], duracao)
                fases[nome_fase]["contagem"] += 1

        for nome_fase, dados_fase in fases.items():
            contagem = dados_fase["contagem"]
            dados_fase["media_ms"] = round(dados_fase["total_ms"] / contagem) if contagem > 0 else 0

        return {
            "fases": fases,
            "tokens": self.tokens,
            "chamadas_llm": self.chamadas_llm,
        }

    def kpis_etapa(self, etapa: int) -> dict:
        """Retorna latencias das fases de uma etapa especifica (nome -> duracao_ms)."""
        dados_etapa = self._fases.get(etapa, {})
        return {
            nome_fase: marcador.get("duracao_ms", 0)
            for nome_fase, marcador in dados_etapa.items()
        }

    def resumo_completo(self) -> dict:
        """Resumo completo para incluir no trace.json."""
        return {
            "telemetry_stream": self.telemetry_stream(),
            "audit_logs": self.audit_logs(),
            "health_metrics": self.health_metrics(),
            "performance_data": self.performance_data(),
        }
