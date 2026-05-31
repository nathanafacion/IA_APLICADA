# Framework Multi-Agente para Geração de Jogos Godot 4

> Documentação técnica da arquitetura e dos System Prompts dos agentes responsáveis por gerar, estruturar e corrigir projetos Godot 4 de forma autônoma.

---

## Visão Geral da Arquitetura

O framework é composto por **4 agentes especializados** que operam em pipeline:

```
[Ideia em linguagem natural]
        ↓
  Agente Diretor          → JSON de arquitetura do jogo
        ↓
  Agente de Cena          → Arquivos .tscn / .tres
        ↓
  Agente de Código        → Scripts .gd (GDScript)
        ↓
  Agente de Correção      → Scripts corrigidos (Self-Healing)
```

Cada agente tem escopo isolado, recebe um input bem definido e retorna um output estruturado. A comunicação entre eles é feita via JSON ou texto bruto — nunca linguagem natural ambígua.

---

## 1. Agente Diretor (Orquestrador)

### Escopo

Recebe a ideia do jogo em linguagem natural e produz um **JSON de arquitetura** descrevendo todas as cenas, a hierarquia de nós e os scripts necessários. Atua como Product Owner e Arquiteto — não escreve código, apenas projeta a estrutura.

### System Prompt

```
Você é um arquiteto de jogos especialista em Godot 4.
Sua tarefa é receber uma descrição de jogo em linguagem natural e traduzi-la em um JSON estruturado descrevendo a arquitetura completa do projeto.

Regras:
- Liste todas as cenas (.tscn) necessárias.
- Para cada cena, defina o nó raiz, seus filhos diretos e o script associado (se houver).
- Para cada script, escreva uma descrição precisa do comportamento esperado.
- Não escreva código GDScript. Apenas descreva o que cada script deve fazer.
- Retorne SOMENTE o JSON. Sem explicações, sem blocos markdown.
```

### Formato de Saída Esperado (JSON)

```json
{
  "nome_do_jogo": "ice_platformer",
  "cenas": [
    {
      "nome": "player.tscn",
      "tipo_raiz": "CharacterBody2D",
      "filhos": [
        { "nome": "Sprite2D", "tipo": "Sprite2D" },
        { "nome": "CollisionShape2D", "tipo": "CollisionShape2D" }
      ],
      "script_associado": "player.gd"
    },
    {
      "nome": "mundo.tscn",
      "tipo_raiz": "Node2D",
      "filhos": [{ "nome": "TileMapLayer", "tipo": "TileMapLayer" }]
    }
  ],
  "scripts": [
    {
      "nome": "player.gd",
      "descricao": "Movimentação 2D horizontal, pulo e mecânica de atirar projétil de gelo ao pressionar 'ui_accept'."
    }
  ]
}
```

---

## 2. Agente de Arquitetura de Cena (Gerador TSCN)

### Escopo

Responsável por gerar a estrutura de arquivos de texto nativos da Godot (`.tscn` para cenas e `.tres` para recursos). Ele entende como a Godot serializa a árvore de nós em formato texto e traduz o JSON do Diretor em arquivos prontos para uso.

### System Prompt

````
Você é um gerador automatizado de arquivos de cena (.tscn) para a Godot 4.
Sua única saída deve ser o conteúdo textual bruto de um arquivo .tscn válido que a Godot consiga abrir sem erros.

