extends Node

var score := 0
var lives := 3
var spawn_timer := 0.0
var spawn_interval := 2.0
var powerup_spawn_timer := 0.0
var powerup_spawn_interval := 10.0

var _enemy_scene := preload("res://scenes/enemy_basic.tscn")
var _powerup_scene := preload("res://scenes/power_up.tscn")

@onready var _score_label: Label = $HUD/ScoreLabel
@onready var _lives_label: Label = $HUD/LivesLabel

func _ready() -> void:
    add_to_group("game_manager")
    _atualizar_hud()

func _process(delta: float) -> void:
    # Spawn inimigos
    spawn_timer += delta
    if spawn_timer >= spawn_interval:
        spawn_timer = 0.0
        _spawnar_inimigo()
        # Aumenta dificuldade progressivamente
        spawn_interval = maxf(0.5, spawn_interval - 0.02)

    # Spawn power-ups
    powerup_spawn_timer += delta
    if powerup_spawn_timer >= powerup_spawn_interval:
        powerup_spawn_timer = 0.0
        _spawnar_powerup()

func _spawnar_inimigo() -> void:
    var enemy := _enemy_scene.instantiate()
    var w := get_viewport().get_visible_rect().size.x
    enemy.position = Vector2(randf_range(40.0, w - 40.0), -50.0)
    get_parent().add_child(enemy)

func _spawnar_powerup() -> void:
    var pu := _powerup_scene.instantiate()
    var tipos := ["fast", "double"]
    pu.tipo = tipos[randi() % tipos.size()]
    var w := get_viewport().get_visible_rect().size.x
    pu.position = Vector2(randf_range(40.0, w - 40.0), -50.0)
    get_parent().add_child(pu)

func adicionar_pontos(pts: int) -> void:
    score += pts
    global_score.pontuacao = score
    _atualizar_hud()

func perder_vida() -> void:
    lives -= 1
    _atualizar_hud()
    if lives <= 0:
        get_tree().change_scene_to_file("res://scenes/leaderboard_screen.tscn")

func _atualizar_hud() -> void:
    _score_label.text = "Pontos: %d" % score
    _lives_label.text = "Vidas: %d" % lives
