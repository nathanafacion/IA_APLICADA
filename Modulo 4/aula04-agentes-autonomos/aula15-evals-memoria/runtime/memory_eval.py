"""
Memory Impact Eval — mede o impacto da memoria nas decisoes do agente.

Pra cada caso do dataset, o eval roda o agente em DOIS modos:
  1. com_memoria: execucao normal (recupera contexto, persiste, extrai licoes)
  2. sem_memoria: MEMORY_DISABLED=1 (recupera vazio, persiste no-op, sem licoes)

Compara as duas execucoes e calcula 6 metricas:
  - retrieval_precision: dos itens recuperados, quantos eram relevantes
  - retrieval_recall: dos itens esperados, quantos foram recuperados
  - memory_utilization: dos recuperados, quantos apareceram na decisao do planner
  - hallucination_from_memory: tokens "inventados" (nem em recuperados, nem na entrada)
  - decision_improvement: reducao de etapas com memoria vs sem
  - lesson_quality: % de licoes do reflection_store com 4 campos preenchidos

Uso:
  python main.py memory-eval --agente ../monitor-agent --suite ../evals/suites/memory_impact_eval.yaml
  python main.py memory-eval --agente ../monitor-agent --suite ../evals/suites/memory_impact_eval.yaml --max-casos 2
"""

import json
import os
import time
from datetime import datetime
from pathlib import Path

import yaml

from ciclo import rodar


# ---------------------------------------------------------------------------
# Carregamento de suite e dataset
# ---------------------------------------------------------------------------

def _carregar_suite(caminho_suite: Path) -> dict:
    return yaml.safe_load(caminho_suite.read_text(encoding="utf-8"))


