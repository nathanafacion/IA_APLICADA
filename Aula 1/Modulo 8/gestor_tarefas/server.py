# server.py
from fastmcp import FastMCP
from typing import List
from datetime import datetime
import json
import os

# Inicializa o servidor MCP
mcp = FastMCP("GestorTarefas")

# Configuração do arquivo de persistência
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(SCRIPT_DIR, "tarefas.json")

def carregar_tarefas() -> List[dict]:
    """Carrega tarefas do arquivo JSON"""
    if not os.path.exists(DB_FILE):
        return []
    
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def salvar_tarefas(tarefas: List[dict]) -> None:
    """Salva tarefas no arquivo JSON"""
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(tarefas, f, ensure_ascii=False, indent=2)

# ============== FUNÇÕES DE NEGÓCIO (para uso interno e testes) ==============

def _adicionar_tarefa(titulo: str, descricao: str, prioridade: str = "média") -> str:
    """
    Adiciona uma nova tarefa ao sistema
    
    Args:
        titulo: Título da tarefa
        descricao: Descrição detalhada
        prioridade: alta, média ou baixa (padrão: média)
    """
    tarefas = carregar_tarefas()
    
    nova_tarefa = {
        "id": len(tarefas) + 1,
        "titulo": titulo,
        "descricao": descricao,
        "prioridade": prioridade.lower(),
        "status": "pendente",
        "criada_em": datetime.now().isoformat(),
        "concluida_em": None
    }
    
    tarefas.append(nova_tarefa)
    salvar_tarefas(tarefas)
    
    return f"✅ Tarefa #{nova_tarefa['id']} criada com sucesso: {titulo}"

def _concluir_tarefa(id_tarefa: int) -> str:
    """Marca uma tarefa como concluída"""
    tarefas = carregar_tarefas()
    
    for tarefa in tarefas:
        if tarefa["id"] == id_tarefa:
            tarefa["status"] = "concluída"
            tarefa["concluida_em"] = datetime.now().isoformat()
            salvar_tarefas(tarefas)
            return f"✅ Tarefa #{id_tarefa} marcada como concluída"
    
    return f"❌ Tarefa #{id_tarefa} não encontrada"

def _remover_tarefa(id_tarefa: int) -> str:
    """Remove uma tarefa do sistema"""
    tarefas = carregar_tarefas()
    tarefas_filtradas = [t for t in tarefas if t["id"] != id_tarefa]
    
    if len(tarefas) == len(tarefas_filtradas):
        return f"❌ Tarefa #{id_tarefa} não encontrada"
    
    salvar_tarefas(tarefas_filtradas)
    return f"✅ Tarefa #{id_tarefa} removida com sucesso"

def _buscar_por_prioridade(prioridade: str) -> str:
    """Busca tarefas por nível de prioridade"""
    tarefas = carregar_tarefas()
    filtradas = [t for t in tarefas if t["prioridade"].lower() == prioridade.lower()]
    
    if not filtradas:
        return f"📭 Nenhuma tarefa encontrada com prioridade '{prioridade}'"
    
    resultado = f"\n📋 Tarefas com prioridade '{prioridade}':\n\n"
    for t in filtradas:
        status_icon = "✅" if t["status"] == "concluída" else "⏳"
        resultado += f"{status_icon} #{t['id']} - {t['titulo']}\n"
        resultado += f"   {t['descricao']}\n\n"
    
    return resultado

def _listar_todas_tarefas() -> str:
    """Lista todas as tarefas cadastradas"""
    tarefas = carregar_tarefas()
    
    if not tarefas:
        return "📭 Nenhuma tarefa cadastrada no sistema."
    
    resultado = "📋 **TODAS AS TAREFAS**\n\n"
    
    for tarefa in tarefas:
        status_icon = "✅" if tarefa["status"] == "concluída" else "⏳"
        resultado += f"{status_icon} #{tarefa['id']} - {tarefa['titulo']}\n"
        resultado += f"   Descrição: {tarefa['descricao']}\n"
        resultado += f"   Prioridade: {tarefa['prioridade'].upper()}\n"
        resultado += f"   Status: {tarefa['status']}\n"
        resultado += f"   Criada em: {tarefa['criada_em']}\n"
        if tarefa['concluida_em']:
            resultado += f"   Concluída em: {tarefa['concluida_em']}\n"
        resultado += "\n"
    
    return resultado

