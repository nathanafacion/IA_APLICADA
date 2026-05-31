import re
from utils.llm_client import chamar_llm

SYSTEM_PROMPT = """Você é um agente de depuração (debugging) especialista em Godot 4.
Você receberá o código de um script com erro e o log de erro gerado pela Godot.

Sua tarefa:
1. Identificar a linha exata que causou a falha.
2. Reescrever o script completo com a correção aplicada.

Erros comuns a observar:
- `move_and_slide(velocity)` → deve ser `move_and_slide()` (Godot 4 não aceita argumento).
- `KinematicBody2D` → deve ser `CharacterBody2D`.
- `.instance()` → deve ser `.instantiate()`.
- `connect("sinal", self, "_metodo")` → deve ser `sinal.connect(_metodo)`.
- `yield(...)` → deve ser `await ...`.

Retorne APENAS o código GDScript completo e corrigido. Sem conversas, sem justificativas, sem markdown."""


def corrigir_script(codigo_com_erro: str, log_de_erro: str) -> str:
    """
    Recebe o script com erro e o log da Godot, retorna o script corrigido.
    """
    print("[Correção] Analisando erro e corrigindo script...")
    prompt = (
        f"--- SCRIPT COM ERRO ---\n{codigo_com_erro}\n\n"
        f"--- LOG DE ERRO DA GODOT ---\n{log_de_erro}"
    )
    conteudo = chamar_llm(SYSTEM_PROMPT, prompt)
    conteudo = conteudo.strip()
    # Extrai bloco de código se houver texto ao redor (ex: "Here's the corrected code:\n```gdscript\n...")
    match = re.search(r"```(?:gdscript|gd)?\n(.*?)```", conteudo, re.DOTALL)
    if match:
        conteudo = match.group(1).strip()
    elif conteudo.startswith("```"):
        conteudo = conteudo.split("\n", 1)[1]
        conteudo = conteudo.rsplit("```", 1)[0].strip()
    return conteudo
