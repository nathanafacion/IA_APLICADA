"""
Agente Patcher — Correção determinística de padrões Godot 3 → Godot 4.

Roda SEM LLM, via regex. Aplicado a todo script imediatamente após a geração
pelo agente de código, antes de qualquer validação.
"""

import re

# Cada entrada: (padrão_regex, substituto, descrição_legível)
_PATCHES: list[tuple[str, str, str]] = [
    # move_and_slide com argumento (Godot 3) → sem argumento (Godot 4)
    (
        r"move_and_slide\s*\(\s*velocity\s*\)",
        "move_and_slide()",
        "move_and_slide(velocity) → move_and_slide()",
    ),
    (
        r"move_and_slide\s*\(\s*[A-Za-z_]\w*\s*(?:\*[^)]+)?\)",
        "move_and_slide()",
        "move_and_slide(arg) → move_and_slide()",
    ),
    # Tipos de nó renomeados
    (r"\bKinematicBody2D\b", "CharacterBody2D", "KinematicBody2D → CharacterBody2D"),
    (r"\bKinematicBody\b", "CharacterBody3D", "KinematicBody → CharacterBody3D"),
    # Sprite sem sufixo (ex: "Sprite" isolado, não "Sprite2D" nem "Sprite3D")
    (r"\bSprite\b(?!2D|3D)", "Sprite2D", "Sprite → Sprite2D"),
    # instanciar
    (r"\.instance\(\)", ".instantiate()", ".instance() → .instantiate()"),
    # mudança de cena — API antiga
    (
        r"get_tree\(\)\.change_scene\s*\(",
        "get_tree().change_scene_to_file(",
        "change_scene() → change_scene_to_file()",
    ),
    # yield → await
    (r"\byield\s*\(", "await (", "yield( → await ("),
    # rand_range → randf_range
    (r"\brand_range\b", "randf_range", "rand_range → randf_range"),
    # VisualServer → RenderingServer
    (r"\bVisualServer\b", "RenderingServer", "VisualServer → RenderingServer"),
    # OS.get_ticks_msec → Time.get_ticks_msec
    (
        r"\bOS\.get_ticks_msec\b",
        "Time.get_ticks_msec",
        "OS.get_ticks_msec → Time.get_ticks_msec",
    ),
    # Autoloads em PascalCase comuns → snake_case (codellama produz isso frequentemente)
    (r"\bGlobalScore\b", "global_score", "GlobalScore → global_score"),
    (r"\bGameManager\b(?=\.)", "game_manager", "GameManager. → game_manager."),
]


def aplicar_patches(codigo: str) -> tuple[str, list[str]]:
    """
    Aplica todas as correções determinísticas ao código.

    Returns:
        (codigo_corrigido, lista_de_descricoes_das_mudancas)
    """
    mudancas: list[str] = []
    for padrao, substituto, descricao in _PATCHES:
        novo = re.sub(padrao, substituto, codigo)
        if novo != codigo:
            mudancas.append(descricao)
            codigo = novo
    return codigo, mudancas
