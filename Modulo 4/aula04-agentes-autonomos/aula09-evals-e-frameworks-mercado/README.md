# Aula 9 — Evals, frameworks equivalentes e fechamento da Unidade 2

> Três arquiteturas no mesmo agente. Pra escolher entre elas, falta uma coisa: medir.

A aula 7 entregou ReAct. A aula 8 fechou Plan-Execute e Reflection. Esta aula transforma esse trio em **evidência comparável**: um dataset de incidentes, uma eval suite com limiares e um benchmark engine que roda as 4 arquiteturas (`padrão`, `react`, `plan_execute`, `reflect`) contra o mesmo dataset e gera um relatório Markdown comparativo. Fecha a Unidade 2 com equivalências para LangChain/LangGraph e checklist de portfólio.

> Eval não é teste unitário. É medir **decisão** — taxa de conclusão, cobertura de ferramentas esperadas, custo em tokens, tempo. O que separa "achei que ReAct é melhor" de "ReAct ganha em cobertura mas Plan-Execute custa metade dos tokens".

---

## O que tem de novo nesta aula

```
aula9/
├── monitor-agent/                   ← inalterado
├── trace-analyzer/                  ← inalterado
├── backlog-decomposer/              ← inalterado
├── architectures/                   ← vem da aula 8 (react, plan_execute, reflect)
├── evals/                           ← NOVO
│   ├── datasets/
│   │   └── incidentes.json          ← 5 cenários com ferramentas_esperadas
│   └── suites/
│       └── monitor-agent.yaml       ← métricas + dataset + limiares
├── equivalencias/                   ← NOVO
│   ├── 01_nosso_framework.py
│   ├── 02_langchain_react.py
│   ├── 03_langgraph_plan_execute.py
│   └── MAPEAMENTO.md
└── runtime/
    ├── benchmark.py                 ← NOVO — engine de benchmark
    └── main.py                      ← +subcomandos benchmark e comparar
```

Dois subcomandos novos na CLI: `benchmark` (uma arquitetura) e `comparar` (as quatro).

---

## O dataset — `evals/datasets/incidentes.json`

5 cenários de incidente com gabarito explícito:

| id | dificuldade | ferramentas_esperadas |
|----|-------------|----------------------|
| `inc-001` | fácil | `consultar_metricas`, `buscar_logs`, `relatorio_incidente` |
| `inc-002` | médio | + `historico_deploys` (entrada menciona deploy) |
| `inc-003` | médio | `consultar_metricas`, `buscar_logs`, `relatorio_incidente` |
| `inc-004` | difícil | + `historico_deploys` (timeout downstream) |
| `inc-005` | fácil | mesmo trio do `inc-001` |

> Todos os cenários esperam `relatorio_incidente` como ferramenta final. A presença de `historico_deploys` separa cenários "precisa correlacionar com deploy" dos que não precisam.

---

## A eval suite — `evals/suites/monitor-agent.yaml`

```yaml
dataset: ../datasets/incidentes.json

métricas:
  - taxa_conclusao
  - media_etapas
  - media_tokens
  - tokens_planejamento
  - media_tempo_segundos
  - taxa_sucesso_ferramentas
  - circuit_breaker_total
  - reflexoes_total
  - cobertura_ferramentas

limiares:
  taxa_conclusao: 80
  taxa_sucesso_ferramentas: 90
  cobertura_ferramentas: 75
```

> A suite é o **contrato de qualidade** do agente. Métricas abaixo do limiar viram `violacoes` no relatório. `cobertura_ferramentas` é a fração das `ferramentas_esperadas` que foram efetivamente chamadas.

---

## O engine — `runtime/benchmark.py`

Duas funções públicas:

| Função | Responsabilidade |
|--------|------------------|
| `rodar_benchmark(caminho_agente, caminho_suite, arquitetura=None)` | itera o dataset, chama `ciclo.rodar(...)` por cenário, extrai métricas via `_extrair_metricas_trace`, agrega, fiscaliza limiares e retorna o agregado |
| `gerar_relatorio_comparativo(resultados, caminho_saida)` | recebe N agregados (um por arquitetura), gera tabela Markdown comparativa com **negrito no melhor valor** de cada métrica e veredito |

E três helpers privados:

| Helper | O que faz |
|--------|-----------|
| `_carregar_suite` | parseia o YAML da suite |
| `_carregar_dataset` | resolve o caminho do dataset relativo ao YAML e parseia o JSON |
| `_extrair_metricas_trace(trace, caso)` | conta etapas, tokens, qualidade (`completa/parcial/falha`), reflexões e calcula `cobertura_ferramentas` cruzando `ferramentas_chamadas` com `ferramentas_esperadas` |

> O benchmark trata o trace como dado. Não toca em LLM, não interpreta saída. Só conta o que aconteceu.

### Fluxo do `rodar_benchmark`

```
carrega suite → carrega dataset
  para cada cenário:
    cria saída temporária _bench_<id>.json
    chama ciclo.rodar(arquitetura=...)
    extrai métricas do trace
    apaga arquivo temporário
agrega: taxa_conclusao, médias, totais
fiscaliza limiares → preenche violacoes
imprime resumo no terminal
retorna dict completo
```

---

## Os 2 subcomandos novos no `main.py`

