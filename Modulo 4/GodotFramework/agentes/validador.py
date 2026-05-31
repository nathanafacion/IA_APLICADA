"""
Agente Validador — cruza os @onready do script com os nós reais do .tscn.

Detecta "Node not found" antes de o Godot abrir o projeto.
Roda SEM LLM, em pure Python.
"""

import re


def _extrair_nos_tscn(conteudo_tscn: str) -> set[str]:
    """
    Lê um .tscn e retorna o conjunto de todos os caminhos de nós referenciáveis,
    por exemplo: {"VBoxContainer", "VBoxContainer/StartButton", "Panel/VBoxContainer/ScoreTable"}

    Formato do nó em .tscn:
      [node name="Nome" type="Tipo" parent="Pai/Caminho"]
      parent ausente  → nó raiz (não referenciável via $)
      parent="."      → filho direto da raiz → caminho = "Nome"
      parent="X/Y"    → aninhado            → caminho = "X/Y/Nome"
    """
    caminhos: set[str] = set()
    for linha in conteudo_tscn.splitlines():
        m = re.match(
            r'\[node name="([^"]+)" type="[^"]+"(?: parent="([^"]+)")?\]', linha
        )
        if not m:
            continue
        nome = m.group(1)
        parent = m.group(2)  # None = raiz, "." = filho direto, "X/Y" = aninhado

        if parent is None:
            continue  # raiz não aparece em $CaminhoRelativo
        elif parent == ".":
            caminhos.add(nome)
        else:
            caminhos.add(f"{parent}/{nome}")

    return caminhos


def _extrair_onready_paths(codigo_gd: str) -> list[tuple[str, str]]:
    """
    Extrai todos os @onready var ... = $Caminho do script.

    Returns:
        Lista de (nome_variavel, caminho_no) — ex: ("_score_table", "Panel/VBoxContainer/ScoreTable")
    """
    padrao = re.compile(
        r"@onready\s+var\s+(\w+)\s*(?::\s*[\w]+\s*)?=\s*\$([^\s\n]+)"
    )
    return padrao.findall(codigo_gd)


def validar_script_vs_cena(
    codigo_gd: str, conteudo_tscn: str | None
) -> list[str]:
    """
    Cruza os @onready do script com os nós disponíveis na cena associada.

    Args:
        codigo_gd:     Conteúdo do script .gd.
        conteudo_tscn: Conteúdo do arquivo .tscn correspondente (ou None se não houver).

    Returns:
        Lista de erros (vazia = tudo OK).
    """
    if conteudo_tscn is None:
        return []  # sem cena associada — não valida

    onreadys = _extrair_onready_paths(codigo_gd)
    if not onreadys:
        return []

    nos_disponiveis = _extrair_nos_tscn(conteudo_tscn)
    erros: list[str] = []

    for var_nome, path in onreadys:
        if path not in nos_disponiveis:
            erros.append(
                f'Node not found: "{path}" (usado em @onready var {var_nome}). '
                f"Nós disponíveis na cena: {sorted(nos_disponiveis)}"
            )

    return erros