def _carregar_dataset(caminho_suite: Path, suite: dict) -> list:
    caminho_dataset = caminho_suite.parent.parent / "datasets" / suite["dataset"]
    if not caminho_dataset.exists():
        # fallback: dataset adjacente a suite
        caminho_dataset = caminho_suite.parent / suite["dataset"]
    return json.loads(caminho_dataset.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# Coleta de evidencias da execucao
# ---------------------------------------------------------------------------

def _achatar_recuperados(contexto_memoria: dict) -> list:
    """Reduz o contexto recuperado a uma lista de strings comparaveis."""
    itens = []
    for fato in contexto_memoria.get("fatos_conhecidos", []) or []:
        if isinstance(fato, dict):
            obs = fato.get("observacoes") or fato
            itens.append(json.dumps(obs, ensure_ascii=False))
        else:
            itens.append(str(fato))
    for ep in contexto_memoria.get("experiencia_anterior", []) or []:
        if isinstance(ep, dict):
            itens.append(json.dumps(ep, ensure_ascii=False))
        else:
            itens.append(str(ep))
    for frag in contexto_memoria.get("conhecimento_relevante", []) or []:
        if isinstance(frag, dict):
            itens.append(str(frag.get("texto", "")))
        else:
            itens.append(str(frag))
    for lic in contexto_memoria.get("licoes_relevantes", []) or []:
        if isinstance(lic, dict):
            partes = [
                str(lic.get("situacao", "")),
                str(lic.get("licao", "")),
            ]
            itens.append(" | ".join(p for p in partes if p))
        else:
            itens.append(str(lic))
    return [i for i in itens if i]


def _esperados_unificados(caso: dict) -> list:
    ctx = caso.get("contexto_esperado", {}) or {}
    esperados = []
    esperados.extend(ctx.get("fatos_relevantes", []) or [])
    esperados.extend(ctx.get("episodios_relevantes", []) or [])
    esperados.extend(ctx.get("licoes_relevantes", []) or [])
    return [str(e) for e in esperados if e]


def _extrair_decisao_inicial(estado: dict) -> str:
    """Texto da primeira decisao do planner (acao + ferramenta + raciocinio)."""
    historico = estado.get("historico", []) or []
    if not historico:
        return ""
    primeira = historico[0]
    plano = primeira.get("plano", {}) or {}
    partes = [
        str(plano.get("proxima_acao", "")),
        str(plano.get("nome_ferramenta", "")),
        json.dumps(plano.get("argumentos_ferramenta", {}) or {}, ensure_ascii=False),
        str(plano.get("raciocinio", "")),
    ]
    return " ".join(p for p in partes if p)


# ---------------------------------------------------------------------------
# Metricas
# ---------------------------------------------------------------------------

def _calc_precision(recuperados: list, esperados: list) -> float:
    if not recuperados:
        return 1.0
    if not esperados:
        return 0.0
    relevantes = 0
    for r in recuperados:
        r_lower = r.lower()
        for e in esperados:
            tokens = [t for t in e.lower().split() if len(t) > 3][:3]
            if any(tok in r_lower for tok in tokens):
                relevantes += 1
                break
    return relevantes / len(recuperados)


def _calc_recall(recuperados: list, esperados: list) -> float:
    if not esperados:
        return 1.0
    if not recuperados:
        return 0.0
    encontrados = 0
    recuperados_lower = [r.lower() for r in recuperados]
    for e in esperados:
        tokens = [t for t in e.lower().split() if len(t) > 3][:3]
        if any(any(tok in r for tok in tokens) for r in recuperados_lower):
            encontrados += 1
    return encontrados / len(esperados)


def _calc_utilization(recuperados: list, raciocinio_planner: str) -> float:
    if not recuperados:
        return 1.0
    raciocinio = raciocinio_planner.lower()
    if not raciocinio:
        return 0.0
    usados = 0
    for r in recuperados:
        tokens = [t for t in r.lower().split() if len(t) > 4][:3]
        if any(tok in raciocinio for tok in tokens):
            usados += 1
    return usados / len(recuperados)


def _calc_hallucination(recuperados: list, entrada: str, decisao: str) -> float:
    chaves = [t.lower().strip(".,;:\"'()[]{}") for t in decisao.split() if len(t) > 4][:10]
    contexto_disponivel = (entrada + " " + " ".join(recuperados)).lower()
    if not chaves:
        return 0.0
    novas = sum(1 for c in chaves if c and c not in contexto_disponivel)
    return novas / len(chaves)


def _calc_improvement(etapas_sem: int, etapas_com: int) -> float:
    if etapas_sem == 0:
        return 0.0
    return (etapas_sem - etapas_com) / etapas_sem


def _calc_lesson_quality(caminho_reflection_store: Path) -> float:
    licoes_dir = caminho_reflection_store / "licoes"
    if not licoes_dir.exists():
        return 0.0
    arquivos = list(licoes_dir.glob("*.yaml"))
    if not arquivos:
        return 0.0
    boas = 0
    campos_obrig = ["situacao", "acao", "resultado", "licao"]
    for arq in arquivos:
        try:
            with open(arq, "r", encoding="utf-8") as f:
                lic = yaml.safe_load(f) or {}
        except Exception:
            continue
        if all(lic.get(c) for c in campos_obrig):
            boas += 1
    return boas / len(arquivos)


# ---------------------------------------------------------------------------
# Execucao do caso
# ---------------------------------------------------------------------------

def _rodar_caso(caminho_agente: str, entrada: str, sem_memoria: bool) -> tuple:
    """Roda um caso e retorna (estado, contexto_recuperado, etapas, decisao_inicial)."""
    if sem_memoria:
        os.environ["MEMORY_DISABLED"] = "1"
    else:
        os.environ.pop("MEMORY_DISABLED", None)

    try:
        estado = rodar(
            caminho_agente=caminho_agente,
            texto_entrada=entrada,
            modo="task_based",
        )
    finally:
        os.environ.pop("MEMORY_DISABLED", None)

    contexto = (estado or {}).get("contexto_memoria", {}) or {}
    etapas = (estado or {}).get("etapa", 0)
    decisao = _extrair_decisao_inicial(estado or {})
    return estado, contexto, etapas, decisao


# ---------------------------------------------------------------------------
# Pipeline principal
# ---------------------------------------------------------------------------

def executar_memory_eval(caminho_agente: str, caminho_suite: str, max_casos: int = None) -> dict:
    """Roda avaliacao de impacto de memoria contra dataset."""
    caminho_agente_p = Path(caminho_agente).resolve()
    caminho_suite_p = Path(caminho_suite).resolve()

    suite = _carregar_suite(caminho_suite_p)
    dataset = _carregar_dataset(caminho_suite_p, suite)
    if max_casos is not None:
        dataset = dataset[:max_casos]

    thresholds = suite.get("thresholds", {})
    metricas_pedidas = suite.get("metrics", [])

    print(f"\n{'='*60}")
    print(f"  MEMORY IMPACT EVAL")
    print(f"  Agente: {caminho_agente_p.name}")
    print(f"  Dataset: {len(dataset)} casos")
    print(f"  Modo: com vs sem memoria (2 execucoes/caso)")
    print(f"{'='*60}\n")

    inicio_total = time.time()
    resultados_casos = []

    for i, caso in enumerate(dataset, 1):
        entrada = caso["entrada"]
        print(f"\n--- CASO {i}/{len(dataset)}: {caso.get('id', '?')} ---")
        print(f"Entrada: {entrada}")

        # 1. Sem memoria (baseline)
        print(f"\n>>> Rodando SEM memoria...")
        _, _, etapas_sem, decisao_sem = _rodar_caso(str(caminho_agente_p), entrada, sem_memoria=True)

        # 2. Com memoria
        print(f"\n>>> Rodando COM memoria...")
        _, contexto_com, etapas_com, decisao_com = _rodar_caso(str(caminho_agente_p), entrada, sem_memoria=False)

        recuperados = _achatar_recuperados(contexto_com)
        esperados = _esperados_unificados(caso)

        precision = _calc_precision(recuperados, esperados)
        recall = _calc_recall(recuperados, esperados)
        utilization = _calc_utilization(recuperados, decisao_com)
        hallucination = _calc_hallucination(recuperados, entrada, decisao_com)
        improvement = _calc_improvement(etapas_sem, etapas_com)

        resultado_caso = {
            "id": caso.get("id"),
            "entrada": entrada,
            "etapas_sem_memoria": etapas_sem,
            "etapas_com_memoria": etapas_com,
            "n_recuperados": len(recuperados),
            "n_esperados": len(esperados),
            "retrieval_precision": round(precision, 3),
            "retrieval_recall": round(recall, 3),
            "memory_utilization": round(utilization, 3),
            "hallucination_from_memory": round(hallucination, 3),
            "decision_improvement": round(improvement, 3),
        }
        resultados_casos.append(resultado_caso)

        print(f"\n  precision={precision:.2f} recall={recall:.2f} util={utilization:.2f} "
              f"halluc={hallucination:.2f} improv={improvement:.2f} "
              f"(etapas: sem={etapas_sem} com={etapas_com})")

    # ------------------ Agregacao ------------------
    def _media(chave: str) -> float:
        valores = [r[chave] for r in resultados_casos if chave in r]
        return round(sum(valores) / len(valores), 3) if valores else 0.0

    agregadas = {
        "retrieval_precision": _media("retrieval_precision"),
        "retrieval_recall": _media("retrieval_recall"),
        "memory_utilization": _media("memory_utilization"),
        "hallucination_from_memory": _media("hallucination_from_memory"),
        "decision_improvement": _media("decision_improvement"),
        "lesson_quality": round(_calc_lesson_quality(caminho_agente_p.parent / "reflection_store"), 3),
    }

    # PASS/FAIL contra thresholds
    status = {}
    for metrica, valor in agregadas.items():
        if metrica not in thresholds:
            status[metrica] = "N/A"
            continue
        limiar = thresholds[metrica]
        if metrica == "hallucination_from_memory":
            status[metrica] = "PASS" if valor <= limiar else "FAIL"
        else:
            status[metrica] = "PASS" if valor >= limiar else "FAIL"

    tempo_total = round(time.time() - inicio_total, 1)

    # ------------------ Imprimir tabela ------------------
    print(f"\n\n{'='*60}")
    print(f"  RESULTADO FINAL — {caminho_agente_p.name}")
    print(f"{'='*60}")
    print(f"\n  {'Metrica':<32} {'Valor':>8} {'Threshold':>10} {'Status':>8}")
    print(f"  {'-'*32} {'-'*8} {'-'*10} {'-'*8}")
    for metrica in ["retrieval_precision", "retrieval_recall", "memory_utilization",
                    "hallucination_from_memory", "decision_improvement", "lesson_quality"]:
        val = agregadas[metrica]
        thr = thresholds.get(metrica, "—")
        st = status.get(metrica, "N/A")
        thr_str = f"{thr}" if thr != "—" else "—"
        print(f"  {metrica:<32} {val:>8.3f} {thr_str:>10} {st:>8}")

    aprovados = sum(1 for s in status.values() if s == "PASS")
    falhados = sum(1 for s in status.values() if s == "FAIL")
    print(f"\n  Resumo: {aprovados} PASS / {falhados} FAIL / {len(status) - aprovados - falhados} N/A")
    print(f"  Tempo total: {tempo_total}s")
    print(f"{'='*60}\n")

    # ------------------ Gerar relatorio markdown ------------------
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    relatorio = _gerar_relatorio_md(
        agente=caminho_agente_p.name,
        agregadas=agregadas,
        thresholds=thresholds,
        status=status,
        resultados_casos=resultados_casos,
        tempo_total=tempo_total,
    )

    caminho_resultados = caminho_suite_p.parent.parent / "resultados"
    caminho_resultados.mkdir(parents=True, exist_ok=True)
    arq_relatorio = caminho_resultados / f"memory_impact_report_{timestamp}.md"
    arq_relatorio.write_text(relatorio, encoding="utf-8")
    print(f"  Relatorio salvo: {arq_relatorio}\n")

    return {
        "agente": caminho_agente_p.name,
        "tempo_total_segundos": tempo_total,
        "metricas_agregadas": agregadas,
        "thresholds": thresholds,
        "status": status,
        "resultados_por_caso": resultados_casos,
        "arquivo_relatorio": str(arq_relatorio),
    }


def _gerar_relatorio_md(agente, agregadas, thresholds, status, resultados_casos, tempo_total) -> str:
    md = []
    md.append(f"# Relatorio de Impacto de Memoria — {agente}")
    md.append("")
    md.append(f"**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    md.append(f"**Casos avaliados:** {len(resultados_casos)}")
    md.append(f"**Tempo total:** {tempo_total}s")
    md.append("")

    md.append("## Metricas Agregadas")
    md.append("")
    md.append("| Metrica | Valor | Threshold | Status |")
    md.append("|---------|-------|-----------|--------|")
    for metrica in ["retrieval_precision", "retrieval_recall", "memory_utilization",
                    "hallucination_from_memory", "decision_improvement", "lesson_quality"]:
        val = agregadas.get(metrica, 0)
        thr = thresholds.get(metrica, "—")
        st = status.get(metrica, "N/A")
        md.append(f"| {metrica} | {val:.3f} | {thr} | {st} |")
    md.append("")

    md.append("## Comparativo: Sem Memoria vs Com Memoria")
    md.append("")
    md.append("| Caso | Etapas Sem | Etapas Com | Improvement |")
    md.append("|------|-----------|-----------|-------------|")
    for r in resultados_casos:
        md.append(f"| {r['id']} | {r['etapas_sem_memoria']} | {r['etapas_com_memoria']} | {r['decision_improvement']:.2f} |")
    md.append("")

    md.append("## Detalhamento por Caso")
    md.append("")
    md.append("| Caso | Recuperados | Esperados | Precision | Recall | Util | Halluc |")
    md.append("|------|-------------|-----------|-----------|--------|------|--------|")
    for r in resultados_casos:
        md.append(
            f"| {r['id']} | {r['n_recuperados']} | {r['n_esperados']} | "
            f"{r['retrieval_precision']:.2f} | {r['retrieval_recall']:.2f} | "
            f"{r['memory_utilization']:.2f} | {r['hallucination_from_memory']:.2f} |"
        )
    md.append("")

    aprovados = sum(1 for s in status.values() if s == "PASS")
    falhados = sum(1 for s in status.values() if s == "FAIL")
    md.append("## Conclusao")
    md.append("")
    md.append(f"- {aprovados} metricas aprovadas, {falhados} reprovadas")
    if falhados:
        md.append("- Revisar memorias seed e logica de recuperacao para metricas reprovadas")
    else:
        md.append("- Memoria entregando impacto dentro dos limiares configurados")
    md.append("")

    return "\n".join(md)
