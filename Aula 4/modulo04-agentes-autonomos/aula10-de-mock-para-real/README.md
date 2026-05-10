# Aula 10 — De mock para real: padrão Adapter e tools REST

> Até a aula 9, todas as ferramentas eram mock — geradas pela LLM a partir do contrato. Esta aula é onde o agente sai do simulador.

A Unidade 2 fechou com 4 arquiteturas funcionando contra dados sintéticos. Agora o `monitor-agent` precisa falar com APIs reais sem que isso vire um `if/else` em Python para cada nova fonte. Esta aula introduz o **padrão Adapter** no runtime: a habilidade declara `tipo_implementacao: rest`, o runtime resolve dinamicamente qual adapter chamar e o adapter sabe fazer HTTP. Mock continua sendo o default — quem ainda não tem API real segue funcionando.

> Contrato declara o tipo. Runtime despacha. Adapter conecta. Três responsabilidades, três arquivos. O agente não muda.

---

## O que tem de novo nesta aula

```
aula10/
├── monitor-agent/                  ← skills.md ganha tipo_implementacao + conexao + limites
│   └── skills.md                   ← 3 skills viram REST, 1 fica mock
├── api_local/                      ← NOVO
│   └── server.py                   ← FastAPI com 3 endpoints (/metrics, /logs, /deploys)
├── runtime/
│   ├── adapters/                   ← NOVO
│   │   ├── __init__.py
│   │   └── rest_adapter.py         ← HTTP + retries + auth via header
│   └── ferramentas.py              ← _resolver_adapter despacha por tipo_implementacao
├── architectures/                  ← inalterado
└── trace-analyzer/, backlog-decomposer/  ← inalterados
```

E um `.env` na raiz com `API_BASE_URL` e `API_KEY` — secrets fora do contrato.

---

## O `skills.md` evoluído — 3 campos novos por habilidade

| Campo | Tipo | Para que serve |
|-------|------|----------------|
| `tipo_implementacao` | `rest` \| `database` \| `mcp` \| `mock` | diz ao runtime qual adapter usar; ausente = `mock` (backward compatible) |
| `conexao` | objeto | metadados do adapter (`endpoint`, `metodo`, `timeout_segundos`, `retries`, `autenticacao`) |
| `limites` | objeto | rate limit declarado no contrato (`chamadas_por_minuto`, etc.) |

Exemplo real, recortado de `monitor-agent/skills.md`:

```yaml
- nome: consultar_metricas
  descricao: consulta metricas de latencia, throughput e taxa de erro do servico
  tipo_implementacao: rest
  entrada:
    nome_servico: string
    janela_tempo_minutos: int
  saida:
    latencia_p99_ms: float
    vazao_rps: int
    taxa_erro: float
    status: string
  conexao:
    endpoint: /api/v1/metrics
    metodo: GET
    timeout_segundos: 10
    retries: 2
    autenticacao: header_api_key
  limites:
    chamadas_por_minuto: 30
```

`relatorio_incidente` continua com `tipo_implementacao: mock`. **Mock e real convivem no mesmo agente** — cada habilidade evolui no seu ritmo.

---

## O resolver — `runtime/ferramentas.py`

A função `_resolver_adapter` é o ponto único de despacho:

```python
def _resolver_adapter(habilidade):
    tipo = habilidade.get("tipo_implementacao", "mock")

    if tipo == "rest":
        try:
            from adapters.rest_adapter import criar_funcao_rest
            return criar_funcao_rest(habilidade)
        except ImportError:
            return construir_ferramenta(habilidade)  # fallback mock

    if tipo == "database":
        try:
            from adapters.db_adapter import criar_funcao_database
            return criar_funcao_database(habilidade)
        except ImportError:
            return construir_ferramenta(habilidade)

    if tipo == "mcp":
        try:
            from adapters.mcp_adapter import criar_funcao_mcp
            return criar_funcao_mcp(habilidade)
        except ImportError:
            return construir_ferramenta(habilidade)

    return construir_ferramenta(habilidade)  # mock (padrão)
```

Três propriedades importantes:

| Propriedade | Como é garantida |
|-------------|------------------|
| **Backward compatible** | sem `tipo_implementacao` → cai em `mock`, runtime da U1/U2 continua funcionando |
| **Graceful degradation** | adapter não instalado (`ImportError`) → cai em mock e o agente roda |
| **Open-Closed** | nova fonte (DB, MCP) entra como pasta nova em `adapters/`, o resolver não muda |

> Os ramos `database` e `mcp` já estão no resolver, mesmo que os adapters ainda não existam nesta aula. O slot está aberto para a aula 11.

---

## O `rest_adapter.py` — só conecta

`adapters/rest_adapter.py` expõe `criar_funcao_rest(habilidade)` que devolve uma função executável. A função:

