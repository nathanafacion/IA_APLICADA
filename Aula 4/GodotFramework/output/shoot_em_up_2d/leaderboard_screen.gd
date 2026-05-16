extends Control

const SAVE_PATH = "user://leaderboard.save"

@onready var _score_table: RichTextLabel = $Panel/VBoxContainer/ScoreTable
@onready var _back_button: Button = $Panel/VBoxContainer/BackButton
@onready var _sua_pos_label: Label = $Panel/VBoxContainer/SuaPosLabel

var entries: Array = []
var _player_pos := -1

func _ready() -> void:
	_back_button.pressed.connect(_on_back_button_pressed)
	_load_scores()

	var nome := global_score.nome_jogador.to_upper().strip_edges()
	if nome.is_empty():
		nome = "???"
	var pts := global_score.pontuacao
	if pts > 0:
		entries.append({"nome": nome, "pontos": pts})
		entries.sort_custom(func(a, b): return a.pontos > b.pontos)
		if entries.size() > 10:
			entries = entries.slice(0, 10)
		_save_scores()
		for i in range(entries.size() - 1, -1, -1):
			if entries[i].nome == nome and entries[i].pontos == pts:
				_player_pos = i
				break

	_display_scores()

func _load_scores() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	var parsed = JSON.parse_string(file.get_as_text())
	file.close()
	if parsed is Array:
		entries = parsed

func _save_scores() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	file.store_string(JSON.stringify(entries))
	file.close()

func _display_scores() -> void:
	var text := "[center][b]TOP 10[/b][/center]\n\n"
	if entries.is_empty():
		text += "[center]Nenhuma pontuacao ainda![/center]"
	else:
		for i in entries.size():
			var e: Dictionary = entries[i]
			var linha := "%d.  %-5s  %d pts" % [i + 1, e.nome, e.pontos]
			if i == _player_pos:
				text += "[color=yellow][b]> %s  <[/b][/color]\n" % linha
			else:
				text += "  %s\n" % linha
	_score_table.text = text

	if _player_pos >= 0:
		_sua_pos_label.text = "Sua posicao: %do  (%d pts)" % [_player_pos + 1, global_score.pontuacao]
	else:
		_sua_pos_label.text = "Pontuacao nao entrou no Top 10"

func _on_back_button_pressed() -> void:
	global_score.pontuacao = 0
	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