| Comando | O que faz |
|---------|-----------|
| `benchmark --agente ... --suite ... [--arquitetura X]` | roda uma arquitetura, salva `benchmarks/bench_<arq>.json` |
| `comparar --agente ... --suite ...` | roda as 4 arquiteturas em sequência (`padrão`, `react`, `plan_execute`, `reflect`), salva 4 JSONs e gera `benchmarks/report.md` com a tabela comparativa |

A lista de arquiteturas em `comparar` é fixa — `padrão` passa `arquitetura=None` para o engine, ou seja, comportamento da Unidade 1.

---

## Como rodar

A partir de `runtime/`:

```bash
# benchmark de uma arquitetura
python main.py benchmark --agente ../monitor-agent --suite ../evals/suites/monitor-agent.yaml --arquitetura react

# comparativo completo (4 arquiteturas, 5 cenários cada = 20 execuções)
python main.py comparar --agente ../monitor-agent --suite ../evals/suites/monitor-agent.yaml

# abrir o relatório
cat ../benchmarks/report.md
```

Saída esperada na pasta `benchmarks/`:

```
benchmarks/
├── bench_padrão.json
├── bench_react.json
├── bench_plan_execute.json
├── bench_reflect.json
└── report.md          ← tabela comparativa + violacoes + veredito
```

> O `report.md` marca em **negrito** o melhor valor de cada métrica. O veredito separa "mais eficiente em tokens", "maior cobertura" e "mais rápido" — porque "melhor arquitetura" depende do que importa pro caso.

---

## Equivalências em frameworks reais

A pasta `equivalencias/` traz **três arquivos didáticos** mostrando o mesmo agente em três pilhas diferentes:

| Arquivo | Stack | Conceito demonstrado |
|---------|-------|----------------------|
| `01_nosso_framework.py` | nosso runtime | baseline pra comparação |
| `02_langchain_react.py` | LangChain | `@tool`, `PromptTemplate`, `create_react_agent`, `AgentExecutor` |
| `03_langgraph_plan_execute.py` | LangGraph | `TypedDict`, `StateGraph`, nós `planejar/executar/avaliar`, `conditional_edges` |

E `MAPEAMENTO.md` consolida o "tradutor de conceitos" — abaixo, recorte do mapeamento LangChain ReAct:

| Nosso framework | LangChain |
|-----------------|-----------|
| `agent.md` | prompt template |
| `skills.md` | `@tool` decorators |
| `planner.md` (ReAct) | `create_react_agent()` |
| `ciclo.py` | `AgentExecutor` |
| `rules.md → max_etapas` | `max_iterations` |
| `hooks.md → log` | `verbose=True` |
| `circuit_breaker` | `handle_parsing_errors` |
| `trace.json` | callbacks / LangSmith |

> Os arquivos não precisam ser executados. São referência para o aluno comparar **mesmos conceitos, representações diferentes**. Nosso framework define arquitetura por **contrato Markdown**; LangGraph define por **código Python**. Conceito idêntico, ergonomia diferente.

---

## Como ler o relatório

| Métrica | Quando preocupar |
|---------|------------------|
| `taxa_conclusao` | abaixo de `80%` → planejador ou ferramentas com defeito |
| `cobertura_ferramentas` | abaixo de `75%` → o agente está pulando ferramenta esperada |
| `media_tokens` | valor mais alto = arquitetura mais cara em produção |
| `tokens_planejamento` | Plan-Execute concentra aqui (plano upfront); ReAct distribui |
| `reflexoes_total` | só aparece em `reflect`; mostra quantos ciclos rejeição→correção rodaram |

Não existe "melhor absoluta". Plan-Execute é mais barato em tokens, mas pode perder cobertura quando o pipeline tem ramificação. Reflection custa mais (ciclos extras) mas garante completude. ReAct fica no meio. O relatório te entrega a evidência, a decisão é sua.

---

## Checklist de entrega da Unidade 2

A entrega da U2 consiste em escolher um dos 8 projetos de portfólio (monitoramento avançado, code review, suporte L1, deploy, data quality, security audit, cost optimization, livre) e cobrir 4 grupos de itens:

| Grupo | Itens-chave |
|-------|-------------|
| Estrutura | `agent.md`, `contracts/`, `skills.md` com 3+ ferramentas, `rules.md`, `hooks.md` |
| Arquiteturas | rodar com `react`, `plan_execute` e `reflect` sem erro |
| Evals | dataset com 5+ cenários, suite com métricas + limiares, `report.md` analisado |
| Qualidade | schemas tipados, circuit breaker, validação de payload, trace gerado |

> Se você consegue rodar `comparar` no seu agente e o `report.md` mostra todas as arquiteturas dentro dos limiares, o portfólio está pronto.

---

## Desafio da aula

1. Rode `comparar` no `monitor-agent` e abra `benchmarks/report.md`. Qual arquitetura tem maior cobertura? Qual tem menos tokens? Concordam?
2. Edite `evals/datasets/incidentes.json` e adicione um sexto cenário onde a entrada menciona "vazamento de memória" sem citar deploy. Rode `comparar` de novo. Plan-Execute mantém cobertura?
3. Aumente `limiares.cobertura_ferramentas` para `90` no YAML. Quais arquiteturas violam o limiar agora?

> Se você consegue interpretar a tabela e justificar por que escolheria uma arquitetura para produção, fechou a Unidade 2.
