extends Area2D

@export var speed := 600.0
var direction := Vector2.UP

func _ready() -> void:
    add_to_group("bullet")
    body_entered.connect(_on_body_entered)
    # Auto-destroi ao sair da tela
    var timer := get_tree().create_timer(3.0)
    timer.timeout.connect(queue_free)

func _physics_process(delta: float) -> void:
    position += direction * speed * delta

func _on_body_entered(body: Node) -> void:
    if body.is_in_group("enemy"):
        body.morrer()
        queue_free()
