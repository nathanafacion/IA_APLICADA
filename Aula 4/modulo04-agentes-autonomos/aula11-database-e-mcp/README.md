# Aula 11 — Database, segurança e MCP

> A aula 10 saiu do mock para REST. Esta aula adiciona banco de dados, MCP e as travas de segurança que tornam tudo isso operável em produção.

A aula 10 entregou o resolver e um adapter REST. O slot para `database` e `mcp` já existia, mas estava vazio. Esta aula preenche os dois e adiciona a camada de **segurança no contrato**: rate limit global, políticas declarativas, hooks que fiscalizam em runtime e — no `db_adapter.py` — três regras concretas (read-only, parametrização, LIMIT). O `monitor-agent` termina a aula com 6 ferramentas e **4 tipos de adapter rodando ao mesmo tempo**.

> O contrato declara o que é seguro. O adapter recusa o que não é. O hook avisa quando algo passou perto. Defesa em três camadas, todas auditáveis no `trace.json`.

---

## O que tem de novo nesta aula

```
aula11/
├── monitor-agent/
│   ├── skills.md            ← +buscar_logs_historico (database), +buscar_issues (mcp)
│   ├── rules.md             ← +rate_limit_global, +políticas de segurança
│   └── hooks.md             ← antes_da_acao/apos_acao/em_erro com lista de ações
├── api_local/               ← inalterado (vem da aula 10)
├── runtime/
│   └── adapters/
│       ├── rest_adapter.py  ← inalterado
│       ├── db_adapter.py    ← NOVO — 3 regras de segurança
│       └── mcp_adapter.py   ← NOVO — SDK oficial MCP via stdio
├── mcp/                     ← NOVO
│   ├── server.py            ← MCP server com 2 tools (buscar_issues, verificar_ci_status)
│   └── config.json          ← formato padrão MCP (compatível com Claude Code/Cursor)
├── monitor.db               ← NOVO — SQLite local, gerado pelo seed
├── seed_logs.py             ← NOVO — popula tabela logs com 20 linhas
└── architectures/, runtime/, trace-analyzer/, backlog-decomposer/  ← inalterados
```

---

## Tools por tipo — antes e depois

| Tool | Antes (aula 10) | Depois (aula 11) |
|------|-----------------|------------------|
| `consultar_metricas` | rest | rest |
| `buscar_logs` | rest | rest |
| `historico_deploys` | rest | rest |
| `buscar_logs_historico` | — | **database** (NOVO) |
| `buscar_issues` | — | **mcp** (NOVO) |
| `relatorio_incidente` | mock | mock |

> 6 tools. 4 adapters. Mesmo agente.

---

## Database — o `db_adapter.py` em 5 passos

A função `criar_funcao_database(habilidade)` faz, em ordem:

| # | Passo | Como |
|---|-------|------|
| 1 | **Validar read_only** | regex com word boundary (`\b`) contra `_OPERACOES_ESCRITA = {INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE}`; se encontrar, **bloqueia antes de tocar no banco** |
| 2 | **Parametrizar query** | converte `:nome_servico` → `$1`, `:janela_tempo_horas` → `$2`; valores vão separados, nada de f-string |
| 3 | **Executar com timeout** | timeout vem do contrato (`timeout_segundos: 5`); conexão lida do `.env` (`DB_CONNECTION_STRING`) |
| 4 | **Aplicar LIMIT** | LIMIT vem do contrato (`limites.max_resultados: 100`); aplica mesmo se a query já tiver |
| 5 | **Retornar** | `{"sucesso", "dados", "_adapter": "database", "_simulado": false}` |

> Sem `.env`, o adapter cai em **simulação didática** (`_simulado: true` no trace). É graceful degradation defensivo — quando a infra some, o agente continua rodando, e você sabe disso pelo trace.

### O contrato da skill `buscar_logs_historico`

