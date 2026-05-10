"""
Executor - Executar, Avaliar, Validar Payload e Ganchos.

Executa ferramentas, valida payloads contra schema, avalia resultados
semanticamente e dispara ganchos do ciclo.

Unidade 3: hooks evoluidos suportam listas de acoes e acoes especiais
(validar_rate_limit, verificar_budget, registrar_latencia, verificar_fallback_mock).
"""

import time
from datetime import datetime


# --- Rate Limiting ---
_chamadas_por_minuto = {}  # {ferramenta: [(timestamp, ...)]
_custo_acumulado_centavos = 0


def _verificar_rate_limit(ferramenta: str, limites_skill: dict, limites_globais: dict) -> str | None:
    """Verifica rate limit por skill e global. Retorna erro ou None."""
    agora = time.time()
    janela = 60  # 1 minuto

    # limpar chamadas antigas
    if ferramenta not in _chamadas_por_minuto:
        _chamadas_por_minuto[ferramenta] = []
    _chamadas_por_minuto[ferramenta] = [
        t for t in _chamadas_por_minuto[ferramenta] if agora - t < janela
    ]

    # verificar limite por skill
    limite_skill = limites_skill.get("chamadas_por_minuto", 999)
    if len(_chamadas_por_minuto[ferramenta]) >= limite_skill:
        return f"rate limit da skill {ferramenta}: {limite_skill}/min excedido"

    # verificar limite global
    total_global = sum(len(v) for v in _chamadas_por_minuto.values())
    limite_global = limites_globais.get("chamadas_por_minuto", 999)
    if total_global >= limite_global:
        return f"rate limit global: {limite_global}/min excedido"

    # registrar chamada
    _chamadas_por_minuto[ferramenta].append(agora)
    return None


def executar_gancho(nome: str, contrato_ganchos: dict, **kwargs):
    """Executa um gancho conforme declarado no contrato.

    Suporta acoes como string ('log', 'alerta') ou lista de acoes
    (['log', 'validar_rate_limit', 'verificar_budget']).
    """
    ganchos = contrato_ganchos.get("ganchos", {})
    acao = ganchos.get(nome)
    if not acao:
        return

    carimbo_tempo = datetime.now().strftime("%H:%M:%S")
    detalhe = " ".join(f"{chave}={valor}" for chave, valor in kwargs.items())

    # normalizar para lista
    acoes = acao if isinstance(acao, list) else [acao]

    for a in acoes:
        if a == "log":
            print(f"  [{carimbo_tempo}] gancho:{nome} {detalhe}")
        elif a == "alerta":
            print(f"  [{carimbo_tempo}] [ALERTA] gancho:{nome} {detalhe}")
        elif a == "validar_rate_limit":
            ferramenta = kwargs.get("ferramenta", "")
            if ferramenta:
                # rate limit verificado no ciclo.py antes de executar
                pass  # placeholder — logica real no ciclo
        elif a == "registrar_latencia":
            latencia = kwargs.get("latencia_ms", 0)
            adapter = kwargs.get("adapter", "")
            if latencia:
                print(f"  [{carimbo_tempo}] gancho:{nome} latencia={latencia}ms adapter={adapter}")
        elif a == "verificar_fallback_mock":
            print(f"  [{carimbo_tempo}] gancho:{nome} verificando fallback mock...")
        elif a == "verificar_budget":
            pass  # placeholder — verificacao de custo
        elif a == "registrar_custo":
            pass  # placeholder — registro de custo


# --- Gap 1: Validacao de Payload ---

_MAPA_TIPOS = {
    "string": str,
    "int": (int,),
    "float": (int, float),
    "bool": (bool,),
    "list": (list,),
    "object": (dict,),
}


