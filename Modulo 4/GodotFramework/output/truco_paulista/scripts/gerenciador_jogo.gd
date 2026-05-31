## gerenciador_jogo.gd
## Singleton (Autoload): estado global da partida de Truco Paulista.
## Registrar no project.godot como: GerenciadorJogo="*res://scripts/gerenciador_jogo.gd"

extends Node

# ── Constantes ──────────────────────────────────────────────────
const PONTOS_VITORIA := 12

# Estados do pedido de truco
enum EstadoTruco {
	NORMAL,       # mão vale 1
	TRUCO,        # pedido de truco; se aceito, vale 3
	SEIS,         # pedido de aumento para 6
	NOVE,         # pedido de aumento para 9
	DOZE,         # pedido de aumento para 12
}

# Valor de pontos de cada estado aceito
const VALOR_TRUCO := {
	EstadoTruco.NORMAL: 1,
	EstadoTruco.TRUCO:  3,
	EstadoTruco.SEIS:   6,
	EstadoTruco.NOVE:   9,
	EstadoTruco.DOZE:  12,
}

# Próximo estado possível ao pedir aumento
const PROXIMO_TRUCO := {
	EstadoTruco.NORMAL: EstadoTruco.TRUCO,
	EstadoTruco.TRUCO:  EstadoTruco.SEIS,
	EstadoTruco.SEIS:   EstadoTruco.NOVE,
	EstadoTruco.NOVE:   EstadoTruco.DOZE,
}

# ── Estado da partida ────────────────────────────────────────────
var pontos_nos   := 0    # dupla 0: jogador humano (idx 0) + IA parceira (idx 2)
var pontos_eles  := 0    # dupla 1: IA adversária 1 (idx 1) + IA adversária 2 (idx 3)

# Jogadores: [humano=0, ia_adv1=1, ia_parceiro=2, ia_adv2=3]
# Duplas: 0+2 = "Nós", 1+3 = "Eles"
var maos_jogadores: Array = [[], [], [], []]  # cartas na mão de cada jogador
var cartas_jogadas: Array = [{}, {}, {}, {}]  # carta jogada por cada jogador na rodada atual

var rodada_atual  := 0   # 0,1,2
var turno_atual   := 0   # índice do jogador (0-3)
var primeiro_da_mao := 0 # quem abre a primeira rodada (roda entre as mãos)

# Resultado de cada rodada: "nos", "eles", "empate", ""
var resultado_rodadas: Array = ["", "", ""]

# Estado do truco nesta mão
var estado_truco := EstadoTruco.NORMAL
var truco_pendente := false    # true se alguém pediu e aguarda resposta
var quem_pediu_truco := -1    # índice do jogador que pediu
var valor_aceito   := 1       # pontos que serão atribuídos se a mão for concluída

var partida_encerrada := false

# ── Helpers ─────────────────────────────────────────────────────

func dupla_do(jogador: int) -> String:
	return "nos" if jogador in [0, 2] else "eles"

func indice_dupla(jogador: int) -> int:
	return 0 if jogador in [0, 2] else 1

## Inicia nova mão: embaralha, distribui, define vira
func nova_mao() -> void:
	estado_truco   = EstadoTruco.NORMAL
	truco_pendente = false
	quem_pediu_truco = -1
	valor_aceito   = 1
	rodada_atual   = 0
	resultado_rodadas = ["", "", ""]
	cartas_jogadas = [{}, {}, {}, {}]

	Baralho.embaralhar()
	Baralho.definir_vira()
	for i in range(4):
		maos_jogadores[i] = Baralho.distribuir(3)

	turno_atual = primeiro_da_mao