```yaml
- nome: buscar_logs_historico
  descricao: busca logs historicos do servico no banco de dados
  tipo_implementacao: database
  entrada:
    nome_servico: string
    janela_tempo_horas: int
    nivel_minimo: string
  saida:
    eventos: list
    contagem_total: int
  conexao:
    tipo_banco: sqlite
    query_template: >
      SELECT timestamp, level, service, message
      FROM logs
      WHERE service = :nome_servico
        AND timestamp > datetime('now', '-' || :janela_tempo_horas || ' hours')
        AND level_priority >= CASE :nivel_minimo
              WHEN 'ERROR' THEN 3
              WHEN 'WARN' THEN 2
              WHEN 'INFO' THEN 1
              ELSE 0
            END
      ORDER BY timestamp DESC
      LIMIT 100
    modo: read_only
    timeout_segundos: 5
  limites:
    chamadas_por_minuto: 10
    max_resultados: 100
```

> Connection string mora no `.env`, **nunca no `.md`**. `tipo_banco: sqlite` mantém o curso portátil (stdlib do Python, sem Docker). Trocar por Postgres muda só o dialeto SQL e a `DB_CONNECTION_STRING` — o contrato da tool permanece.

### O `seed_logs.py` e o `monitor.db`

```bash
python seed_logs.py
```

O script dropa e recria a tabela `logs` com colunas `id`, `timestamp`, `service`, `level`, `level_priority`, `message`, e insere 20 linhas com timestamps ancorados em `datetime.now()` — então `janela_tempo_horas` continua trazendo dados consistentes independente de quando você rodar. Rodar o seed de novo é seguro. **`monitor.db` está no `.gitignore`** — é dado local, não vai pro repo.

---

## MCP — o servidor stdio e o `mcp_adapter.py`

`mcp/server.py` expõe 2 tools de monitoramento via transport `stdio`:

| Tool | Input | Retorno |
|------|-------|---------|
| `buscar_issues` | `repositorio`, `estado`, `labels` | lista de issues com número, título, estado, labels, autor |
| `verificar_ci_status` | `repositorio`, `branch` | último build, deploy e testes |

`mcp/config.json` segue o formato padrão MCP (mesmo do Claude Code e Cursor):

```json
{
  "mcpServers": {
    "monitor-mcp": {
      "command": "python",
      "args": ["mcp/server.py"],
      "transport": "stdio",
      "description": "MCP server para tools de monitoramento (issues, CI/CD)"
    }
  }
}
```

### O adapter

`runtime/adapters/mcp_adapter.py` usa o **SDK oficial** (`mcp` no PyPI), não subprocess+JSON-RPC na mão. A função `criar_funcao_mcp`:

1. Lê `mcp_server` e `tool_name` do bloco `conexao`.
2. Carrega a config de `mcp/config.json`.
3. Abre sessão MCP via `stdio_client + ClientSession`, faz **handshake `initialize` + `initialized`** antes de chamar a tool.
4. Se o SDK não está instalado ou a conexão falha, cai em simulação (`_via_mcp_real: false`).
5. Retorna `{"_adapter": "mcp", "_via_mcp_real": true|false, ...}`.

> Por que handshake? O protocolo MCP exige que o cliente mande `initialize` e receba a resposta antes de `tools/call`. Mandar `tools/call` direto (como POST REST) não funciona — o server ignora até o handshake acontecer. Sem handshake, `_via_mcp_real` viria sempre `false`.

Para validar o fluxo real:

```bash
pip install -r runtime/requirements.txt   # inclui o pacote 'mcp'
```

---

## Segurança no contrato — `rules.md` e `hooks.md`

### `rules.md` — políticas declaradas, fiscalizadas em runtime

```yaml
rate_limit_global:
  chamadas_por_minuto: 60
  custo_maximo_centavos: 50

políticas:
  - tools com tipo_implementacao database devem usar modo read_only
  - tools com tipo_implementacao rest devem ter timeout máximo de 30 segundos
  - nunca logar conteúdo de headers de autenticação
  - se uma tool real falhar 2 vezes seguidas, usar fallback mock e marcar no trace
  - secrets só podem vir de variáveis de ambiente (.env)
```

