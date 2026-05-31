"""
GodotFramework — Orquestrador Multi-Agente
==========================================
Uso:
  python framework.py gerar                            # modo interativo (entrevista)
  python framework.py gerar --entrada "desc" [--saida output/]  # modo direto
  python framework.py corrigir --script arquivo.gd --log "erro"

Variáveis de ambiente:
  OPENAI_API_KEY  — se ausente, roda em modo mock (sem chamadas reais à API)
"""

import argparse
import json
import os
import sys

from agentes.diretor import gerar_arquitetura
from agentes.cena import gerar_cena
from agentes.codigo import gerar_codigo
from agentes.correcao import corrigir_script
from agentes.entrevista import conduzir_entrevista
from agentes.patcher import aplicar_patches
from agentes.validador import validar_script_vs_cena


# ─────────────────────────────────────────────
# Helpers de I/O
# ─────────────────────────────────────────────

def _salvar(caminho: str, conteudo: str) -> None:
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(conteudo)
    print(f"  → Salvo: {caminho}")


def _gerar_project_godot(nome_jogo: str, autoloads: list[str], cenas: list[dict]) -> str:
    """Gera o conteúdo básico de um project.godot para o jogo."""
    # Prefere main_menu como cena inicial; senão usa gameplay; senão a primeira cena
    nomes_cenas = [c["nome"].replace(".tscn", "") for c in cenas]
    if "main_menu" in nomes_cenas:
        main_scene = "res://scenes/main_menu.tscn"
    elif "gameplay" in nomes_cenas:
        main_scene = "res://scenes/gameplay.tscn"
    elif cenas:
        main_scene = f"res://scenes/{cenas[0]['nome']}"
    else:
        main_scene = ""

    autoload_section = ""
    if autoloads:
        autoload_section = "\n[autoload]\n"
        for a in autoloads:
            autoload_section += f'{a}="*res://{a}.gd"\n'

    return f"""; Engine configuration file — Godot 4
; Gerado automaticamente pelo GodotFramework

[application]

config/name="{nome_jogo}"
run/main_scene="{main_scene}"
config/features=PackedStringArray("4.3", "GL Compatibility")
{autoload_section}
[rendering]

renderer/rendering_method="gl_compatibility"
"""


# ─────────────────────────────────────────────
# Helper: gerar + patch + validar + auto-corrigir
# ─────────────────────────────────────────────

MAX_TENTATIVAS_CORRECAO = 2


def _gerar_e_validar_script(
    script: dict,
    arvore: list | None,
    autoloads: list[str] | None,
    raiz: str,
) -> str:
    """
    Pipeline completo para um script:
      1. Gerar via LLM
      2. Patcher determinístico (Godot 3→4)
      3. Validar @onready vs .tscn
      4. Auto-corrigir com Self-Healing Agent (máx MAX_TENTATIVAS_CORRECAO)
    Retorna o código final (corrigido ou não se persistir).
    """
    nome = script["nome"]

    # ── 1. Gerar ──
    conteudo = gerar_codigo(script, arvore, autoloads)

    # ── 2. Patcher ──
    conteudo, mudancas = aplicar_patches(conteudo)
    if mudancas:
        print(f"    [Patcher] {len(mudancas)} correção(ões) em {nome}:")
        for m in mudancas:
            print(f"      • {m}")

    # ── 3. Carregar cena associada ──
    nome_cena = nome.replace(".gd", ".tscn")
    caminho_cena = os.path.join(raiz, "scenes", nome_cena)
    conteudo_tscn: str | None = None
    if os.path.isfile(caminho_cena):
        with open(caminho_cena, encoding="utf-8") as f:
            conteudo_tscn = f.read()

    # ── 4. Validar + auto-corrigir ──
    for tentativa in range(MAX_TENTATIVAS_CORRECAO):
        erros = validar_script_vs_cena(conteudo, conteudo_tscn)
        if not erros:
            print(f"    [Validador] OK — {nome}")
            break
        print(
            f"    [Validador] {len(erros)} erro(s) em {nome} "
            f"— auto-corrigindo (tentativa {tentativa + 1}/{MAX_TENTATIVAS_CORRECAO})..."
        )
        for e in erros:
            print(f"      ! {e}")
        conteudo = corrigir_script(conteudo, "\n".join(erros))
        conteudo, _ = aplicar_patches(conteudo)
    else:
        # Verifica uma última vez após todas as tentativas
        erros_finais = validar_script_vs_cena(conteudo, conteudo_tscn)
        if erros_finais:
            print(f"    [Validador] AVISO: {len(erros_finais)} erro(s) persistente(s) em {nome}")
        else:
            print(f"    [Validador] OK — {nome}")

    return conteudo


# ─────────────────────────────────────────────
# Comando: gerar
# ─────────────────────────────────────────────

