"""
Validador de Agente.

Verifica se os contratos do agente estao completos e consistentes.
Checagens realizadas:
- Arquivos obrigatorios existem e tem YAML valido
- Ferramentas em toolbox coincidem com habilidades em skills
- ferramentas_obrigatorias em rules existem em toolbox
- Campo 'tipo' do agente tem valor valido
- Contrato de saida declarado em agent.md
"""

from pathlib import Path

from contratos import carregar_yaml_do_md

_TIPOS_VALIDOS = {"task_based", "interactive", "goal_oriented", "autonomous"}


def validar(caminho_agente: str) -> bool:
    """Valida todos os contratos do agente. Retorna True se valido."""
    caminho = Path(caminho_agente).resolve()
    pasta_contratos = caminho / "contracts"
    erros = []
    avisos = []

    # ------------------------------------------------------------------
    # 1. Verificar presenca e YAML de todos os arquivos obrigatorios
    # ------------------------------------------------------------------
    arquivos_obrigatorios = {
        "agent.md": caminho / "agent.md",
        "rules.md": caminho / "rules.md",
        "skills.md": caminho / "skills.md",
        "hooks.md": caminho / "hooks.md",
        "memory.md": caminho / "memory.md",
        "contracts/loop.md": pasta_contratos / "loop.md",
        "contracts/planner.md": pasta_contratos / "planner.md",
        "contracts/executor.md": pasta_contratos / "executor.md",
        "contracts/toolbox.md": pasta_contratos / "toolbox.md",
    }

    yamls = {}
    for nome_arquivo, caminho_arquivo in arquivos_obrigatorios.items():
        if not caminho_arquivo.exists():
            erros.append(f"arquivo obrigatorio ausente: {nome_arquivo}")
        else:
            yaml_data = carregar_yaml_do_md(caminho_arquivo)
            if not yaml_data:
                erros.append(f"arquivo sem YAML valido: {nome_arquivo}")
            else:
                yamls[nome_arquivo] = yaml_data

    if erros:
        _imprimir_resultado(erros, avisos)
        return False

    # ------------------------------------------------------------------
    # 2. Verificar tipo do agente
    # ------------------------------------------------------------------
    agente = yamls.get("agent.md", {})
    tipo_agente = agente.get("tipo")
    if tipo_agente and tipo_agente not in _TIPOS_VALIDOS:
        erros.append(
            f"tipo de agente invalido: '{tipo_agente}' (validos: {', '.join(sorted(_TIPOS_VALIDOS))})"
        )

    # ------------------------------------------------------------------
    # 3. Verificar contrato_saida em agent.md
    # ------------------------------------------------------------------
    if not agente.get("contrato_saida"):
        avisos.append("agent.md nao declara 'contrato_saida' - rastreamento de saida nao sera validado")

    # ------------------------------------------------------------------
    # 4. Consistencia toolbox x skills
    # ------------------------------------------------------------------
    toolbox = yamls.get("contracts/toolbox.md", {})
    habilidades_yaml = yamls.get("skills.md", {})

    ferramentas_toolbox = {f.get("nome") for f in toolbox.get("ferramentas", []) if f.get("nome")}
    ferramentas_skills = {h.get("nome") for h in habilidades_yaml.get("habilidades", []) if h.get("nome")}

    apenas_toolbox = ferramentas_toolbox - ferramentas_skills
    apenas_skills = ferramentas_skills - ferramentas_toolbox

    for nome_ferramenta in apenas_toolbox:
        erros.append(
            f"ferramenta '{nome_ferramenta}' declarada em toolbox.md mas ausente em skills.md"
        )
    for nome_ferramenta in apenas_skills:
        avisos.append(
            f"habilidade '{nome_ferramenta}' declarada em skills.md mas ausente em toolbox.md"
        )

    # ------------------------------------------------------------------
    # 5. Ferramentas obrigatorias existem no toolbox
    # ------------------------------------------------------------------
    regras = yamls.get("rules.md", {})
    ferramentas_obrigatorias = regras.get("ferramentas_obrigatorias", [])

    for nome_ferramenta in ferramentas_obrigatorias:
        if nome_ferramenta not in ferramentas_toolbox:
            erros.append(
                f"ferramenta obrigatoria '{nome_ferramenta}' nao declarada em toolbox.md"
            )

    _imprimir_resultado(erros, avisos)
    return len(erros) == 0


def _imprimir_resultado(erros: list, avisos: list):
    """Imprime resultado da validacao de forma legivel."""
    if avisos:
        print("\n  --- Avisos ---")
        for aviso in avisos:
            print(f"  [aviso] {aviso}")

    if erros:
        print("\n  --- Erros ---")
        for erro in erros:
            print(f"  [erro] {erro}")
        print(f"\n  Validacao FALHOU ({len(erros)} erro(s))")
    else:
        print("\n  Validacao OK - todos os contratos estao presentes e consistentes")
