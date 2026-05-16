extends CharacterBody2D

@export var speed: float = 150.0

func _ready() -> void:
	add_to_group("enemy")
	collision_layer = 2
	collision_mask = 5  # colide com player (1) e bala (4)

func _physics_process(delta: float) -> void:
	velocity = Vector2.DOWN * speed
	move_and_slide()
	# Se sair da tela, inimigo passou — jogador perde vida
	var limite := get_viewport().get_visible_rect().size.y + 60.0
	if position.y > limite:
		var gm := get_tree().get_first_node_in_group("game_manager")
		if gm:
			gm.perder_vida()
		queue_free()

func morrer() -> void:
	var gm := get_tree().get_first_node_in_group("game_manager")
	if gm:
		gm.adicionar_pontos(10)
	queue_free()
