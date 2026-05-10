"""
MCP Server — expoe tools de monitoramento via Model Context Protocol.

Este servidor e um processo separado que roda independente do agente.
Qualquer agente (nosso framework, LangChain, Claude Code, etc.) pode conectar.

Uso:
  python mcp/server.py

O servidor expoe 2 tools via protocolo MCP (stdio transport):
  - buscar_issues: busca issues abertas num repositorio
  - verificar_ci_status: verifica status do CI/CD de um servico

Requisitos:
  pip install mcp

Nota: Este servidor usa dados simulados para fins didaticos.
      Em producao, conectaria ao GitHub API, Jenkins, etc.
"""

import json
from datetime import datetime, timedelta

try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import Tool, TextContent
    _MCP_DISPONIVEL = True
except ImportError:
    _MCP_DISPONIVEL = False


def _buscar_issues(repositorio: str, estado: str = "open", labels: list = None) -> dict:
    """Simula busca de issues no repositorio."""
    agora = datetime.now()
    issues = [
        {
            "numero": 142,
            "titulo": f"Latencia elevada apos deploy v2.4.1",
            "estado": "open",
            "labels": ["bug", "p1", "producao"],
            "autor": "eng-oncall",
            "criado_em": (agora - timedelta(hours=2)).isoformat(),
            "repositorio": repositorio,
        },
        {
            "numero": 138,
            "titulo": f"Circuit breaker ativando para upstream-payments",
            "estado": "open",
            "labels": ["bug", "p2"],
            "autor": "monitoring-bot",
            "criado_em": (agora - timedelta(hours=5)).isoformat(),
            "repositorio": repositorio,
        },
        {
            "numero": 135,
            "titulo": f"Aumentar pool de conexoes do checkout",
            "estado": "open",
            "labels": ["enhancement", "infra"],
            "autor": "tech-lead",
            "criado_em": (agora - timedelta(days=2)).isoformat(),
            "repositorio": repositorio,
        },
    ]

    if labels:
        issues = [i for i in issues if any(l in i["labels"] for l in labels)]
    if estado:
        issues = [i for i in issues if i["estado"] == estado]

    return {"issues": issues, "contagem_total": len(issues)}


def _verificar_ci_status(servico: str) -> dict:
    """Simula verificacao de status do CI/CD."""
    return {
        "servico": servico,
        "pipeline": "main",
        "ultimo_build": {
            "status": "sucesso",
            "versao": "v2.4.1",
            "data": (datetime.now() - timedelta(hours=1)).isoformat(),
            "duracao_segundos": 247,
        },
        "ultimo_deploy": {
            "status": "sucesso",
            "ambiente": "producao",
            "data": (datetime.now() - timedelta(minutes=45)).isoformat(),
        },
        "testes": {
            "total": 342,
            "passaram": 340,
            "falharam": 2,
            "cobertura_pct": 87.3,
        },
    }


def criar_servidor_mcp():
    """Cria e configura o MCP server com as tools disponiveis."""
    if not _MCP_DISPONIVEL:
        raise ImportError(
            "Pacote 'mcp' nao instalado. Instale com: pip install mcp\n"
            "Documentacao: https://modelcontextprotocol.io"
        )

    server = Server("monitor-mcp-server")

    @server.list_tools()
    async def listar_tools():
        return [
            Tool(
                name="buscar_issues",
                description="Busca issues abertas no repositorio. Util para correlacionar incidentes com issues conhecidas.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "repositorio": {"type": "string", "description": "Nome do repositorio (ex: org/checkout-service)"},
                        "estado": {"type": "string", "description": "Estado das issues: open, closed, all", "default": "open"},
                        "labels": {"type": "array", "items": {"type": "string"}, "description": "Labels para filtrar"},
                    },
                    "required": ["repositorio"],
                },
            ),
            Tool(
                name="verificar_ci_status",
                description="Verifica status do CI/CD de um servico. Mostra ultimo build, deploy e resultados de testes.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "servico": {"type": "string", "description": "Nome do servico"},
                    },
                    "required": ["servico"],
                },
            ),
        ]

    @server.call_tool()
    async def chamar_tool(name: str, arguments: dict):
        if name == "buscar_issues":
            resultado = _buscar_issues(
                repositorio=arguments.get("repositorio", ""),
                estado=arguments.get("estado", "open"),
                labels=arguments.get("labels"),
            )
        elif name == "verificar_ci_status":
            resultado = _verificar_ci_status(
                servico=arguments.get("servico", ""),
            )
        else:
            resultado = {"erro": f"tool '{name}' nao encontrada"}

        return [TextContent(type="text", text=json.dumps(resultado, ensure_ascii=False, indent=2))]

    return server


# --- Modo standalone (stdio transport) ---
if __name__ == "__main__":
    if not _MCP_DISPONIVEL:
        print("ERRO: pacote 'mcp' nao instalado.")
        print("Instale com: pip install mcp")
        print("Documentacao: https://modelcontextprotocol.io")
        exit(1)

    import asyncio

    async def main():
        server = criar_servidor_mcp()
        async with stdio_server() as (read_stream, write_stream):
            await server.run(read_stream, write_stream, server.create_initialization_options())

    print("MCP Server iniciado (stdio transport)")
    print("Tools disponiveis: buscar_issues, verificar_ci_status")
    asyncio.run(main())
