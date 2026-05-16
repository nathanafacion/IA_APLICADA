## baralho.gd
## Singleton (Autoload): gerencia o baralho de 40 cartas do Truco Mineiro.
## Registrar no project.godot como: Baralho="*res://scripts/baralho.gd"
##
## Regra Truco Mineiro:
##   A manilha é a carta de valor imediatamente acima da vira na ordem:
##   4, 5, 6, 7, Q, J, K, A, 2, 3  (e volta para 4 após o 3)
##   Entre manilhas do mesmo valor, o naipe decide:
##   ♣(paus) > ♥(copas) > ♠(espadas) > ♦(ouros)
##   Cartas normais de mesmo valor emparam — naipe não importa.

extends Node

const VALORES := ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"]
const NAIPES  := ["o", "e", "c", "p"]  # ouros, espadas, copas, paus

# Ordem de força base — índice maior = carta mais forte
const ORDEM_BASE := ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"]

# Força do naipe entre manilhas: paus > copas > espadas > ouros
const NAIPE_FORCA: Dictionary = {"o": 1, "e": 2, "c": 3, "p": 4}

var _baralho: Array = []
var vira: Dictionary = {}
var valor_manilha: String = ""  # valor da manilha desta mão (calculado pela vira)

## Retorna o valor imediatamente acima de `v` na ordem do baralho
func _proximo_valor(v: String) -> String:
	var idx: int = ORDEM_BASE.find(v)
	if idx < 0:
		return "4"
	return ORDEM_BASE[(idx + 1) % ORDEM_BASE.size()]

## Retorna a força de uma carta (1–17).
## Manilhas têm força 14–17 (determinada pelo naipe).
## Cartas normais de mesmo valor têm mesma força (empate).
func forca(carta: Dictionary) -> int:
	if e_manilha(carta):
		return 13 + int(NAIPE_FORCA.get(carta.naipe, 1))  # 14,15,16,17
	return ORDEM_BASE.find(carta.valor) + 1  # 1–10

## Embaralha as 40 cartas
func embaralhar() -> void:
	_baralho = []
	for v in VALORES:
		for n in NAIPES:
			_baralho.append({"valor": v, "naipe": n})
	_baralho.shuffle()

## Distribui `qtd` cartas do topo do baralho
func distribuir(qtd: int) -> Array:
	var mao: Array = []
	for i in range(qtd):
		if _baralho.size() > 0:
			mao.append(_baralho.pop_back())
	return mao

## Vira a última carta do baralho e calcula o valor da manilha
func definir_vira() -> Dictionary:
	if _baralho.size() > 0:
		vira = _baralho.pop_back()
	else:
		vira = {"valor": "?", "naipe": "?"}
	valor_manilha = _proximo_valor(vira.valor)
	return vira

## Retorna string legível de uma carta, ex: "7♠"
func carta_str(carta: Dictionary) -> String:
	var naipe_str: Dictionary = {"o": "♦", "e": "♠", "c": "♥", "p": "♣"}
	return carta.valor + str(naipe_str.get(carta.naipe, "?"))

## Verifica se uma carta é manilha nesta mão
func e_manilha(carta: Dictionary) -> bool:
	return carta.valor == valor_manilha
