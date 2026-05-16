extends Control

@onready var start_button: Button = $VBoxContainer/StartButton
@onready var quit_button: Button = $VBoxContainer/QuitButton
@onready var name_input: LineEdit = $VBoxContainer/NameInput

func _ready() -> void:
	start_button.pressed.connect(_on_start_pressed)
	quit_button.pressed.connect(_on_quit_pressed)
	name_input.text = global_score.nome_jogador
	name_input.grab_focus()

func _on_start_pressed() -> void:
	var nome := name_input.text.to_upper().strip_edges()
	if nome.is_empty():
		nome = "AAA"
	global_score.nome_jogador = nome
	global_score.pontuacao = 0
	get_tree().change_scene_to_file("res://scenes/gameplay.tscn")

func _on_quit_pressed() -> void:
	get_tree().quit()
