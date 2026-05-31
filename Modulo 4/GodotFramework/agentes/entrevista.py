"""
Agente de Entrevista — coleta requisitos do jogo antes de gerar.

Faz perguntas ao usuário para enriquecer a descrição do jogo com:
- Detalhes de mecânicas
- Estilo visual / assets
- Cenas e scripts desejados
- Preferências de dificuldade e UI

Retorna um dict com a descrição enriquecida e contexto de assets.
"""

PERGUNTAS = [
    {
        "chave": "tipo",
        "pergunta": "1. Qual é o gênero/tipo do jogo?\n   Ex: shoot em up, plataformer, puzzle, RPG top-down, runner, tower defense",
        "obrigatoria": True,
    },
    {
        "chave": "tema",
        "pergunta": "2. Qual é o tema/ambientação?\n   Ex: espaço, medieval, cyberpunk, floresta, cidade futurista",
        "obrigatoria": True,
    },
    {
        "chave": "jogador",
        "pergunta": "3. Como o jogador controla o personagem?\n   Ex: mouse (aponta e atira), WASD, setas, clique para mover",
        "obrigatoria": True,
    },
    {
        "chave": "mecanicas",
        "pergunta": "4. Quais mecânicas devem estar no jogo?\n   Ex: tiro, dash, pulo duplo, coleta de itens, power-ups, combo, vidas, timer\n   (liste tudo que quiser)",
        "obrigatoria": True,
    },
    {
        "chave": "inimigos",
        "pergunta": "5. Como são os inimigos?\n   Ex: caem do topo em hordas, perseguem o jogador, atiram de volta, tipos diferentes",
        "obrigatoria": False,
        "padrao": "inimigos simples que se movem em direção ao jogador",
    },
    {
        "chave": "powerups",
        "pergunta": "6. Quais power-ups devem existir? (Enter para pular)\n   Ex: tiro rápido, tiro duplo, escudo, velocidade, bomba, cura",
        "obrigatoria": False,
        "padrao": "",
    },
    {
        "chave": "cenas",
        "pergunta": "7. Quais telas/cenas o jogo deve ter?\n   Ex: menu principal, gameplay, pause, game over, leaderboard, cutscene",
        "obrigatoria": True,
    },
    {
        "chave": "hud",
        "pergunta": "8. O que deve aparecer no HUD durante o jogo?\n   Ex: pontuação, vidas, timer, munição, barra de vida, combo multiplier",
        "obrigatoria": False,
        "padrao": "pontuação e vidas",
    },
    {
        "chave": "dificuldade",
        "pergunta": "9. Como a dificuldade progride?\n   Ex: inimigos ficam mais rápidos com o tempo, mais tipos aparecem, spawn mais frequente",
        "obrigatoria": False,
        "padrao": "dificuldade fixa",
    },
    {
        "chave": "assets",
        "pergunta": "10. Sobre os visuais — você tem sprites/imagens prontos?\n    [s] Sim, vou fornecer meus assets depois\n    [n] Não — use formas geométricas coloridas (Polygon2D) como placeholder",
        "obrigatoria": True,
        "opcoes": ["s", "n"],
    },
    {
        "chave": "estilo_visual",
        "pergunta": "11. Qual estilo visual deseja? (Enter para pular)\n    Ex: pixel art retrô, neon/synthwave, minimalista, cartoon, dark/cyberpunk",
        "obrigatoria": False,
        "padrao": "minimalista",
    },
    {
        "chave": "extras",
        "pergunta": "12. Algum detalhe extra importante? (Enter para pular)\n    Ex: salvamento, leaderboard local, sons, música, 2 jogadores, modo história",
        "obrigatoria": False,
        "padrao": "",
    },
]


def _perguntar(pergunta_dict: dict) -> str:
    print()
    print(pergunta_dict["pergunta"])
    while True:
        resposta = input("  → ").strip()
        opcoes = pergunta_dict.get("opcoes")
        if opcoes:
            if resposta.lower() in opcoes:
                return resposta.lower()
            print(f"  Por favor responda com: {' ou '.join(opcoes)}")
            continue
        if not resposta and pergunta_dict.get("obrigatoria"):
            print("  (campo obrigatório, por favor responda)")
            continue
        if not resposta:
            return pergunta_dict.get("padrao", "")
        return resposta


def conduzir_entrevista() -> dict:
    """
    Conduz a entrevista interativa com o usuário.
    Retorna um dict com todas as respostas e a descrição enriquecida para o Diretor.
    """
    print()
    print("╔══════════════════════════════════════════════════╗")
    print("║  GodotFramework — Entrevista de Requisitos       ║")
    print("║  Responda as perguntas para gerar seu jogo       ║")
    print("╚══════════════════════════════════════════════════╝")
    print("  Dica: pressione Enter para aceitar o valor padrão nas perguntas opcionais.")

    respostas: dict[str, str] = {}
    for p in PERGUNTAS:
        respostas[p["chave"]] = _perguntar(p)

    usa_assets = respostas["assets"] == "s"

    # Monta descrição enriquecida para o Agente Diretor
    partes = [
        f"Tipo de jogo: {respostas['tipo']}.",
        f"Tema: {respostas['tema']}.",
        f"Controle do jogador: {respostas['jogador']}.",
        f"Mecânicas: {respostas['mecanicas']}.",
    ]
    if respostas["inimigos"]:
        partes.append(f"Inimigos: {respostas['inimigos']}.")
    if respostas["powerups"]:
        partes.append(f"Power-ups: {respostas['powerups']}.")
    partes.append(f"Cenas necessárias: {respostas['cenas']}.")
    if respostas["hud"]:
        partes.append(f"HUD: {respostas['hud']}.")
    if respostas["dificuldade"]:
        partes.append(f"Progressão de dificuldade: {respostas['dificuldade']}.")
    partes.append(
        f"Visuais: {'assets customizados serão fornecidos pelo desenvolvedor' if usa_assets else 'use formas geométricas coloridas (Polygon2D) como placeholder visual — sem texturas'}."
    )
    if respostas["estilo_visual"]:
        partes.append(f"Estilo visual: {respostas['estilo_visual']}.")
    if respostas["extras"]:
        partes.append(f"Extras: {respostas['extras']}.")

    descricao_enriquecida = " ".join(partes)

    print()
    print("─" * 52)
    print("[Entrevista] Requisitos coletados:")
    print(f"  {descricao_enriquecida}")
    print("─" * 52)

    return {
        "respostas": respostas,
        "usa_assets": usa_assets,
        "descricao": descricao_enriquecida,
    }
