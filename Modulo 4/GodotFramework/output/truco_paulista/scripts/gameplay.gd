## gameplay.gd
## Script principal da cena de jogo. Gerencia o fluxo completo de uma partida.

extends Control

# ── Referências a nós ───────────────────────────────────────────
@onready var label_placar           := $Placar
@onready var label_vira             := $LabelVira
@onready var label_rodada           := $LabelRodada
@onready var label_info             := $LabelInfo
@onready var container_mao          := $ContainerMaoJogador
@onready var btn_truco              := $ContainerBotoes/BtnTruco
@onready var painel_truco           := $PainelTruco
@onready var label_truco_msg        := $PainelTruco/VBox/LabelTrucoMsg
@onready var btn_aceitar            := $PainelTruco/VBox/HBoxBotoes/BtnAceitar
@onready var btn_fugir              := $PainelTruco/VBox/HBoxBotoes/BtnFugir
# Slots circulares de carta na mesa
@onready var slot_jogador_carta     := $SlotJogador/CartaJogador
@onready var slot_parceiro_carta    := $SlotParceiro/CartaParceiro
@onready var slot_adv1_carta        := $SlotAdv1/CartaAdv1
@onready var slot_adv2_carta        := $SlotAdv2/CartaAdv2

var aguardando_jogador := false  # true quando é a vez do humano

# ── Visual: cria painel que simula uma carta física ────────────────
func _criar_painel_carta(texto: String, manilha: bool = false) -> PanelContainer:
	var painel := PanelContainer.new()
	painel.custom_minimum_size = Vector2(75, 100)

	var style := StyleBoxFlat.new()
	style.bg_color       = Color(1.0, 0.97, 0.86) if not manilha else Color(1.0, 0.93, 0.35)
	style.border_color   = Color(0.12, 0.12, 0.12)
	style.set_border_width_all(2)
	style.corner_radius_top_left     = 7
	style.corner_radius_top_right    = 7
	style.corner_radius_bottom_left  = 7
	style.corner_radius_bottom_right = 7
	style.content_margin_left   = 4
	style.content_margin_right  = 4
	style.content_margin_top    = 4
	style.content_margin_bottom = 4
	painel.add_theme_stylebox_override("panel", style)

	var lbl := Label.new()
	lbl.text = texto
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 24)
	lbl.add_theme_color_override("font_color", Color(0.08, 0.08, 0.08))
	lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	painel.add_child(lbl)
	return painel

func _ready() -> void:
	btn_truco.pressed.connect(_on_btn_truco)
	btn_aceitar.pressed.connect(_on_btn_aceitar)
	btn_fugir.pressed.connect(_on_btn_fugir)
	_iniciar_nova_mao()

# ── Nova mão ────────────────────────────────────────────────────
func _iniciar_nova_mao() -> void:
	if GerenciadorJogo.partida_encerrada:
		get_tree().change_scene_to_file("res://scenes/fim_de_jogo.tscn")
		return

	GerenciadorJogo.nova_mao()
	_atualizar_ui()
	_mostrar_mao_jogador()
	label_info.text = ""

	# Inicia o turno do primeiro jogador da mão
	_processar_turno()

# ── Fluxo de turnos ─────────────────────────────────────────────
func _processar_turno() -> void:
	# Verifica pedido de truco pendente
	if GerenciadorJogo.truco_pendente:
		_lidar_com_truco_pendente()
		return

	var idx := GerenciadorJogo.turno_atual

	if idx == 0:
		# Vez do jogador humano
		aguardando_jogador = true
		_habilitar_botoes_mao(true)
		# Verifica se pode pedir truco
		btn_truco.visible = GerenciadorJogo.pode_pedir_truco(0)
		label_info.text = "Sua vez — escolha uma carta"
	else:
		# Vez de uma IA
		aguardando_jogador = false
		_habilitar_botoes_mao(false)
		btn_truco.visible = false
		# Pequeno delay para simular "pensar"
		await get_tree().create_timer(0.7).timeout
		_turno_ia(idx)

func _turno_ia(idx: int) -> void:
	# IA decide se pede truco antes de jogar
	if IA.deve_pedir_truco(idx):
		GerenciadorJogo.pedir_truco(idx)
		_atualizar_ui()
		_lidar_com_truco_pendente()
		return

	var carta_idx := IA.escolher_carta(idx)
	_jogar_carta(idx, carta_idx)