def cmd_gerar(descricao: str, pasta_saida: str, usa_assets: bool = False) -> None:
    print("\n" + "=" * 60)
    print("  GodotFramework — Pipeline Multi-Agente")
    print("=" * 60)

    # ── Passo 1: Agente Diretor ──
    print("\n[Passo 1/3] Agente Diretor — Gerando arquitetura...")
    arquitetura = gerar_arquitetura(descricao)

    nome_jogo = arquitetura["nome_do_jogo"]
    raiz = os.path.join(pasta_saida, nome_jogo)

    # Salva arquitetura como referência
    _salvar(
        os.path.join(raiz, "arquitetura.json"),
        json.dumps(arquitetura, ensure_ascii=False, indent=2),
    )

    # ── Passo 2: Agente de Cena ──
    print(f"\n[Passo 2/3] Agente de Cena — Gerando {len(arquitetura['cenas'])} cena(s)...")
    for cena in arquitetura["cenas"]:
        conteudo_tscn = gerar_cena(cena, usa_assets=usa_assets)
        _salvar(os.path.join(raiz, "scenes", cena["nome"]), conteudo_tscn)

    # ── Passo 3: Agente de Código ──
    print(f"\n[Passo 3/3] Agente de Código — Gerando {len(arquitetura['scripts'])} script(s)...")

    # Monta mapa cena→filhos para passar ao agente de código como contexto
    mapa_nos: dict[str, list] = {}
    for cena in arquitetura["cenas"]:
        script_assoc = cena.get("script_associado", "")
        if script_assoc:
            mapa_nos[script_assoc] = cena.get("filhos", [])

    autoloads: list[str] = []
    for script in arquitetura["scripts"]:
        # Detecta autoloads pela descrição
        desc = script.get("descricao", "").lower()
        if "autoload" in desc or "singleton" in desc:
            autoloads.append(script["nome"].replace(".gd", ""))

    for script in arquitetura["scripts"]:
        arvore = mapa_nos.get(script["nome"])
        conteudo_gd = _gerar_e_validar_script(
            script, arvore, autoloads if autoloads else None, raiz
        )
        _salvar(os.path.join(raiz, script["nome"]), conteudo_gd)

    # ── project.godot ──
    project_godot = _gerar_project_godot(nome_jogo, autoloads, arquitetura["cenas"])
    _salvar(os.path.join(raiz, "project.godot"), project_godot)

    print("\n" + "=" * 60)
    print(f"  Projeto gerado com sucesso em: {raiz}/")
    print("=" * 60)
    print("\nPróximos passos:")
    print(f"  1. Abra a Godot 4 e importe a pasta: {raiz}/")
    print("  2. Confira as cenas em scenes/ e os scripts na raiz.")
    print("  3. Se houver erros de parser, rode:")
    print(f"     python framework.py corrigir --script <arquivo.gd> --log \"<mensagem de erro>\"")


# ─────────────────────────────────────────────
# Comando: corrigir
# ─────────────────────────────────────────────

def cmd_corrigir(caminho_script: str, log_erro: str) -> None:
    if not os.path.isfile(caminho_script):
        print(f"Erro: arquivo não encontrado: {caminho_script}")
        sys.exit(1)

    with open(caminho_script, encoding="utf-8") as f:
        codigo = f.read()

    print(f"\n[Self-Healing] Corrigindo {caminho_script}...")
    codigo_corrigido = corrigir_script(codigo, log_erro)

    # Salva backup e sobrescreve
    backup = caminho_script + ".bak"
    with open(backup, "w", encoding="utf-8") as f:
        f.write(codigo)
    with open(caminho_script, "w", encoding="utf-8") as f:
        f.write(codigo_corrigido)

    print(f"  → Backup salvo em: {backup}")
    print(f"  → Script corrigido: {caminho_script}")


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="GodotFramework — geração automática de projetos Godot 4 com multi-agentes."
    )
    sub = parser.add_subparsers(dest="comando", required=True)

    # gerar
    p_gerar = sub.add_parser("gerar", help="Gera um projeto Godot a partir de uma descrição.")
    p_gerar.add_argument(
        "--entrada",
        default=None,
        help="Descrição do jogo em linguagem natural. Se omitido, inicia modo entrevista interativa.",
    )
    p_gerar.add_argument("--saida", default="output", help="Pasta de saída (padrão: output/).")

    # corrigir
    p_corrigir = sub.add_parser("corrigir", help="Corrige um script com erro usando o Self-Healing Agent.")
    p_corrigir.add_argument("--script", required=True, help="Caminho para o script .gd com erro.")
    p_corrigir.add_argument("--log", required=True, help="Mensagem de erro do console da Godot.")

    args = parser.parse_args()

    if args.comando == "gerar":
        if args.entrada:
            # Modo direto: descrição passada via --entrada
            cmd_gerar(args.entrada, args.saida, usa_assets=False)
        else:
            # Modo interativo: conduz entrevista e usa resposta enriquecida
            resultado = conduzir_entrevista()
            confirmar = input("\nDeseja gerar o projeto com esses requisitos? [s/n]: ").strip().lower()
            if confirmar != "s":
                print("Geração cancelada.")
                sys.exit(0)
            cmd_gerar(resultado["descricao"], args.saida, usa_assets=resultado["usa_assets"])
    elif args.comando == "corrigir":
        cmd_corrigir(args.script, args.log)



if __name__ == "__main__":
    main()
