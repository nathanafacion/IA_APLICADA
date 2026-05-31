"""
Database Adapter — conecta skills a bancos de dados via query parametrizada.

O adapter le do contrato:
  - tipo_banco, query_template, modo (read_only), timeout_segundos

O adapter le do ambiente (.env):
  - DB_CONNECTION_STRING (connection string do banco)

Seguranca:
  - Queries SEMPRE parametrizadas (NUNCA string format / concatenacao)
  - Modo read_only: rejeita queries com INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE
  - LIMIT obrigatorio: vem do contrato (limites.max_resultados)
  - Connection string NUNCA no .md, so no .env
  - Logging: registra query executada SEM dados sensiveis
"""

import json
import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv

# .env fica na raiz do gabarito (mesmo diretorio de seed_logs.py e api_local/).
# override=True porque runtime/.env pode ter DB_CONNECTION_STRING vazia de cursos
# anteriores — o .env da raiz (especifico da aula 11) precisa vencer.
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env", override=True)

_TOKENS_ZERO = {"prompt": 0, "completion": 0, "total": 0}

# Palavras-chave proibidas em modo read_only
_OPERACOES_ESCRITA = {"INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE"}


def _validar_read_only(query: str) -> list:
    """Valida se a query e somente leitura. Retorna lista de violacoes."""
    violacoes = []
    query_upper = query.upper().strip()
    for op in _OPERACOES_ESCRITA:
        if re.search(rf'\b{op}\b', query_upper):
            violacoes.append(f"operacao '{op}' proibida em modo read_only")
    return violacoes


def _substituir_parametros(query_template: str, argumentos: dict) -> tuple:
    """Substitui parametros nomeados (:nome) por placeholders seguros.

    Retorna (query_com_placeholders, lista_de_valores) para execucao parametrizada.
    NAO usa string format — usa placeholders numerados para evitar SQL injection.
    """
    params_encontrados = re.findall(r':(\w+)', query_template)
    valores = []
    query_segura = query_template

    for i, param in enumerate(params_encontrados, 1):
        valor = argumentos.get(param)
        if valor is None:
            valor = str(argumentos.get(param, ""))
        valores.append(valor)
        # substituir :param por placeholder $N (ou ? dependendo do driver)
        query_segura = query_segura.replace(f":{param}", f"${i}", 1)

    return query_segura, valores


def criar_funcao_database(habilidade: dict):
    """Cria funcao que executa query parametrizada em banco de dados.

    Le query_template, modo e timeout do bloco 'conexao'.
    Retorna resultado no formato padrao do harness.
    """
    nome = habilidade.get("nome", "")
    conexao = habilidade.get("conexao", {})
    campos_saida = habilidade.get("saida", {})
    limites = habilidade.get("limites", {})

    query_template = conexao.get("query_template", "")
    tipo_banco = conexao.get("tipo_banco", "postgresql")
    modo = conexao.get("modo", "read_only")
    timeout = conexao.get("timeout_segundos", 5)
    max_resultados = limites.get("max_resultados", 100)

    def funcao(argumentos):
        # 1. Validar modo read_only
        if modo == "read_only":
            violacoes = _validar_read_only(query_template)
            if violacoes:
                return {
                    "sucesso": False,
                    "erro": f"violacao de read_only: {'; '.join(violacoes)}",
                    "_adapter": "database",
                    "_tokens": _TOKENS_ZERO.copy(),
                }

        # 2. Preparar query parametrizada (NUNCA string format)
        query_segura, valores = _substituir_parametros(query_template, argumentos or {})

        # 3. Verificar connection string
        conn_string = os.environ.get("DB_CONNECTION_STRING", "")

        if not conn_string:
            # Sem banco configurado: simular execucao com dados didaticos
            # Em producao, isso seria um erro. Aqui e para o aluno ver o fluxo.
            inicio = time.time()
            dados_simulados = _simular_query(nome, argumentos, campos_saida, max_resultados)
            latencia_ms = round((time.time() - inicio) * 1000, 1)

            return {
                "sucesso": True,
                "dados": dados_simulados,
                "_adapter": "database",
                "_modo": modo,
                "_query_segura": query_segura,
                "_parametros_count": len(valores),
                "_simulado": True,
                "_latencia_ms": latencia_ms,
                "_tokens": _TOKENS_ZERO.copy(),
            }

        # 4. Executar query real (com driver do banco)
        try:
            inicio = time.time()
            resultados = _executar_query_real(
                conn_string, tipo_banco, query_segura, valores, timeout, max_resultados
            )
            latencia_ms = round((time.time() - inicio) * 1000, 1)

            # parsear para formato de saida
            dados = _parsear_resultados(resultados, campos_saida)
            dados["_entrada"] = argumentos

            return {
                "sucesso": True,
                "dados": dados,
                "_adapter": "database",
                "_modo": modo,
                "_query_segura": query_segura,
                "_simulado": False,
                "_latencia_ms": latencia_ms,
                "_tokens": _TOKENS_ZERO.copy(),
            }
        except Exception as e:
            return {
                "sucesso": False,
                "erro": f"erro no banco: {e}",
                "_adapter": "database",
                "_tokens": _TOKENS_ZERO.copy(),
            }

    return funcao


