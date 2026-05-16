import re
from utils.llm_client import chamar_llm

SYSTEM_PROMPT = """Você é um programador sênior especialista em Godot 4 e GDScript.
Escreva scripts limpos, com tipagem estática, prontos para rodar no Godot 4.

REGRAS OBRIGATÓRIAS — Godot 4:

1. MOVIMENTO (CharacterBody2D):
   - extends: `extends CharacterBody2D`
   - processamento físico: `func _physics_process(delta: float) -> void:`
   - CORRETO: `velocity = direcao * speed` seguido de `move_and_slide()`
   - ERRADO: `move_and_slide(velocity)` ou `move_and_collide(velocity)`

2. SINAIS — conexão Godot 4:
   - CORRETO: `botao.pressed.connect(_ao_pressionar)`
   - ERRADO: `connect("pressed", self, "_ao_pressionar")`

3. AUTOLOADS (Singletons):
   - Acesse pelo nome exato em snake_case, igual ao nome do arquivo sem .gd
   - Exemplo: arquivo `global_score.gd` → acesse como `global_score.pontuacao`
   - NUNCA use PascalCase para autoloads (não é `GlobalScore`, é `global_score`)

4. MUDANÇA DE CENA:
   - CORRETO: `get_tree().change_scene_to_file("res://scenes/nome.tscn")`
   - ERRADO: `change_scene("res://cena.tscn")`

5. INSTANCIAR CENAS:
   - `preload("res://scenes/nome.tscn").instantiate()`
   - Cenas ficam SEMPRE em `res://scenes/`

6. NOMES DE NÓS — cenas UI (extends Control):
   - Filhos ficam dentro de `VBoxContainer`
   - CORRETO: `@onready var botao: Button = $VBoxContainer/StartButton`
   - ERRADO: `@onready var botao: Button = $StartButton`

7. GERAL:
   - Tipagem estática em todas as variáveis e parâmetros
   - `@onready` para todas as referências a nós
   - `.instantiate()` em vez de `.instance()`
   - `await get_tree().process_frame` em vez de `yield`

Retorne APENAS o código GDScript. Nenhum texto antes ou depois. Sem markdown. Sem ```."""


def _montar_prompt(script: dict, arvore_nos: list | None = None, autoloads: list[str] | None = None) -> str:
    nos_info = ""
    if arvore_nos:
        is_ui = any(n.get("tipo", "") in ("Button", "Label", "LineEdit", "RichTextLabel") for n in arvore_nos)
        if is_ui:
            nos_str = "\n".join(f"  - $VBoxContainer/{n['nome']} ({n['tipo']})" for n in arvore_nos)
        else:
            nos_str = "\n".join(f"  - ${n['nome']} ({n['tipo']})" for n in arvore_nos)
        nos_info = f"\n\nNós disponíveis na cena (use estes paths nos @onready):\n{nos_str}"

    autoload_info = ""
    if autoloads:
        autoload_info = f"\n\nAutoloads disponíveis (acesse pelo nome exato em snake_case): {', '.join(autoloads)}"

    return (
        f"Escreva o script GDScript para:\n"
        f"Arquivo: {script['nome']}\n"
        f"Comportamento: {script['descricao']}"
        f"{nos_info}"
        f"{autoload_info}"
    )


def gerar_codigo(script: dict, arvore_nos: list | None = None, autoloads: list[str] | None = None) -> str:
    """
    Recebe um dict de script (do JSON do Diretor) e retorna o código GDScript.
    arvore_nos: filhos da cena associada (para NodePaths corretos).
    autoloads: nomes dos singletons disponíveis (snake_case).
    """
    print(f"[Código] Gerando {script['nome']}...")
    prompt = _montar_prompt(script, arvore_nos, autoloads)
    conteudo = chamar_llm(SYSTEM_PROMPT, prompt)
    conteudo = conteudo.strip()
    # Extrai bloco de código se o LLM envolver em prosa/markdown
    match = re.search(r"```(?:gdscript|gd)?\n(.*?)```", conteudo, re.DOTALL)
    if match:
        conteudo = match.group(1).strip()
    elif conteudo.startswith("```"):
        conteudo = conteudo.split("\n", 1)[1]
        conteudo = conteudo.rsplit("```", 1)[0].strip()
    return conteudo

