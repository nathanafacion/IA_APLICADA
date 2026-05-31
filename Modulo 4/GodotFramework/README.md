# GodotFramework — Pipeline Multi-Agente para Geração de Jogos Godot 4

> Geração automática de projetos Godot 4 completos a partir de uma descrição em linguagem natural, usando um pipeline de agentes especializados que cooperam em sequência.

---

## O que é

O GodotFramework é um orquestrador de agentes de IA que transforma uma frase como _"um shoot em up espacial com power-ups e leaderboard"_ em um projeto Godot 4 funcional — com cenas `.tscn`, scripts `.gd` e `project.godot` — sem nenhuma intervenção manual.

O sistema é dividido em módulos independentes: cada agente tem uma responsabilidade única, recebe um input bem definido e produz um output estruturado. A comunicação entre eles nunca é linguagem natural ambígua — é JSON ou texto bruto de arquivo.

---

## Estrutura do projeto

```
GodotFramework/
├── framework.py              # Ponto de entrada — CLI e orquestrador do pipeline
├── agentes_godot_ai.md       # Documentação técnica dos system prompts
├── requirements.txt
├── .env / .env.example       # Configuração do provedor LLM
│
├── agentes/                  # Um arquivo por agente especializado
│   ├── diretor.py            # Agente Diretor — gera a arquitetura JSON
│   ├── cena.py               # Agente de Cena — gera arquivos .tscn
│   ├── codigo.py             # Agente de Código — gera scripts .gd
│   ├── correcao.py           # Agente de Correção — Self-Healing Agent
│   ├── entrevista.py         # Modo interativo — coleta requisitos via perguntas
│   ├── patcher.py            # Patcher determinístico — correções Godot 3→4 por regex
│   └── validador.py          # Validador estático — cruza @onready com nós do .tscn
│
├── utils/
│   ├── llm_client.py         # Cliente unificado: OpenAI / Ollama / Mock
│   └── langchain_client.py   # Integração com LangChain (JsonOutputParser + retry)
│
└── output/                   # Projetos gerados ficam aqui
    ├── shoot_em_up_2d/       # Gerado pelo pipeline LLM
    └── truco_paulista/       # Truco Mineiro (criado manualmente)
```

---

## O pipeline em 4 passos

```
Descrição em linguagem natural
          │
          ▼
  [1] Agente Diretor
      Lê a descrição e gera um JSON com:
      - nome do jogo
      - lista de cenas (.tscn) com seus nós filhos
      - lista de scripts (.gd) com descrição do comportamento esperado
          │
          ▼ arquitetura.json
  [2] Agente de Cena
      Para cada cena do JSON, gera o conteúdo textual do .tscn
      respeitando a sintaxe nativa de serialização da Godot 4
          │
          ▼ scenes/*.tscn
  [3] Agente de Código
      Para cada script do JSON, gera o GDScript completo.
      Recebe a árvore de nós da cena associada como contexto
      para garantir que os NodePaths ($Nó) sejam válidos
          │
          ▼ (por script, em loop)
  [3a] Patcher determinístico
       Aplica correções Godot 3→4 por regex, sem LLM:
       move_and_slide(velocity)→move_and_slide(), KinematicBody2D→CharacterBody2D,
       .instance()→.instantiate(), yield→await, rand_range→randf_range etc.
          │
  [3b] Validador estático
       Extrai todos os nós do .tscn e compara com os @onready do script.
       Se há NodePaths inválidos, dispara o Self-Healing Agent (máx. 2 tentativas)
          │
  [3c] Self-Healing Agent (se necessário)
       Recebe o script com erro + a lista de erros detectados,
       e retorna a versão corrigida
          │
          ▼ scripts/*.gd
  [4] project.godot gerado
      Detecta autoloads (singletons) pela descrição dos scripts,
      define a cena inicial (main_menu > gameplay > primeira cena)
      e grava o project.godot pronto para importar na Godot
```

---

## Provedores LLM suportados

Configure via `.env` na raiz do GodotFramework:

| Provedor           | Configuração                                                                              | Modelo padrão             |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------- |
| **Ollama** (local) | `LLM_PROVIDER=ollama` + `OLLAMA_URL=http://localhost:11434/v1` + `OLLAMA_MODEL=codellama` | codellama / qwen3:8b      |
| **OpenAI**         | `LLM_PROVIDER=openai` + `OPENAI_API_KEY=sk-...`                                           | gpt-4o-mini               |
| **Mock** (sem API) | Não definir `LLM_PROVIDER`                                                                | — retorna stubs estáticos |

O modo Mock é útil para testar o pipeline e a estrutura de pastas sem gastar tokens ou precisar de conexão.

---

## Como executar

```bash
# Ativar o virtualenv
.venv\Scripts\activate

cd "Aula 4/GodotFramework"

# Modo direto — descrição passada na linha de comando
python framework.py gerar --entrada "um shoot em up espacial com power-ups e leaderboard"

# Modo entrevista interativa — o agente faz perguntas para enriquecer a descrição
python framework.py gerar

# Pasta de saída personalizada
python framework.py gerar --entrada "jogo de plataforma" --saida meu_output/

# Corrigir um script manualmente com o Self-Healing Agent
python framework.py corrigir --script output/meu_jogo/scripts/player.gd --log "Invalid get index 'x' on base 'null instance'"
```

Após a geração:

1. Abra o **Godot 4** e use **Import** apontando para a pasta do projeto gerado
2. Confirme os erros em **Output** — se houver, use o comando `corrigir` acima
3. Pressione **F5** para rodar

---

## Jogos gerados

### 1. Shoot Em Up 2D — gerado pelo pipeline LLM

`output/shoot_em_up_2d/`

Criado com o comando:

```bash
python framework.py gerar --entrada "shoot em up espacial 2D com inimigos, power-ups e leaderboard"
```

**O que foi gerado automaticamente:**

| Arquivo                          | Conteúdo                              |
| -------------------------------- | ------------------------------------- |
| `scenes/main_menu.tscn`          | Tela inicial com botões Jogar e Sair  |
| `scenes/gameplay.tscn`           | Arena principal do jogo               |
| `scenes/player.tscn`             | Nave do jogador com colisão e sprite  |
| `scenes/enemy_basic.tscn`        | Inimigo básico                        |
| `scenes/enemy_fast.tscn`         | Inimigo rápido                        |
| `scenes/bullet.tscn`             | Projétil                              |
| `scenes/power_up.tscn`           | Power-up coletável                    |
| `scenes/leaderboard_screen.tscn` | Tela de pontuação                     |
| `player.gd`                      | Movimento, tiro, colisão              |
| `enemy.gd`                       | IA simples: descida + disparo         |
| `bullet.gd`                      | Física do projétil                    |
| `power_up.gd`                    | Coleta e efeito                       |
| `game_manager.gd`                | Estado do jogo, spawn de inimigos     |
| `global_score.gd`                | Singleton de pontuação persistente    |
| `main_menu.gd`                   | Navegação entre cenas                 |
| `leaderboard_screen.gd`          | Exibição do ranking                   |
| `project.godot`                  | Configuração com autoloads detectados |

O pipeline identificou automaticamente os singletons (`global_score.gd`, `game_manager.gd`) a partir das descrições dos scripts, e os registrou como autoloads no `project.godot`.

---

### 2. Truco Mineiro — criado manualmente

`output/truco_paulista/`

Este projeto foi criado **manualmente** — os scripts e cenas foram escritos diretamente em GDScript, sem passar pelo pipeline LLM. Ele serve como exemplo de como usar o GodotFramework como base de organização de projeto sem a geração automática.

**Regras implementadas — Truco Mineiro:**

- Baralho de 40 cartas (sem 8, 9, 10)
- Manilha **variável pela vira**: a carta virada define qual valor é manilha na mão seguinte
- Ordem das manilhas por naipe (crescente): ♦ < ♠ ♥ ♣
- Ordem base das cartas: 4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3
- Truco com escalada: Normal (1) → Truco (3) → Seis (6) → Nove (9) → Doze (12)
- Partida até 12 pontos, 2 duplas (Você + Parceiro IA vs Adv1 + Adv2)

**Estrutura do jogo:**

```
scenes/
├── main_menu.tscn       # Tela inicial
├── gameplay.tscn        # Mesa de jogo circular
└── fim_de_jogo.tscn     # Tela de resultado

scripts/
├── baralho.gd           # Singleton — baralho, vira, força das cartas
├── gerenciador_jogo.gd  # Singleton — estado da partida, truco FSM, pontuação
├── ia.gd                # Singleton — decisão de carta e truco para 3 jogadores IA
├── gameplay.gd          # UI da mesa: layout circular, slots de cartas, painel truco
├── main_menu.gd         # Navegação
└── fim_de_jogo.gd       # Exibição do resultado
```

**Layout da mesa (gameplay.tscn):**

```
          [Parceiro]
              ↑
[Adv1] ←  Mesa  → [Adv2]
              ↓
          [Jogador]   ← cartas clicáveis
```

Cada posição tem um slot dedicado (`SlotJogador`, `SlotParceiro`, `SlotAdv1`, `SlotAdv2`) mostrando a carta jogada na rodada atual. O painel de Aceitar/Fugir truco (`PainelTruco`) aparece centralizado sobre a mesa com `z_index = 10`, evitando sobreposição com as cartas.

**IA conservadora:**

- Parceiro nunca pede truco
- IA só pede truco na primeira rodada da mão
- Limiar para pedir: 2 manilhas, ou 1 manilha + 1 forte (força ≥ 8), ou 3 fortes
- Aceita truco se tiver qualquer carta com força ≥ 7

---

## Adicionando suporte a novos modelos Ollama

1. Baixe o modelo: `ollama pull nome-do-modelo`
2. Edite o `.env`:
   ```
   LLM_PROVIDER=ollama
   OLLAMA_MODEL=nome-do-modelo
   OLLAMA_URL=http://localhost:11434/v1
   ```
3. Rode normalmente. O `llm_client.py` usa a API compatível OpenAI do Ollama, então qualquer modelo local funciona sem alterar código.

---

## Limitações conhecidas

- O Agente de Cena gera `.tscn` sem UIDs (`uid=""`). A Godot aceita esses arquivos, mas pode gerar avisos. Os UIDs são gerados automaticamente ao abrir o projeto.
- Projetos muito complexos (muitas cenas interdependentes) podem exigir ajustes manuais nos `@onready` paths após a geração.
- O modo Ollama com modelos menores (< 7B) tende a gerar JSON mal-formado no Agente Diretor. Prefira `codellama`, `qwen3:8b` ou modelos equivalentes para melhor resultado.
