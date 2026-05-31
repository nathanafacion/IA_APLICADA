## ia.gd
## Singleton (Autoload): lógica de IA para jogadores computador.
## Registrar no project.godot como: IA="*res://scripts/ia.gd"

extends Node

## Decide qual carta o jogador `idx` deve jogar.
## Retorna o índice da carta na mão do jogador.
func escolher_carta(idx: int) -> int:
	var mao: Array = GerenciadorJogo.maos_jogadores[idx]
	if mao.is_empty():
		return 0

	var dupla := GerenciadorJogo.dupla_do(idx)
	var rodada := GerenciadorJogo.rodada_atual
	var resultado_ate_agora := GerenciadorJogo.resultado_rodadas

	# Calcula quantas rodadas cada dupla ganhou até agora
	var v_nos := 0
	var v_eles := 0
	for r in resultado_ate_agora:
		if r == "nos": v_nos += 1
		if r == "eles": v_eles += 1

	var precisa_ganhar := false
	var pode_descartar := false

	if dupla == "nos":
		precisa_ganhar = v_nos < v_eles  # atrás no placar da mão
		pode_descartar = v_nos > v_eles  # já venceu mais rodadas
	else:
		precisa_ganhar = v_eles < v_nos
		pode_descartar = v_eles > v_nos

	# Ordena cartas por força
	var indices_por_forca: Array = range(mao.size())
	indices_por_forca.sort_custom(func(a, b):
		return Baralho.forca(mao[a]) < Baralho.forca(mao[b])
	)

	# Verifica se há carta jogada na mesa nesta rodada para "cobrir"
	var maior_na_mesa := _maior_adversario_na_mesa(idx)

	if maior_na_mesa >= 0:
		# Tentar cobrir com a menor carta possível que ganha
		for i in indices_por_forca:
			if Baralho.forca(mao[i]) > maior_na_mesa:
				return i
		# Não consegue ganhar: joga a mais fraca
		return indices_por_forca[0]

	if pode_descartar:
		# Já ganhou mais rodadas: descarta a mais fraca para guardar manilhas
		return indices_por_forca[0]

	if precisa_ganhar:
		# Precisa ganhar: joga a carta mais forte
		return indices_por_forca[indices_por_forca.size() - 1]

	# Rodada 1 sem contexto: joga carta intermediária
	var meio := indices_por_forca.size() / 2
	return indices_por_forca[meio]

## Retorna a maior força jogada por adversário na rodada atual, ou -1
func _maior_adversario_na_mesa(idx: int) -> int:
	var dupla := GerenciadorJogo.dupla_do(idx)
	var maior := -1
	for i in range(4):
		if i == idx:
			continue
		var carta = GerenciadorJogo.cartas_jogadas[i]
		if carta.is_empty():
			continue
		if GerenciadorJogo.dupla_do(i) != dupla:
			var f = Baralho.forca(carta)
			if f > maior:
				maior = f
	return maior

## Decide se a IA deve pedir truco.
## Critério mais conservador: só pede na primeira rodada E com mão muito forte.
## Somente adversários (idx 1 e 3) pedem — parceiro (idx 2) não pede truco.
func deve_pedir_truco(idx: int) -> bool:
	# Parceiro nunca pede truco (evita sobrecarga)
	if idx == 2:
		return false
	if not GerenciadorJogo.pode_pedir_truco(idx):
		return false
	# Só pede truco na primeira rodada da mão
	if GerenciadorJogo.rodada_atual > 0:
		return false
	var mao: Array = GerenciadorJogo.maos_jogadores[idx]
	var manilhas := 0
	var fortes := 0
	for carta in mao:
		if Baralho.e_manilha(carta):
			manilhas += 1
		elif Baralho.forca(carta) >= 8:
			fortes += 1
	# Exige mão realmente boa: 2 manilhas, ou 1 manilha + 1 forte, ou 3 fortes
	return manilhas >= 2 or (manilhas >= 1 and fortes >= 1) or fortes >= 3

## Decide se a IA deve aceitar truco.
## Aceita se tiver pelo menos 1 carta com força >= 7.
func deve_aceitar_truco(idx: int) -> bool:
	var mao: Array = GerenciadorJogo.maos_jogadores[idx]
	for carta in mao:
		if Baralho.forca(carta) >= 7:
			return true
	return false
