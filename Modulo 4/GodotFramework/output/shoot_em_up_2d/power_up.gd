extends Area2D

@export var tipo := "fast"  # "fast" ou "double"
@export var speed := 80.0

func _ready() -> void:
    body_entered.connect(_on_body_entered)
    # Muda cor conforme o tipo
    var shape: Polygon2D = $Shape
    if tipo == "double":
        shape.color = Color(0.7, 0.2, 1.0, 1.0)  # roxo = tiro duplo
    # verde já é o padrão na cena (tiro rápido)

func _physics_process(delta: float) -> void:
    position += Vector2.DOWN * speed * delta
    var limite := get_viewport().get_visible_rect().size.y + 60.0
    if position.y > limite:
        queue_free()

func _on_body_entered(body: Node) -> void:
    if body.has_method("aplicar_powerup"):
        body.aplicar_powerup(tipo)
        queue_free()