## Retorna "nos", "eles" ou "" (sem vencedor ainda)
func vencedor_da_mao() -> String:
	var v_nos := 0
	var v_eles := 0
	var primeira_dupla := ""
	for i in range(resultado_rodadas.size()):
		match resultado_rodadas[i]:
			"nos":
				v_nos += 1
				if primeira_dupla == "":
					primeira_dupla = "nos"
			"eles":
				v_eles += 1
				if primeira_dupla == "":
					primeira_dupla = "eles"
	if v_nos >= 2:
		return "nos"
	if v_eles >= 2:
		return "eles"
	# Empate em 1x1 + 1 empate: quem ganhou a primeira rodada
	if rodada_atual >= 3:
		return primeira_dupla if primeira_dupla != "" else "nos"
	return ""

## Resolve a rodada atual com as cartas em `cartas_jogadas`
## Retorna "nos", "eles" ou "empate"
func resolver_rodada() -> String:
	var melhor_forca := -1
	var vencedor := -1
	var empate := false

	for i in range(4):
		var carta = cartas_jogadas[i]
		if carta.is_empty():
			continue
		var f = Baralho.forca(carta)
		if f > melhor_forca:
			melhor_forca = f
			vencedor = i
			empate = false
		elif f == melhor_forca:
			# Se duplas diferentes empatam, é empate de rodada
			if dupla_do(vencedor) != dupla_do(i):
				empate = true

	if empate:
		resultado_rodadas[rodada_atual] = "empate"
		return "empate"

	var d := dupla_do(vencedor)
	resultado_rodadas[rodada_atual] = d
	return d

## Aplica pontos ao vencedor da mão
func aplicar_pontos(vencedor_dupla: String) -> void:
	if vencedor_dupla == "nos":
		pontos_nos += valor_aceito
	elif vencedor_dupla == "eles":
		pontos_eles += valor_aceito
	# Avança o mão (próximo a abrir a rodada)
	primeiro_da_mao = (primeiro_da_mao + 1) % 4
	# Verifica fim de partida
	if pontos_nos >= PONTOS_VITORIA or pontos_eles >= PONTOS_VITORIA:
		partida_encerrada = true

## Pede truco (ou aumento). Retorna false se já está no máximo.
func pedir_truco(jogador: int) -> bool:
	if estado_truco == EstadoTruco.DOZE:
		return false
	if truco_pendente:
		return false
	estado_truco = PROXIMO_TRUCO[estado_truco]
	truco_pendente = true
	quem_pediu_truco = jogador
	return true

## Aceita o truco pendente
func aceitar_truco() -> void:
	valor_aceito = VALOR_TRUCO[estado_truco]
	truco_pendente = false

## Foge do truco: adversário ganha os pontos do estado anterior
func fugir_truco(fugitivo: int) -> void:
	var prev_estado: int = EstadoTruco.NORMAL if estado_truco <= 0 else estado_truco - 1
	var pontos_fuga: int = int(VALOR_TRUCO.get(prev_estado, 1))
	if dupla_do(fugitivo) == "nos":
		pontos_eles += pontos_fuga
	else:
		pontos_nos += pontos_fuga
	truco_pendente = false
	if pontos_nos >= PONTOS_VITORIA or pontos_eles >= PONTOS_VITORIA:
		partida_encerrada = true

## Label do estado atual do truco
func label_truco() -> String:
	match estado_truco:
		EstadoTruco.NORMAL: return "Normal (1 pt)"
		EstadoTruco.TRUCO:  return "Truco (3 pts)"
		EstadoTruco.SEIS:   return "Seis (6 pts)"
		EstadoTruco.NOVE:   return "Nove (9 pts)"
		EstadoTruco.DOZE:   return "Doze (12 pts)"
	return "?"

func pode_pedir_truco(jogador: int) -> bool:
	# Só pode pedir se não há pedido pendente e não é o máximo
	# E o pedido deve vir de quem NÃO pediu o último
	if truco_pendente:
		return false
	if estado_truco == EstadoTruco.DOZE:
		return false
	# Adversário do último pedido pode aumentar
	return true

func resetar_partida() -> void:
	pontos_nos = 0
	pontos_eles = 0
	partida_encerrada = false
	primeiro_da_mao = 0