def _estatisticas_tarefas() -> str:
    """Retorna estatísticas sobre as tarefas"""
    tarefas = carregar_tarefas()
    
    if not tarefas:
        return "📊 Nenhuma estatística disponível."
    
    total = len(tarefas)
    concluidas = len([t for t in tarefas if t["status"] == "concluída"])
    pendentes = len([t for t in tarefas if t["status"] == "pendente"])
    
    alta = len([t for t in tarefas if t["prioridade"] == "alta"])
    media = len([t for t in tarefas if t["prioridade"] == "média"])
    baixa = len([t for t in tarefas if t["prioridade"] == "baixa"])
    
    resultado = "📊 **ESTATÍSTICAS DO SISTEMA**\n\n"
    resultado += f"Total de tarefas: {total}\n"
    resultado += f"✅ Concluídas: {concluidas} ({(concluidas/total*100):.1f}%)\n"
    resultado += f"⏳ Pendentes: {pendentes}\n\n"
    resultado += f"🔴 Alta prioridade: {alta}\n"
    resultado += f"🟡 Média prioridade: {media}\n"
    resultado += f"🟢 Baixa prioridade: {baixa}\n"
    
    return resultado

def _criar_relatorio_semanal() -> str:
    """Gera um prompt para relatório semanal de tarefas"""
    return """Com base nas tarefas disponíveis, crie um relatório semanal executivo contendo:

1. Resumo de tarefas concluídas
2. Tarefas pendentes de alta prioridade
3. Principais conquistas da semana
4. Recomendações para a próxima semana

Formato: executivo, objetivo e acionável."""

def _sugerir_priorizacao() -> str:
    """Gera um prompt para sugestão de priorização"""
    return """Analise as tarefas pendentes e sugira uma ordem de execução baseada em:

1. Prioridade declarada
2. Complexidade (inferida da descrição)
3. Dependências potenciais
4. Impacto estimado

Forneça justificativa para cada recomendação."""

# ============== TOOLS (Ferramentas) ==============

@mcp.tool()
def adicionar_tarefa(titulo: str, descricao: str, prioridade: str = "média") -> str:
    """
    Adiciona uma nova tarefa ao sistema
    
    Args:
        titulo: Título da tarefa
        descricao: Descrição detalhada
        prioridade: alta, média ou baixa (padrão: média)
    """
    return _adicionar_tarefa(titulo, descricao, prioridade)

@mcp.tool()
def concluir_tarefa(id_tarefa: int) -> str:
    """Marca uma tarefa como concluída"""
    return _concluir_tarefa(id_tarefa)

@mcp.tool()
def remover_tarefa(id_tarefa: int) -> str:
    """Remove uma tarefa do sistema"""
    return _remover_tarefa(id_tarefa)

@mcp.tool()
def buscar_por_prioridade(prioridade: str) -> str:
    """Busca tarefas por nível de prioridade"""
    return _buscar_por_prioridade(prioridade)

@mcp.tool()
def listar_tarefas() -> str:
    """Lista todas as tarefas cadastradas no sistema"""
    return _listar_todas_tarefas()

# ============== RESOURCES (Recursos) ==============

@mcp.resource("memory://tarefas/todas")
def listar_todas_tarefas() -> str:
    """Lista todas as tarefas cadastradas"""
    return _listar_todas_tarefas()

@mcp.resource("memory://tarefas/estatisticas")
def estatisticas_tarefas() -> str:
    """Retorna estatísticas sobre as tarefas"""
    return _estatisticas_tarefas()

# ============== PROMPTS (Instruções) ==============

@mcp.prompt()
def criar_relatorio_semanal() -> str:
    """Gera um prompt para relatório semanal de tarefas"""
    return _criar_relatorio_semanal()

@mcp.prompt()
def sugerir_priorizacao() -> str:
    """Gera um prompt para sugestão de priorização"""
    return _sugerir_priorizacao()

# ============== INICIALIZAÇÃO ==============

if __name__ == "__main__":
    # Cria arquivo vazio se não existir
    if not os.path.exists(DB_FILE):
        salvar_tarefas([])
        print(f"Arquivo {DB_FILE} criado")
    
    print("Servidor MCP 'GestorTarefas' iniciado")
    mcp.run()