def _simular_query(nome: str, argumentos: dict, campos_saida: dict, max_resultados: int) -> dict:
    """Simula resultado de query quando nao ha banco configurado.

    Retorna dados didaticos realistas para o aluno ver o fluxo completo.
    """
    servico = "desconhecido"
    for v in (argumentos or {}).values():
        if isinstance(v, str) and len(v) > 2:
            servico = v
            break

    if "eventos" in campos_saida or "logs" in campos_saida:
        return {
            "eventos": [
                {"timestamp": "2024-01-15T10:32:00Z", "nivel": "ERROR", "mensagem": f"connection timeout em {servico}", "servico": servico},
                {"timestamp": "2024-01-15T10:28:00Z", "nivel": "WARN", "mensagem": f"pool de conexoes esgotado em {servico}", "servico": servico},
                {"timestamp": "2024-01-15T10:25:00Z", "nivel": "ERROR", "mensagem": f"query lenta detectada em {servico}: 4500ms", "servico": servico},
            ][:max_resultados],
            "contagem_total": min(3, max_resultados),
            "_entrada": argumentos,
        }

    # fallback generico
    dados = {}
    for campo, tipo in campos_saida.items():
        if tipo == "list":
            dados[campo] = [{"item": f"resultado_db_{i}"} for i in range(1, min(4, max_resultados + 1))]
        elif tipo == "int":
            dados[campo] = min(3, max_resultados)
        else:
            dados[campo] = f"{campo}_do_banco"
    dados["_entrada"] = argumentos
    return dados


def _executar_query_real(conn_string: str, tipo_banco: str, query: str, valores: list, timeout: int, max_resultados: int) -> list:
    """Executa query real no banco de dados.

    Suporta PostgreSQL (psycopg2) e SQLite (sqlite3).
    Outros bancos podem ser adicionados.
    """
    if tipo_banco == "sqlite":
        import sqlite3
        # path relativo e resolvido a partir da raiz do gabarito (onde fica o .env),
        # para que o aluno nao dependa do cwd ao rodar o agente
        db_path = Path(conn_string)
        if not db_path.is_absolute():
            db_path = Path(__file__).resolve().parent.parent.parent / conn_string
        # converter placeholders $N para ? (sqlite)
        query_sqlite = re.sub(r'\$\d+', '?', query)
        conn = sqlite3.connect(str(db_path))
        conn.execute(f"PRAGMA busy_timeout = {timeout * 1000}")
        cursor = conn.execute(query_sqlite, valores)
        colunas = [desc[0] for desc in cursor.description] if cursor.description else []
        resultados = [dict(zip(colunas, row)) for row in cursor.fetchmany(max_resultados)]
        conn.close()
        return resultados

    if tipo_banco == "postgresql":
        try:
            import psycopg2
            conn = psycopg2.connect(conn_string, connect_timeout=timeout)
            cursor = conn.cursor()
            cursor.execute(query, valores)
            colunas = [desc[0] for desc in cursor.description] if cursor.description else []
            resultados = [dict(zip(colunas, row)) for row in cursor.fetchmany(max_resultados)]
            cursor.close()
            conn.close()
            return resultados
        except ImportError:
            raise RuntimeError("psycopg2 nao instalado. Instale com: pip install psycopg2-binary")

    raise RuntimeError(f"tipo_banco '{tipo_banco}' nao suportado. Use 'postgresql' ou 'sqlite'.")


def _parsear_resultados(resultados: list, campos_saida: dict) -> dict:
    """Converte lista de rows do banco pro formato de saida do contrato."""
    dados = {}
    for campo, tipo in campos_saida.items():
        if tipo == "list":
            dados[campo] = resultados
        elif tipo == "int":
            dados[campo] = len(resultados)
        else:
            dados[campo] = str(resultados[0].get(campo, "")) if resultados else ""
    return dados 
