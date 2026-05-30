import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langfuse.langchain import CallbackHandler
from mem0 import MemoryClient
from langgraph.graph import StateGraph, START, END
from state import AgentState

# Garante que o .env seja encontrado independente do diretório de execução
load_dotenv(Path(__file__).parent / ".env")

# ─── Inicialização dos serviços ────────────────────────────────────────────────
# Langfuse v4 lê LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY e LANGFUSE_HOST do .env automaticamente
langfuse_handler = CallbackHandler()

memory = MemoryClient(api_key=os.getenv("MEM0_API_KEY"))

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    api_key=os.getenv("GROQ_API_KEY"),
)

SYSTEM_PROMPT = """Você é um Tech Lead especialista em engenharia de software e gestão ágil.
Você aprende com cada sprint relatada e usa esse conhecimento acumulado para:
- Identificar padrões de sucesso e falhas nas sprints anteriores
- Planejar e sugerir melhorias para as próximas sprints
- Recomendar boas práticas de desenvolvimento, arquitetura e liderança técnica
- Ajudar na estimativa de tarefas, decomposição de histórias e gestão de dívida técnica

Quando receber informações de uma sprint (velocidade, impedimentos, entregas, etc.),
registre o aprendizado e use-o para gerar recomendações cada vez mais precisas.

Responda sempre em português, de forma clara e objetiva.
"""

# ─── Nó principal do agente ───────────────────────────────────────────────────
def tech_lead_node(state: AgentState) -> dict:
    user_id = state["user_id"]
    ultima_mensagem = state["messages"][-1].content

    # Busca memórias relevantes do histórico de sprints
    try:
        memorias = memory.search(query=ultima_mensagem, user_id=user_id, limit=5)
        contexto_memorias = "\n".join(
            [f"- {m['memory']}" for m in memorias.get("results", [])]
        )
    except Exception:
        contexto_memorias = ""

    # Monta o prompt com contexto histórico
    system_com_contexto = SYSTEM_PROMPT
    if contexto_memorias:
        system_com_contexto += f"\n\n## Histórico de sprints anteriores deste time:\n{contexto_memorias}"

    if state.get("sprint_context"):
        system_com_contexto += f"\n\n## Contexto adicional fornecido:\n{state['sprint_context']}"

    # Chama o LLM
    resposta = llm.invoke(
        [SystemMessage(content=system_com_contexto)] + state["messages"]
    )

    # Salva a interação na memória de longo prazo
    try:
        memory.add(
            [
                {"role": "user", "content": ultima_mensagem},
                {"role": "assistant", "content": resposta.content},
            ],
            user_id=user_id,
        )
    except Exception:
        pass

    return {"messages": [resposta]}


# ─── Construção do grafo LangGraph ────────────────────────────────────────────
def build_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("tech_lead", tech_lead_node)
    workflow.add_edge(START, "tech_lead")
    workflow.add_edge("tech_lead", END)
    return workflow.compile()


graph = build_graph()


def run_agent(user_id: str, mensagem: str, sprint_context: str = "") -> str:
    """Executa o agente e retorna a resposta como string."""
    config = {"callbacks": [langfuse_handler]}
    resultado = graph.invoke(
        {
            "messages": [HumanMessage(content=mensagem)],
            "user_id": user_id,
            "sprint_context": sprint_context,
        },
        config=config,
    )
    return resultado["messages"][-1].content