Regras Estritas:
- Use o formato de serialização padrão da Godot 4 (ex: [gd_scene load_steps=... type="packed" format=3]).
- Certifique-se de definir corretamente os IDs de recursos externos (ext_resource) para scripts ou texturas que serão injetados.
- Não inclua nenhuma explicação em markdown (como ```blocks), retorne APENAS o texto do arquivo.
````

### Formato de Saída Esperado (Texto Bruto / TSCN)

```
[gd_scene load_steps=2 format=3 uid="uid://b8x8k8x8k8x8"]

[ext_resource type="Script" path="res://player.gd" id="1_script"]

[node name="Player" type="CharacterBody2D"]
script = ExtResource("1_script")

[node name="Sprite2D" type="Sprite2D" parent="."]

[node name="CollisionShape2D" type="CollisionShape2D" parent="."]
```

---

## 3. Agente de Código (Engenheiro GDScript)

### Escopo

Escreve o código de comportamento dos objetos usando GDScript focado na Godot 4. Recebe a descrição do script fornecida pelo Diretor e a árvore de nós gerada pelo Agente de Cena para garantir que os NodePaths (`$NomeDoNo`) referenciem nós que realmente existem na cena.

### System Prompt

```
Você é um programador sênior especialista em Godot 4 e GDScript.
Sua tarefa é escrever scripts limpos, performáticos e seguros.

Diretrizes de Código (Godot 4):
- Use tipagem estática obrigatoriamente (ex: var speed: float = 300.0).
- Use a nova sintaxe de annotations (ex: @onready var sprite: Sprite2D = $Sprite2D).
- Respeite as mudanças da Godot 4: use `move_and_slide()` sem argumentos
  (a velocidade é inferida pelo vetor de classe `velocity`).
- Para instanciar cenas em código, use `preload("res://cena.tscn").instantiate()`.
- Retorne APENAS o código puro. Sem explicações, sem comentários introdutórios.
```

### Formato de Saída Esperado (GDScript)

```gdscript
extends CharacterBody2D

@export var speed: float = 200.0
@export var jump_velocity: float = -400.0

var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")

@onready var sprite: Sprite2D = $Sprite2D

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += gravity * delta

	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y = jump_velocity

	var direction := Input.get_axis("ui_left", "ui_right")
	if direction:
		velocity.x = direction * speed
	else:
		velocity.x = move_toward(velocity.x, 0, speed)

	move_and_slide()
```

---

## 4. Agente de Correção (Self-Healing Agent)

### Escopo

Atua na esteira de QA (Quality Assurance). Quando o framework tenta rodar o jogo e a Godot fecha com erro, ou quando o analisador de sintaxe aponta falhas, este agente analisa o erro, lê o código problemático e gera a versão corrigida. É ativado automaticamente pelo orquestrador ao detectar saída de erro no console da Godot.

### System Prompt

```
Você é um agente de depuração (debugging) de Godot 4.
Você receberá:
1. O código do script original que apresentou falhas.
2. O log de erro gerado pelo console/engine da Godot.

Sua tarefa é identificar a linha exata que causou a falha
(ex: erro de digitação, nó inexistente, API desatualizada da Godot 3)
e reescrever o script corrigido.

Retorne APENAS o código completo do script corrigido. Sem conversas, sem justificativas.
```

### Formato de Entrada (Contexto recebido pelo Agente)

```
--- SCRIPT COM ERRO ---
func _physics_process(delta):
    move_and_slide(velocity)  # Erro aqui (sintaxe antiga da Godot 3)

--- LOG DE ERRO DA GODOT ---
Parser Error: Too many arguments for "move_and_slide()" call. Expected at most 0.
```

### Formato de Saída Esperado (GDScript Corrigido)

```gdscript
extends CharacterBody2D

func _physics_process(delta: float) -> void:
	move_and_slide()
```

---

## Referências de API — Godot 4 vs Godot 3

Principais quebras de compatibilidade que o Agente de Código e o Agente de Correção devem conhecer:

| Godot 3 (incorreto)                 | Godot 4 (correto)                        |
| ----------------------------------- | ---------------------------------------- |
| `move_and_slide(velocity, UP)`      | `move_and_slide()` (usa `self.velocity`) |
| `KinematicBody2D`                   | `CharacterBody2D`                        |
| `.instance()`                       | `.instantiate()`                         |
| `yield(get_tree(), "idle_frame")`   | `await get_tree().process_frame`         |
| `connect("sinal", self, "_metodo")` | `sinal.connect(_metodo)`                 |
| `onready var x = $No`               | `@onready var x: Tipo = $No`             |
| `export var x`                      | `@export var x: Tipo`                    |
| `OS.get_ticks_msec()`               | `Time.get_ticks_msec()`                  |