# ── Jogar uma carta ─────────────────────────────────────────────
func _jogar_carta(jogador: int, carta_idx: int) -> void:
	var mao: Array = GerenciadorJogo.maos_jogadores[jogador]
	if carta_idx >= mao.size():
		return
	var carta = mao[carta_idx]
	GerenciadorJogo.cartas_jogadas[jogador] = carta
	mao.remove_at(carta_idx)

	if jogador == 0:
		_mostrar_mao_jogador()
	_atualizar_mesa()
	_atualizar_ui()

	# Verifica se todos jogaram na rodada
	if _todos_jogaram():
		await get_tree().create_timer(1.0).timeout
		_resolver_rodada()
	else:
		# Próximo turno
		GerenciadorJogo.turno_atual = (GerenciadorJogo.turno_atual + 1) % 4
		_processar_turno()

func _todos_jogaram() -> bool:
	for c in GerenciadorJogo.cartas_jogadas:
		if c.is_empty():
			return false
	return true

# ── Resolver rodada e mão ────────────────────────────────────────
func _resolver_rodada() -> void:
	var resultado := GerenciadorJogo.resolver_rodada()
	var dupla_nome: Dictionary = {"nos": "Nós", "eles": "Eles", "empate": "Empate"}
	label_info.text = "Rodada %d: %s!" % [GerenciadorJogo.rodada_atual + 1, str(dupla_nome.get(resultado, resultado))]

	# Limpa mesa
	GerenciadorJogo.cartas_jogadas = [{}, {}, {}, {}]
	GerenciadorJogo.rodada_atual += 1

	# Verifica vencedor da mão
	var venc: String = GerenciadorJogo.vencedor_da_mao()
	if venc != "" or GerenciadorJogo.rodada_atual >= 3:
		if venc == "":
			venc = "nos"  # desempate: quem ganhou a primeira
		await get_tree().create_timer(1.5).timeout
		GerenciadorJogo.aplicar_pontos(venc)
		_atualizar_ui()
		var nomes_dupla: Dictionary = {"nos": "Nós", "eles": "Eles"}
		label_info.text = "%s venceram a mão! (+%d pt)" % [
			str(nomes_dupla.get(venc, "?")), GerenciadorJogo.valor_aceito
		]
		await get_tree().create_timer(2.0).timeout
		_iniciar_nova_mao()
		return

	# Continua para próxima rodada
	_atualizar_mesa()
	_atualizar_ui()
	# Quem ganhou a rodada começa a próxima
	for i in range(4):
		if GerenciadorJogo.resultado_rodadas[GerenciadorJogo.rodada_atual - 1] != "empate":
			if GerenciadorJogo.dupla_do(i) == GerenciadorJogo.resultado_rodadas[GerenciadorJogo.rodada_atual - 1]:
				GerenciadorJogo.turno_atual = i
				break
	_processar_turno()

# ── Truco ────────────────────────────────────────────────────────
func _on_btn_truco() -> void:
	GerenciadorJogo.pedir_truco(0)
	_atualizar_ui()
	btn_truco.visible = false
	# IAs adversárias respondem
	_lidar_com_truco_pendente_adversario()

func _lidar_com_truco_pendente() -> void:
	var quem := GerenciadorJogo.quem_pediu_truco
	# Se foi o jogador humano ou parceiro, IAs adversárias respondem
	if quem == 0 or quem == 2:
		_lidar_com_truco_pendente_adversario()
	else:
		# IA adversária pediu: humano deve responder
		_mostrar_botoes_resposta_truco(true)
		label_truco_msg.text = "Adversário pediu %s!" % GerenciadorJogo.label_truco()
		label_info.text = "Aceitar ou Fugir?"

func _lidar_com_truco_pendente_adversario() -> void:
	# IA adversária decide se aceita
	var idx_resposta := 1  # IA adversária 1 responde
	if IA.deve_aceitar_truco(idx_resposta):
		GerenciadorJogo.aceitar_truco()
		label_info.text = "Truco aceito! Mão vale %d pts" % GerenciadorJogo.valor_aceito
		_mostrar_botoes_resposta_truco(false)
		_atualizar_ui()
		await get_tree().create_timer(1.0).timeout
		_processar_turno()
	else:
		GerenciadorJogo.fugir_truco(idx_resposta)
		_atualizar_ui()
		label_info.text = "Eles fugiram!"
		await get_tree().create_timer(1.5).timeout
		_iniciar_nova_mao()

func _on_btn_aceitar() -> void:
	GerenciadorJogo.aceitar_truco()
	label_info.text = "Truco aceito! Mão vale %d pts" % GerenciadorJogo.valor_aceito
	_mostrar_botoes_resposta_truco(false)
	_atualizar_ui()
	await get_tree().create_timer(0.8).timeout
	_processar_turno()

