"""
Semeia monitor.db (SQLite) com logs de varios servicos para a tool
buscar_logs_historico do monitor-agent.

Uso:
  python seed_logs.py

Cria a tabela logs com as colunas:
  id, timestamp, service, level, level_priority, message

Os timestamps sao ancorados em datetime.now() no momento do seed,
espalhados em horas atras para que a janela_tempo_horas da query
devolva resultados consistentes independente de quando o aluno rodar.

level_priority: 3=ERROR, 2=WARN, 1=INFO, 0=DEBUG.
A query do contrato usa um CASE para comparar com :nivel_minimo.
"""

import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "monitor.db"

# (offset_horas, service, level, level_priority, message)
LINHAS_SEED = [
    (0.1, "checkout", "ERROR", 3, "timeout conectando a upstream-payments: 30s excedidos"),
    (0.2, "checkout", "ERROR", 3, "circuit breaker aberto para upstream-payments"),
    (0.4, "checkout", "WARN", 2, "retry rate elevado: acima do limiar configurado"),
    (1.0, "checkout", "WARN", 2, "pool de conexoes proximo do limite superior"),
    (2.0, "checkout", "INFO", 1, "deploy concluido: artefato v3.14.2 em producao"),
    (6.0, "checkout", "INFO", 1, "throughput normalizado apos janela de degradacao"),
    (8.0, "checkout", "WARN", 2, "spike de latencia detectado: investigacao aberta"),
    (24.0, "checkout", "INFO", 1, "consolidacao diaria de metricas concluida"),
    (0.3, "payments", "ERROR", 3, "connection refused ao primary db-payments"),
    (0.7, "payments", "WARN", 2, "latencia p99 acima do SLO definido"),
    (1.5, "payments", "INFO", 1, "failover para replica-2 executado"),
    (3.0, "payments", "INFO", 1, "backup diario concluido sem erros"),
    (12.0, "payments", "INFO", 1, "janela de manutencao programada iniciada"),
    (0.5, "catalog", "WARN", 2, "cache miss rate elevado na rota /produtos"),
    (1.2, "catalog", "INFO", 1, "reindex Elasticsearch iniciado"),
    (4.0, "catalog", "ERROR", 3, "timeout em query de listagem de produtos"),
    (18.0, "catalog", "INFO", 1, "sincronizacao incremental com upstream ok"),
    (0.6, "users", "WARN", 2, "rate limit atingido em /api/v1/login"),
    (2.5, "users", "INFO", 1, "cache warmup concluido apos deploy"),
    (5.0, "users", "ERROR", 3, "auth-service retornou HTTP 503 repetidamente"),
]


def semear(destino: Path = DB_PATH) -> int:
    # timestamps em UTC para bater com datetime('now') do SQLite,
    # que retorna UTC por padrao. Evita mismatch de timezone.
    agora = datetime.now(timezone.utc)
    conexao = sqlite3.connect(str(destino))
    cursor = conexao.cursor()
    cursor.execute("DROP TABLE IF EXISTS logs")
    cursor.execute(
        """
        CREATE TABLE logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            service TEXT NOT NULL,
            level TEXT NOT NULL,
            level_priority INTEGER NOT NULL,
            message TEXT NOT NULL
        )
        """
    )
    cursor.execute("CREATE INDEX idx_service_timestamp ON logs (service, timestamp DESC)")

    for offset_horas, service, level, priority, message in LINHAS_SEED:
        timestamp = (agora - timedelta(hours=offset_horas)).strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            "INSERT INTO logs (timestamp, service, level, level_priority, message)"
            " VALUES (?, ?, ?, ?, ?)",
            (timestamp, service, level, priority, message),
        )

    conexao.commit()
    conexao.close()
    return len(LINHAS_SEED)


if __name__ == "__main__":
    total = semear()
    print(f"[seed] {total} linhas inseridas em {DB_PATH}")
    print(f"[seed] exporte DB_CONNECTION_STRING=monitor.db no .env para usar o banco real")