1. Lê `endpoint`, `metodo`, `timeout_segundos`, `retries` do bloco `conexao` da habilidade.
2. Lê `API_BASE_URL` do `.env` e monta a URL completa.
3. Se `autenticacao == header_api_key`, lê `API_KEY` do `.env` e injeta no header da request.
4. Mapeia argumentos do agente para parâmetros HTTP (query string).
5. Executa a request com retry no número de tentativas declarado.
6. Retorna `{"sucesso": ..., "dados": ..., "_adapter": "rest", "_latencia_ms": ...}`.

> O adapter **não decide qual tool chamar** (planejador faz). **Não valida se deveria chamar** (rules fazem). **Não loga** (hooks fazem). Só conecta.

---

## A API local — `api_local/server.py`

FastAPI sobre `http://localhost:8100` com 3 endpoints que casam com os 3 skills REST:

| Endpoint | Parâmetros | Retorno |
|----------|------------|---------|
| `GET /api/v1/metrics` | `service`, `window_minutes` | `latencia_p99_ms`, `vazao_rps`, `taxa_erro`, `status` |
| `GET /api/v1/logs` | `service`, `hours`, `min_level` | lista de logs com `timestamp`, `level`, `message`, `service` |
| `GET /api/v1/deploys` | `service`, `limit` | lista de deploys com `versao`, `timestamp`, `autor`, `status` |

Os dados são fixos e didáticos — a graça é que **valores são consistentes entre execuções**, ao contrário do mock que sorteia tudo.

---

## O `.env` (não vai pro Git)

```
API_BASE_URL=http://localhost:8100
API_KEY=sua-chave-aqui
```

> Contrato declara `autenticacao: header_api_key`. Adapter lê a chave do `.env`. Secrets nunca aparecem no `.md`.

---

## Como rodar

Dois terminais.

**Terminal 1** — sobe a API local:

```bash
python api_local/server.py
# Uvicorn running on http://0.0.0.0:8100
```

**Terminal 2** — roda o agente:

```bash
python runtime/main.py rodar --agente monitor-agent --entrada "alerta de latência no checkout"
```

O que mudou no log:

```
[ferramentas] consultar_metricas → rest
[ferramentas] buscar_logs → rest
[ferramentas] historico_deploys → rest
[ferramentas] relatorio_incidente → mock
```

E no `trace.json`, cada resultado de tool REST traz a marca de proveniência:

```json
{
  "_adapter": "rest",
  "_latencia_ms": 12.4,
  "sucesso": true,
  "dados": { ... }
}
```

---

## Mock vs real — como distinguir no trace

| Característica | Mock (U1/U2) | REST (esta aula) |
|----------------|--------------|------------------|
| Valores entre execuções | aleatórios, às vezes absurdos (70%+ erro) | consistentes (mesmos da API) |
| Latência da fase `agir` | ~0ms (sem rede) | ms de HTTP local |
| Marca no resultado | sem `_adapter` | `_adapter: "rest"` |
| Auditável contra fonte real | não | sim, abra `localhost:8100/api/v1/metrics` no navegador |

> Se você consegue olhar o `trace.json` e dizer com certeza "este dado veio da API real, este veio do mock", você entendeu o padrão Adapter.

---

## Por que não foi um `if/else` em Python

| Alternativa que NÃO foi usada | Por que não |
|-------------------------------|-------------|
| `if nome_skill == "consultar_metricas": chamar_API_X(...)` | acopla runtime ao agente; adicionar skill nova exige PR no runtime |
| `import requests` direto no executor | executor passaria a saber sobre HTTP, autenticação, retries |
| Subclasses Tool por tipo | o agente é definido por contrato `.md`, não por classes Python |

A solução é **declarar no contrato qual adapter usar** e ter um resolver que despacha por nome. Adicionar Postgres, Snowflake ou GraphQL amanhã é criar `adapters/<nome>_adapter.py` e mais um ramo no resolver.

---

## Desafio da aula

1. Suba a API local. Rode o agente sem `--arquitetura`. Confirme no `trace.json` que `consultar_metricas`, `buscar_logs` e `historico_deploys` têm `"_adapter": "rest"` e `relatorio_incidente` não.
2. Pare a API (Ctrl+C no terminal 1). Rode o agente de novo. O que acontece? O retry declarado (`retries: 2`) ajuda? E o que aparece no campo `sucesso`?
3. Edite `monitor-agent/skills.md` e troque `tipo_implementacao: rest` por `tipo_implementacao: mock` em uma das skills. Rode. Os outros valores continuam reais? (Sim — porque cada skill resolve seu próprio adapter.)

> Mock e real convivem. Adapter é a costura. Se você adicionar Postgres na aula 11 sem mexer no `monitor-agent`, é porque o padrão funciona.
