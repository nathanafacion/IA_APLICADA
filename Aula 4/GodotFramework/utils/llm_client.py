import os
from openai import OpenAI
from dotenv import load_dotenv

# Caminho explícito para o .env na raiz do GodotFramework (um nível acima de utils/)
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path=_env_path)

# ── Detecção do provedor ──────────────────────────────────────────────────────
# LLM_PROVIDER=ollama  → usa Ollama local (http://localhost:11434)
# LLM_PROVIDER=openai  → usa OpenAI (requer OPENAI_API_KEY)
# Sem configuração     → modo mock (sem chamadas reais)

_provider = os.getenv("LLM_PROVIDER", "").lower()
_api_key = os.getenv("OPENAI_API_KEY", "")
_ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/v1")
_ollama_model = os.getenv("OLLAMA_MODEL", "llama3")

_mock_mode = False

if _provider == "ollama":
    _client = OpenAI(base_url=_ollama_url, api_key="ollama")
elif _provider == "openai" or (_api_key and not _api_key.startswith("sk-...")):
    _client = OpenAI(api_key=_api_key)
else:
    _mock_mode = True


def chamar_llm(system_prompt: str, user_prompt: str, model: str = "gpt-4o-mini") -> str:
    """
    Chama a LLM com o system_prompt e user_prompt fornecidos.
    Provedor selecionado por LLM_PROVIDER no .env (ollama | openai).
    Sem configuração, retorna placeholder de mock.
    """
    if _mock_mode:
        print("  [MOCK] LLM não configurada — retornando placeholder.")
        return _mock_response(system_prompt, user_prompt)

    if _provider == "ollama":
        model = _ollama_model

    response = _client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content.strip()


def _mock_response(system_prompt: str, user_prompt: str) -> str:
    """Respostas mock para desenvolvimento sem chave de API."""
    if '"cenas"' in system_prompt or "arquitetura" in system_prompt.lower():
        return '''{
  "nome_do_jogo": "space_shooter",
  "cenas": [
    {
      "nome": "main_menu.tscn",
      "tipo_raiz": "Control",
      "filhos": [
        {"nome": "Background", "tipo": "ColorRect"},
        {"nome": "Title", "tipo": "Label"},
        {"nome": "BtnJogar", "tipo": "Button"},
        {"nome": "BtnRanking", "tipo": "Button"}
      ],
      "script_associado": "main_menu.gd"
    },
    {
      "nome": "gameplay.tscn",
      "tipo_raiz": "Node2D",
      "filhos": [
        {"nome": "ParallaxBackground", "tipo": "ParallaxBackground"},
        {"nome": "Player", "tipo": "CharacterBody2D"},
        {"nome": "EnemySpawner", "tipo": "Node"},
        {"nome": "HUD", "tipo": "CanvasLayer"},
        {"nome": "GameManager", "tipo": "Node"}
      ],
      "script_associado": "game_manager.gd"
    },
    {
      "nome": "player.tscn",
      "tipo_raiz": "CharacterBody2D",
      "filhos": [
        {"nome": "Sprite2D", "tipo": "Sprite2D"},
        {"nome": "CollisionShape2D", "tipo": "CollisionShape2D"},
        {"nome": "ShootTimer", "tipo": "Timer"},
        {"nome": "InvincibilityTimer", "tipo": "Timer"}
      ],
      "script_associado": "player.gd"
    },
    {
      "nome": "enemy_basic.tscn",
      "tipo_raiz": "CharacterBody2D",
      "filhos": [
        {"nome": "Sprite2D", "tipo": "Sprite2D"},
        {"nome": "CollisionShape2D", "tipo": "CollisionShape2D"}
      ],
      "script_associado": "enemy.gd"
    },
    {
      "nome": "enemy_fast.tscn",
      "tipo_raiz": "CharacterBody2D",
      "filhos": [
        {"nome": "Sprite2D", "tipo": "Sprite2D"},
        {"nome": "CollisionShape2D", "tipo": "CollisionShape2D"}
      ],
      "script_associado": "enemy.gd"
    },
    {
      "nome": "leaderboard_screen.tscn",
      "tipo_raiz": "Control",
      "filhos": [
        {"nome": "Background", "tipo": "ColorRect"},
        {"nome": "Title", "tipo": "Label"},
        {"nome": "ScoreList", "tipo": "VBoxContainer"},
        {"nome": "InitialsInput", "tipo": "LineEdit"},
        {"nome": "BtnVoltar", "tipo": "Button"}
      ],
      "script_associado": "leaderboard_screen.gd"
    }
  ],
  "scripts": [
    {
      "nome": "global_score.gd",
      "descricao": "Autoload/Singleton. Guarda a pontuacao atual, o multiplicador de combo, as vidas restantes e o historico do ranking. Salva e carrega o ranking em arquivo JSON local."
    },
    {
      "nome": "player.gd",
      "descricao": "Movimentacao em todas as direcoes com Input.get_vector. Tiro automatico por Timer. Detecta colisao com inimigos e projéteis, reduz vidas via GlobalScore, ativa invencibilidade temporaria."
    },
    {
      "nome": "enemy.gd",
      "descricao": "Move o inimigo para baixo. Ao sair da tela ou ser destruido emite sinal inimigo_destruido(pontos: int). Suporta parametros exportados: velocidade e valor em pontos."
    },
    {
      "nome": "game_manager.gd",
      "descricao": "Orquestra as ondas. Conecta sinais dos inimigos, calcula combo e multiplicador, atualiza HUD, controla spawn progressivo. Quando vidas chegam a 0 muda para leaderboard_screen."
    },
    {
      "nome": "main_menu.gd",
      "descricao": "Conecta botoes: BtnJogar muda para gameplay.tscn, BtnRanking muda para leaderboard_screen.tscn."
    },
    {
      "nome": "leaderboard_screen.gd",
      "descricao": "Le o ranking do GlobalScore, exibe as top 10 pontuacoes. Se a pontuacao atual qualifica, exibe campo InitialsInput para o jogador digitar 3 letras e salva no ranking."
    }
  ]
}'''

    if "gd_scene" in system_prompt or ".tscn" in system_prompt:
        return '[gd_scene load_steps=1 format=3]\n\n[node name="Root" type="Node2D"]\n'

    if "GDScript" in system_prompt or "gdscript" in system_prompt.lower():
        return 'extends Node\n\nfunc _ready() -> void:\n\tpass\n'

    if "depuração" in system_prompt or "debugging" in system_prompt.lower():
        return 'extends Node\n\nfunc _ready() -> void:\n\tpass\n'

    return "# mock output"
