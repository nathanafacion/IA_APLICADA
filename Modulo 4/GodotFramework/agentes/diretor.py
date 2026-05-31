import json
import re

# LangChain é usado aqui para: JsonOutputParser + with_retry (auto-retry em JSON inválido)
# Fallback para llm_client.py caso langchain-openai não esteja instalado.
try:
    from langchain_core.output_parsers import JsonOutputParser
    from langchain_core.prompts import ChatPromptTemplate
    from utils.langchain_client import criar_llm
    _LANGCHAIN_DISPONIVEL = True
except ImportError:
    _LANGCHAIN_DISPONIVEL = False
    from utils.llm_client import chamar_llm

SYSTEM_PROMPT = """Você é um arquiteto de jogos especialista em Godot 4.
Sua tarefa é receber uma descrição de jogo em linguagem natural e traduzi-la em um JSON estruturado descrevendo a arquitetura completa do projeto.

Regras:
- Liste todas as cenas (.tscn) necessárias.
- Para cada cena, defina o nó raiz, seus filhos diretos e o script associado (se houver).
- Para cada script, escreva uma descrição precisa do comportamento esperado.
- Não escreva código GDScript. Apenas descreva o que cada script deve fazer.
- Retorne SOMENTE o JSON puro, sem blocos markdown, sem explicações.

Tipos de nó corretos para Godot 4 (use EXATAMENTE estes nomes):
- Personagem/inimigo que se move: CharacterBody2D  (NUNCA use KinematicBody2D)
- Sprite: Sprite2D  (NUNCA use Sprite)
- Colisão: CollisionShape2D
- Menu/HUD/Tela: Control
- Botão: Button
- Texto: Label
- Entrada de texto: LineEdit
- Container vertical: VBoxContainer
- Cena 2D geral: Node2D
- Script puro (sem visual): Node

O JSON deve seguir exatamente este formato:
{
  "nome_do_jogo": "snake_case_sem_espacos",
  "cenas": [
    {
      "nome": "nome_da_cena.tscn",
      "tipo_raiz": "TipoGodot4",
      "filhos": [
        {"nome": "NomeNo", "tipo": "TipoGodot4"}
      ],
      "script_associado": "nome_do_script.gd"
    }
  ],
  "scripts": [
    {
      "nome": "nome_do_script.gd",
      "descricao": "O que este script deve fazer."
    }
  ]
}"""


def _extrair_json_bruto(raw: str) -> dict:
    """Extrai JSON de uma string que pode conter prosa ou markdown."""
    raw = raw.strip()
    # Remove bloco markdown se presente
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        raw = raw.rsplit("```", 1)[0]
    # Tenta encontrar o objeto JSON dentro do texto
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)
    return json.loads(raw)


def _gerar_via_langchain(descricao_jogo: str) -> dict:
    """
    Usa LangChain: ChatPromptTemplate | LLM | JsonOutputParser
    com .with_retry(stop_after_attempt=3) para tolerar respostas malformadas.
    """
    llm = criar_llm(temperature=0.2)
    parser = JsonOutputParser()

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{descricao}"),
    ])

    chain = (prompt | llm | parser).with_retry(stop_after_attempt=3)
    return chain.invoke({"descricao": descricao_jogo})


def _gerar_via_llm_client(descricao_jogo: str) -> dict:
    """Fallback sem LangChain."""
    raw = chamar_llm(SYSTEM_PROMPT, descricao_jogo)
    return _extrair_json_bruto(raw)


def gerar_arquitetura(descricao_jogo: str) -> dict:
    """
    Recebe a descrição do jogo e retorna o dict de arquitetura.
    Usa LangChain (com retry automático) se disponível; caso contrário, fallback direto.
    """
    print("[Diretor] Gerando arquitetura do jogo...")

    if _LANGCHAIN_DISPONIVEL:
        print("[Diretor] Usando LangChain (JsonOutputParser + retry automático)...")
        try:
            arquitetura = _gerar_via_langchain(descricao_jogo)
        except Exception as e:
            print(f"[Diretor] LangChain falhou ({e}), tentando fallback direto...")
            arquitetura = _gerar_via_llm_client(descricao_jogo)
    else:
        arquitetura = _gerar_via_llm_client(descricao_jogo)

    print(
        f"[Diretor] Arquitetura gerada: "
        f"{len(arquitetura['cenas'])} cena(s), {len(arquitetura['scripts'])} script(s)."
    )
    return arquitetura
