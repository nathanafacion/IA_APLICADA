"""
Planejador e Percepcao.

Monta a percepcao (contexto) e chama a LLM para gerar o proximo plano.
Usa OpenAI quando OPENAI_API_KEY estiver configurada; caso contrario,
usa planejador_mock que avanca pelas ferramentas da toolbox em ordem.
"""

import json
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*a, **kw): pass

load_dotenv(Path(__file__).parent / ".env")

_TOKENS_ZERO = {"prompt": 0, "completion": 0, "total": 0}


def perceber(estado: dict) -> str:
    """Monta o contexto atual do agente para o planejador."""
    partes = [f"Objetivo: {estado.get('objetivo', 'desconhecido')}"]

    if estado.get("evento"):
        partes.append(f"Evento disparador: {estado['evento']}")

    if estado.get("entrada"):
        partes.append(f"Entrada: {estado['entrada']}")

    historico = estado.get("historico", [])
    if historico:
        ult = historico[-1]
        plano_ult = ult.get("plano", {})
        res_ult = ult.get("resultado_acao", {})
        partes.append(
            f"Ultima etapa: ferramenta={plano_ult.get('nome_ferramenta', '-')} "
            f"sucesso={res_ult.get('sucesso', False) if res_ult else '-'}"
        )

    chamadas = estado.get("chamadas_por_ferramenta", {})
    if chamadas:
        resumo = ", ".join(f"{nome_ferramenta}={n}" for nome_ferramenta, n in chamadas.items())
        partes.append(f"Ferramentas ja chamadas: {resumo}")

    partes.append(f"Etapa atual: {estado.get('etapa', 0)}")

    return "\n".join(partes)


def construir_prompt_sistema(contratos: dict) -> str:
    """Constroi o prompt de sistema do planejador a partir dos contratos."""
    agente = contratos.get("agente", {})
    ciclo = contratos.get("ciclo", {})
    caixa_ferramentas = contratos.get("caixa_ferramentas", {})
    planejador_contrato = contratos.get("planejador", {})
    regras = contratos.get("regras", {})

    nome_agente = agente.get("nome", "agente")
    objetivo = ciclo.get("objetivo", "desconhecido")
    ferramentas = caixa_ferramentas.get("ferramentas", [])

    formato_saida = planejador_contrato.get("formato_saida", {})
    regras_planejador = planejador_contrato.get("regras", [])
    condicoes_parada = ciclo.get("condicoes_parada", [])
    ferramentas_obrigatorias = regras.get("ferramentas_obrigatorias", [])

    lista_ferramentas = "\n".join(
        f"  - {f.get('nome', '?')}: {f.get('descricao', '')} | entrada: {json.dumps(f.get('entrada', {}))}"
        for f in ferramentas
    )

    lista_formato = "\n".join(
        f"  {campo}: {desc}"
        for campo, desc in formato_saida.items()
    ) if formato_saida else '  proxima_acao: "CHAMAR_FERRAMENTA" | "FINALIZAR" | "PERGUNTAR_USUARIO"\n  nome_ferramenta: <nome>\n  argumentos_ferramenta: <dict com os argumentos>\n  criterio_sucesso: <criterio>'

    lista_regras = "\n".join(f"  - {regra}" for regra in regras_planejador) if regras_planejador else "  - Use cada ferramenta necessaria antes de finalizar"

    lista_parada = "\n".join(f"  - {cond}" for cond in condicoes_parada) if condicoes_parada else "  - objetivo_concluido"

    lista_obrigatorias = ", ".join(ferramentas_obrigatorias) if ferramentas_obrigatorias else "nenhuma"

    return f"""Voce e o planejador do agente '{nome_agente}'.
Objetivo: {objetivo}

Ferramentas disponiveis:
{lista_ferramentas}

Ferramentas OBRIGATORIAS antes de finalizar: {lista_obrigatorias}

Formato de saida (retorne APENAS JSON valido):
{lista_formato}

Regras:
{lista_regras}

Condicoes de parada:
{lista_parada}

Importante:
- Retorne APENAS JSON valido, sem texto adicional
- argumentos_ferramenta deve conter TODOS os campos obrigatorios da ferramenta
- proxima_acao deve ser exatamente "CHAMAR_FERRAMENTA", "FINALIZAR" ou "PERGUNTAR_USUARIO"
- Responda em portugues"""