def validar_payload(nome_ferramenta: str, argumentos: dict, contratos: dict) -> list:
    """Valida os argumentos contra o schema de entrada da ferramenta.

    Retorna lista de erros. Lista vazia = payload valido.
    """
    erros = []
    habilidades = contratos.get("habilidades", {}).get("habilidades", [])
    habilidade = next((h for h in habilidades if h.get("nome") == nome_ferramenta), None)

    if not habilidade:
        return [f"ferramenta '{nome_ferramenta}' nao encontrada no schema de habilidades"]

    schema_entrada = habilidade.get("entrada", {})
    argumentos = argumentos or {}

    # verificar campos obrigatorios do schema
    for campo, tipo_esperado in schema_entrada.items():
        if campo not in argumentos:
            erros.append(f"campo obrigatorio '{campo}' ausente")
            continue

        valor = argumentos[campo]
        tipo_normalizado = tipo_esperado.lower() if isinstance(tipo_esperado, str) else "string"
        tipos_python = _MAPA_TIPOS.get(tipo_normalizado)

        if tipos_python and valor is not None:
            if isinstance(tipos_python, tuple):
                if not isinstance(valor, tipos_python):
                    erros.append(f"campo '{campo}': esperado {tipo_normalizado}, recebido {type(valor).__name__}")
            elif not isinstance(valor, tipos_python):
                erros.append(f"campo '{campo}': esperado {tipo_normalizado}, recebido {type(valor).__name__}")

    return erros


def validar_saida(nome_ferramenta: str, resultado: dict, contratos: dict) -> list:
    """Valida os dados de saida contra o schema da ferramenta.

    Retorna lista de problemas encontrados. Lista vazia = saida valida.
    """
    problemas = []
    if not resultado or not resultado.get("sucesso"):
        return problemas

    dados = resultado.get("dados", {})
    habilidades = contratos.get("habilidades", {}).get("habilidades", [])
    habilidade = next((h for h in habilidades if h.get("nome") == nome_ferramenta), None)

    if not habilidade:
        return problemas

    schema_saida = habilidade.get("saida", {})

    for campo, tipo_esperado in schema_saida.items():
        if campo not in dados:
            problemas.append(f"campo de saida '{campo}' ausente no resultado")
            continue

        valor = dados[campo]
        tipo_normalizado = tipo_esperado.lower() if isinstance(tipo_esperado, str) else "string"

        # verificar se o valor nao e vazio/nulo
        if valor is None:
            problemas.append(f"campo de saida '{campo}' retornou None")
        elif isinstance(valor, str) and not valor.strip():
            problemas.append(f"campo de saida '{campo}' retornou string vazia")
        elif isinstance(valor, list) and len(valor) == 0:
            problemas.append(f"campo de saida '{campo}' retornou lista vazia")

    return problemas


# --- Execucao ---

def executar(nome_ferramenta: str, argumentos: dict, ferramentas: dict, contratos: dict) -> dict:
    """Executa uma ferramenta com validacao."""
    if nome_ferramenta not in ferramentas:
        return {"sucesso": False, "erro": f"Ferramenta '{nome_ferramenta}' nao encontrada na caixa de ferramentas"}

    try:
        resultado = ferramentas[nome_ferramenta](argumentos or {})
    except Exception as erro:
        config_executor = contratos.get("executor", {}).get("execucao", {})
        if config_executor.get("tentar_novamente_em_falha"):
            try:
                resultado = ferramentas[nome_ferramenta](argumentos or {})
            except Exception as erro_nova_tentativa:
                return {"sucesso": False, "erro": str(erro_nova_tentativa)}
        else:
            return {"sucesso": False, "erro": str(erro)}

    return resultado


# --- Gap 4: Avaliacao Semantica ---

def avaliar(plano: dict, resultado_acao: dict, contratos: dict = None) -> dict:
    """Avalia o resultado da acao com verificacao semantica."""
    if plano.get("proxima_acao") == "FINALIZAR":
        return {"objetivo_alcancado": True, "motivo": plano.get("criterio_sucesso", "")}

    if not resultado_acao or not resultado_acao.get("sucesso"):
        motivo = f"etapa falhou - {resultado_acao.get('erro', 'sem dados') if resultado_acao else 'sem resultado'}"
        return {"objetivo_alcancado": False, "motivo": motivo, "qualidade": "falha"}

    # avaliacao semantica: validar saida contra schema
    nome_ferramenta = plano.get("nome_ferramenta", "")
    problemas_saida = []
    if contratos:
        problemas_saida = validar_saida(nome_ferramenta, resultado_acao, contratos)

    criterio = plano.get("criterio_sucesso", "")

    if problemas_saida:
        motivo = f"etapa ok com ressalvas - {'; '.join(problemas_saida)}"
        qualidade = "parcial"
    else:
        motivo = f"etapa ok - criterio: {criterio}" if criterio else "etapa ok - continuar"
        qualidade = "completa"

    return {
        "objetivo_alcancado": False,
        "motivo": motivo,
        "qualidade": qualidade,
        "problemas_saida": problemas_saida,
    }
