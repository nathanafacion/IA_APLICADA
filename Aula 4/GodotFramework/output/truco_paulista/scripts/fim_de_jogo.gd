## fim_de_jogo.gd
extends Control

func _ready() -> void:
	$VBoxContainer/BtnJogarNovamente.pressed.connect(_on_jogar_novamente)
	$VBoxContainer/BtnMenu.pressed.connect(_on_menu)

	var nos   := GerenciadorJogo.pontos_nos
	var eles  := GerenciadorJogo.pontos_eles
	var vitoria := nos >= GerenciadorJogo.PONTOS_VITORIA

	$VBoxContainer/LabelResultado.text = "VITÓRIA! 🎉" if vitoria else "DERROTA..."
	$VBoxContainer/LabelResultado.modulate = Color(0.2, 1, 0.2) if vitoria else Color(1, 0.3, 0.3)
	$VBoxContainer/LabelPlacar.text = "Nós: %d  |  Eles: %d" % [nos, eles]

func _on_jogar_novamente() -> void:
	GerenciadorJogo.resetar_partida()
	get_tree().change_scene_to_file("res://scenes/gameplay.tscn")

func _on_menu() -> void:
	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