def chamar_llm(contexto: str, contratos: dict, historico: list = None) -> tuple:
    """Chama a LLM para gerar o proximo plano.

    Retorna (plano, uso_tokens).
    Usa OpenAI se OPENAI_API_KEY disponivel, senao usa planejador_mock.
    """
    chave_api = os.environ.get("OPENAI_API_KEY")

    if not chave_api:
        plano = planejador_mock(contratos, historico or [], contexto=contexto)
        return plano, _TOKENS_ZERO.copy()

    from openai import OpenAI

    cliente = OpenAI(api_key=chave_api)

    prompt_sistema = construir_prompt_sistema(contratos)

    mensagens = [{"role": "system", "content": prompt_sistema}]

    if historico:
        resumo_historico = []
        for registro in historico[-3:]:
            plano_reg = registro.get("plano", {})
            res_reg = registro.get("resultado_acao", {})
            avaliacao = registro.get("avaliacao", {})
            resumo_historico.append({
                "etapa": registro.get("etapa"),
                "ferramenta": plano_reg.get("nome_ferramenta"),
                "sucesso": res_reg.get("sucesso") if res_reg else None,
                "avaliacao": avaliacao.get("motivo"),
            })
        mensagens.append({
            "role": "user",
            "content": f"Historico recente:\n{json.dumps(resumo_historico, ensure_ascii=False, indent=2)}",
        })

    mensagens.append({"role": "user", "content": f"Estado atual:\n{contexto}"})

    resposta = cliente.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=mensagens,
    )

    uso_tokens = _TOKENS_ZERO.copy()
    if resposta.usage:
        uso_tokens = {
            "prompt": resposta.usage.prompt_tokens or 0,
            "completion": resposta.usage.completion_tokens or 0,
            "total": resposta.usage.total_tokens or 0,
        }

    try:
        plano = json.loads(resposta.choices[0].message.content)
        return plano, uso_tokens
    except (json.JSONDecodeError, IndexError):
        return planejador_mock(contratos, historico or []), uso_tokens


def planejador_mock(contratos: dict, historico: list, contexto: str = "") -> dict:
    """Planejador mock que avanca pelas ferramentas em ordem.

    Extrai o caminho do projeto da entrada para passar argumentos corretos.
    """
    # extrai entrada do contexto ("Entrada: <valor>")
    entrada = ""
    for linha in contexto.split("\n"):
        if linha.startswith("Entrada:"):
            entrada = linha.replace("Entrada:", "").strip()
            break

    # coleta dados produzidos por ferramentas anteriores
    dados_historico = {}
    for reg in historico:
        res = reg.get("resultado_acao", {})
        if res and res.get("sucesso"):
            dados_historico.update(res.get("dados", {}))

    habilidades = contratos.get("habilidades", {}).get("habilidades", [])
    ferramentas_chamadas = set()
    for registro in historico:
        plano = registro.get("plano", {})
        if plano.get("proxima_acao") == "CHAMAR_FERRAMENTA" and plano.get("nome_ferramenta"):
            res = registro.get("resultado_acao")
            if res and res.get("sucesso"):
                ferramentas_chamadas.add(plano["nome_ferramenta"])

    for habilidade in habilidades:
        nome = habilidade.get("nome")
        if nome and nome not in ferramentas_chamadas:
            argumentos = {}
            for campo, tipo in habilidade.get("entrada", {}).items():
                if campo == "caminho_projeto" and entrada:
                    argumentos[campo] = entrada
                elif campo == "caminho_saida" and entrada:
                    from pathlib import Path as _Path
                    argumentos[campo] = str(_Path(entrada) / "public")
                elif campo == "paginas":
                    argumentos[campo] = dados_historico.get("paginas", [])
                elif campo == "tipo_projeto":
                    argumentos[campo] = dados_historico.get("tipo_projeto", "desconhecido")
                elif campo == "pagina":
                    paginas = dados_historico.get("paginas", ["/"])
                    argumentos[campo] = paginas[0] if paginas else "/"
                elif campo == "descricao":
                    pagina = argumentos.get("pagina", "/")
                    argumentos[campo] = f"Pagina {pagina}"
                elif tipo == "string":
                    argumentos[campo] = f"{campo}_mock"
                elif tipo == "int":
                    argumentos[campo] = 0
                elif tipo == "float":
                    argumentos[campo] = 0.0
                elif tipo == "bool":
                    argumentos[campo] = True
                elif tipo == "list":
                    argumentos[campo] = []
                elif tipo == "object":
                    argumentos[campo] = {}
                else:
                    argumentos[campo] = f"{campo}_mock"
            return {
                "proxima_acao": "CHAMAR_FERRAMENTA",
                "nome_ferramenta": nome,
                "argumentos_ferramenta": argumentos,
                "criterio_sucesso": f"{nome} executada com sucesso",
            }

    return {
        "proxima_acao": "FINALIZAR",
        "nome_ferramenta": None,
        "argumentos_ferramenta": {},
        "criterio_sucesso": "todas as ferramentas executadas",
    }