### `hooks.md` — listas de ações por gancho

| Gancho | Ações |
|--------|-------|
| `antes_da_acao` | `log`, `validar_rate_limit`, `verificar_budget` |
| `apos_acao` | `log`, `registrar_latencia`, `registrar_custo` |
| `em_erro` | `alerta`, `verificar_fallback_mock` |

> Hook deixou de ser uma string só (`log`) e virou lista. O runtime executa os ganchos em ordem — primeiro o log, depois o rate limiter, depois o verificador de budget. Se um deles bloqueia, a ação não acontece.

---

## Como testar a segurança

### read_only do `db_adapter.py`

Edite `monitor-agent/skills.md` na skill `buscar_logs_historico`:

1. Mude `modo: read_only` → `modo: write`.
2. Adicione um `INSERT` no `query_template`.
3. Rode `python runtime/main.py rodar --agente monitor-agent --entrada "teste"`.

O adapter **bloqueia antes de tocar no banco**, listando as violações. Volte o `modo` para `read_only` e remova o `INSERT`.

> Se bloqueou: segurança funciona. Se não bloqueou: tem bug, corrija antes de continuar.

### Fallback simulado do banco

Renomeie o `.env` temporariamente. Rode o agente. O trace de `buscar_logs_historico` agora vem com `_simulado: true`. Volte o `.env`.

> Graceful degradation declarativa: a infra sumiu, o agente não estoura. O trace conta a verdade.

---

## Como rodar com 4 adapters ao mesmo tempo

**Terminal 1** — API local:

```bash
python api_local/server.py
```

**Terminal 2** — agente:

```bash
# antes da primeira execução, semear o banco
python seed_logs.py

python runtime/main.py rodar --agente monitor-agent --entrada "alerta de latência no checkout"
```

O log de carregamento de ferramentas mostra os 4 tipos:

```
[ferramentas] consultar_metricas → rest
[ferramentas] buscar_logs → rest
[ferramentas] historico_deploys → rest
[ferramentas] buscar_logs_historico → database
[ferramentas] buscar_issues → mcp
[ferramentas] relatorio_incidente → mock
```

E no `trace.json`, cada tool carrega a marca de proveniência:

| Tool | Campos esperados |
|------|------------------|
| `consultar_metricas`, `buscar_logs`, `historico_deploys` | `"_adapter": "rest"`, `"_via_api_real": true` |
| `buscar_logs_historico` | `"_adapter": "database"`, `"_simulado": false` |
| `buscar_issues` | `"_adapter": "mcp"`, `"_via_mcp_real": true|false` |
| `relatorio_incidente` | `"_adapter": "mock"` |

> Se `buscar_logs_historico` vier com `_simulado: true`, algo saiu do lugar — confira `.env`, `DB_CONNECTION_STRING` e se `seed_logs.py` rodou sem erro.

---

## Os 3 vetores de defesa

| Vetor | Onde mora | Quem fiscaliza |
|-------|-----------|----------------|
| **Política declarada** | `rules.md` (texto livre injetado no prompt) | LLM (orienta) + auditoria humana |
| **Validação no adapter** | `db_adapter.py → _OPERACOES_ESCRITA`, regex de payload | runtime (recusa antes de executar) |
| **Hook em runtime** | `hooks.md → antes_da_acao: validar_rate_limit, verificar_budget` | runtime (intercepta cada chamada) |

> Sem os três, sobra "a LLM vai colaborar". Com os três, o agente é defendido em três pontos diferentes do ciclo. Auditável no `trace.json`.

---

## Desafio da aula

1. Rode o agente com os 4 adapters ativos. Abra `trace.json` e confirme as 4 marcas de `_adapter`.
2. Tente quebrar o read-only (`modo: write`, `INSERT` no template). Confirme que o adapter bloqueia. Volte tudo no lugar.
3. Pare o `mcp/server.py` antes de rodar. O agente quebra ou cai em fallback? Onde está marcado no trace?

> Se você consegue distinguir as 4 origens no trace e tem segurança em três camadas, U3 está consolidada.
