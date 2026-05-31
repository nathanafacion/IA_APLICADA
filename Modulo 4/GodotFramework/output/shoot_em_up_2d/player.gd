extends CharacterBody2D

@export var speed := 300.0
@export var fire_rate := 0.25  # segundos entre tiros

var _fire_timer := 0.0
var _double_shot := false
var _fast_shot := false
var _powerup_timer := 0.0

var _bullet_scene := preload("res://scenes/bullet.tscn")

func _physics_process(delta: float) -> void:
    # Movimento por teclado (WASD / setas)
    var dir := Vector2.ZERO
    dir.x = Input.get_axis("ui_left", "ui_right")
    dir.y = Input.get_axis("ui_up", "ui_down")
    velocity = dir.normalized() * speed
    move_and_slide()

    # Power-up timer
    if _powerup_timer > 0.0:
        _powerup_timer -= delta
        if _powerup_timer <= 0.0:
            _double_shot = false
            _fast_shot = false

    # Tiro com espaço
    var intervalo := fire_rate * (0.4 if _fast_shot else 1.0)
    _fire_timer -= delta
    if Input.is_action_pressed("ui_accept") and _fire_timer <= 0.0:
        _fire_timer = intervalo
        _atirar()

func _atirar() -> void:
    _criar_bala(Vector2(0, -1))
    if _double_shot:
        _criar_bala(Vector2(-0.2, -1).normalized())
        _criar_bala(Vector2(0.2, -1).normalized())

func _criar_bala(direcao: Vector2) -> void:
    var bala := _bullet_scene.instantiate()
    bala.global_position = global_position
    bala.direction = direcao
    get_parent().add_child(bala)

func aplicar_powerup(tipo: String) -> void:
    _powerup_timer = 8.0
    if tipo == "fast":
        _fast_shot = true
    elif tipo == "double":
        _double_shot = true