func _on_btn_fugir() -> void:
	GerenciadorJogo.fugir_truco(0)
	_mostrar_botoes_resposta_truco(false)
	_atualizar_ui()
	label_info.text = "Você fugiu do truco!"
	await get_tree().create_timer(1.5).timeout
	_iniciar_nova_mao()

func _mostrar_botoes_resposta_truco(mostrar: bool) -> void:
	painel_truco.visible = mostrar
	btn_truco.visible    = not mostrar
	_habilitar_botoes_mao(not mostrar)

# ── Atualizar UI ─────────────────────────────────────────────────
func _atualizar_ui() -> void:
	label_placar.text = "Nós: %d  |  Eles: %d  [%s]" % [
		GerenciadorJogo.pontos_nos, GerenciadorJogo.pontos_eles,
		GerenciadorJogo.label_truco()
	]
	if not Baralho.vira.is_empty() and Baralho.vira.get("valor", "?") != "?":
		label_vira.text = "Vira: %s   Manilha: %s" % [Baralho.carta_str(Baralho.vira), Baralho.valor_manilha]
	else:
		label_vira.text = "Vira: -"
	label_rodada.text = "Rodada: %d/3" % (GerenciadorJogo.rodada_atual + 1)

func _mostrar_mao_jogador() -> void:
	for child in container_mao.get_children():
		child.queue_free()

	var mao: Array = GerenciadorJogo.maos_jogadores[0]
	for i in range(mao.size()):
		var carta = mao[i]
		var eh_manilha: bool = Baralho.e_manilha(carta)
		var cor_normal: Color = Color(1.0, 0.97, 0.86) if not eh_manilha else Color(1.0, 0.93, 0.35)
		var cor_hover:  Color = Color(0.78, 1.0, 0.78) if not eh_manilha else Color(1.0, 1.0, 0.45)

		var btn := Button.new()
		btn.text = Baralho.carta_str(carta)
		btn.custom_minimum_size = Vector2(80, 108)
		btn.add_theme_font_size_override("font_size", 26)
		btn.add_theme_color_override("font_color", Color(0.08, 0.08, 0.08))

		for nome_style: String in ["normal", "hover", "pressed", "disabled"]:
			var s := StyleBoxFlat.new()
			match nome_style:
				"hover":
					s.bg_color     = cor_hover
					s.border_color = Color(0.10, 0.50, 0.10)
					s.set_border_width_all(3)
				"pressed":
					s.bg_color     = Color(0.70, 0.90, 0.70)
					s.border_color = Color(0.10, 0.40, 0.10)
					s.set_border_width_all(3)
				"disabled":
					s.bg_color     = Color(0.72, 0.72, 0.70)
					s.border_color = Color(0.40, 0.40, 0.40)
					s.set_border_width_all(1)
				_:
					s.bg_color     = cor_normal
					s.border_color = Color(0.12, 0.12, 0.12)
					s.set_border_width_all(2)
			s.corner_radius_top_left     = 7
			s.corner_radius_top_right    = 7
			s.corner_radius_bottom_left  = 7
			s.corner_radius_bottom_right = 7
			btn.add_theme_stylebox_override(nome_style, s)

		var idx_capturado := i
		btn.pressed.connect(func(): _on_carta_jogador(idx_capturado))
		container_mao.add_child(btn)

func _habilitar_botoes_mao(habilitar: bool) -> void:
	for child in container_mao.get_children():
		if child is Button:
			child.disabled = not habilitar

func _atualizar_mesa() -> void:
	# Mapeamento: índice jogador → slot na mesa
	# 0=Você (baixo), 1=Adv1 (esq), 2=Parceiro (cima), 3=Adv2 (dir)
	var slots: Array = [
		slot_jogador_carta,
		slot_adv1_carta,
		slot_parceiro_carta,
		slot_adv2_carta,
	]
	for i in range(4):
		var slot = slots[i]
		for child in slot.get_children():
			child.queue_free()
		var carta = GerenciadorJogo.cartas_jogadas[i]
		if not carta.is_empty():
			var painel := _criar_painel_carta(Baralho.carta_str(carta), Baralho.e_manilha(carta))
			slot.add_child(painel)

# ── Handler: jogador clica em uma carta ─────────────────────────
func _on_carta_jogador(idx: int) -> void:
	if not aguardando_jogador:
		return
	aguardando_jogador = false
	_habilitar_botoes_mao(false)
	btn_truco.visible = false
	_jogar_carta(0, idx)
