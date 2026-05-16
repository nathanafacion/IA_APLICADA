## main_menu.gd
extends Control

func _ready() -> void:
	$VBoxContainer/BtnJogar.pressed.connect(_on_jogar)
	$VBoxContainer/BtnSair.pressed.connect(_on_sair)

func _on_jogar() -> void:
	GerenciadorJogo.resetar_partida()
	get_tree().change_scene_to_file("res://scenes/gameplay.tscn")

func _on_sair() -> void:
	get_tree().quit()
