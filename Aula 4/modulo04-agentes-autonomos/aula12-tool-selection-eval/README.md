# Aula 12 — Tool selection eval e fechamento da Unidade 3

> Mais ferramentas significa mais chances do agente escolher a errada. Esta aula entrega o eval que mede precisão de tool selection — caso a caso, com gabarito.

A aula 11 fechou o agente com 6 ferramentas em 4 adapters. Agora há um problema novo: `buscar_logs` e `buscar_logs_historico` têm descrições parecidas, e o agente pode confundir as duas. O benchmark da aula 9 mede taxa de conclusão e cobertura — não diz se o agente escolheu **a tool certa para a etapa certa com os argumentos certos**. Esta aula adiciona o `tool_eval`: dataset com gabarito explícito, 4 métricas dedicadas e dois subcomandos novos na CLI (`tool-eval` e `tool-eval-comparar`).

> Refinar a `descricao` de uma skill em uma frase pode subir a accuracy 20 pontos. Isso é spec-driven medindo a si mesmo.

---

## O que tem de novo nesta aula

```
aula12/
├── monitor-agent/                             ← inalterado (vem da aula 11)
├── api_local/, mcp/, monitor.db, seed_logs.py ← inalterados
├── architectures/                              ← inalterado
├── evals/
│   ├── datasets/
│   │   ├── incidentes.json                    ← vem da aula 9
│   │   └── tool_selection_cases.json          ← NOVO — dataset de tool selection
│   ├── suites/
│   │   ├── monitor-agent.yaml                 ← vem da aula 9
│   │   └── tool_selection.yaml                ← NOVO — métricas e limiares
│   └── resultados/                            ← gerado pelo tool-eval
├── benchmarks/                                ← gerado pelo comparar (aula 9)
├── equivalencias/                             ← inalterado
└── runtime/
    ├── tool_eval.py                           ← NOVO — eval runner + gerador de relatório
    └── main.py                                ← +tool-eval e tool-eval-comparar
```

---

## O dataset — `evals/datasets/tool_selection_cases.json`

Cada caso descreve uma **situação específica** que o planejador veria:

| Campo | Para que serve |
|-------|----------------|
| `id` | identificador único (`ts-001`, `ts-002`, ...) |
| `entrada` | texto que o agente recebe |
| `etapa` | número da etapa (1, 2, 3...) — afeta a percepção montada |
| `contexto` | descrição do que já foi coletado nas etapas anteriores |
| `tool_esperada` | nome da tool que deveria ser chamada |
| `argumentos_esperados` | dict com argumentos corretos (comparação tolerante) |
| `tools_nao_esperadas` | tools que **não deveriam** ser chamadas |
| `justificativa` | por que essa é a resposta certa (auditável) |

Exemplo:

```json
{
  "id": "ts-003",
  "entrada": "erro 500 intermitente no checkout após deploy",
  "etapa": 1,
  "contexto": "primeira etapa, entrada menciona deploy",
  "tool_esperada": "historico_deploys",
  "argumentos_esperados": {"nome_servico": "checkout"},
  "tools_nao_esperadas": ["relatorio_incidente"],
  "justificativa": "entrada menciona deploy, priorizacao de historico_deploys"
}
```

Mínimo: 5 casos com dificuldades variadas — primeira etapa, etapa intermediária, entrada ambígua, palavra-chave clara, cenário sem menção de deploy.

---

## A suite — `evals/suites/tool_selection.yaml`

```yaml
métricas:
  - tool_selection_accuracy
  - argument_accuracy
  - unnecessary_calls_rate
  - wrong_tool_rate

limiares:
  tool_selection_accuracy: 0.8
  unnecessary_calls_rate: 0.1
  wrong_tool_rate: 0.15

dataset: datasets/tool_selection_cases.json
```

| Métrica | Significado | Direção |
|---------|-------------|---------|
| `tool_selection_accuracy` | % de vezes que escolheu a `tool_esperada` | maior é melhor — limiar 80% |
| `argument_accuracy` | % de argumentos corretos (comparação substring/lowercase) | maior é melhor |
| `unnecessary_calls_rate` | % de tools chamadas que estavam em `tools_nao_esperadas` | menor é melhor — limite 10% |
| `wrong_tool_rate` | % de casos com tool errada | menor é melhor — limite 15% |

> Note a inversão de direção: para `unnecessary_calls_rate` e `wrong_tool_rate`, **violação é estar acima do limiar**.

---

## O runner — `runtime/tool_eval.py`

Duas funções públicas:

| Função | Responsabilidade |
|--------|------------------|
| `rodar_tool_eval(caminho_agente, caminho_suite, arquitetura=None)` | itera o dataset, chama o **planejador** (não o ciclo inteiro), avalia caso a caso, agrega 4 métricas, fiscaliza limiares |
| `gerar_relatorio_tool_eval(resultados, caminho_saida)` | tabela comparativa entre arquiteturas + detalhamento por caso + violações |

E três helpers privados:

| Helper | O que faz |
|--------|-----------|
| `_montar_percepcao_caso(caso)` | reconstrói a string de percepção com `Alerta:`, `Modo:`, `Etapas realizadas:` e `Contexto:` — o planejador não sabe que está num eval |
| `_avaliar_caso(caso, plano)` | 3 checks: tool correta, `argument_accuracy` (substring/lowercase), `chamada_desnecessaria` |
| `_carregar_suite` / `_carregar_dataset` | parseiam YAML/JSON |

> A diferença chave para o `benchmark.py` da aula 9: aqui o eval **não roda o ciclo inteiro**. Chama só o `chamar_llm` do planejador para cada caso. É barato — não paga as fases `agir/avaliar` que os 5 cenários de incidentes pagavam no benchmark de arquiteturas.

### Os dois subcomandos novos no `main.py`

| Comando | O que faz |
|---------|-----------|
| `tool-eval --agente ... --suite ... [--arquitetura X]` | roda o eval em uma arquitetura, salva `evals/resultados/tool_eval_<arq>.json` |
| `tool-eval-comparar --agente ... --suite ...` | roda nas 4 arquiteturas (`padrao, react, plan_execute, reflect`), salva 4 JSONs e gera `evals/resultados/tool_selection_report.md` |

---

## Como rodar

A partir da raiz do projeto:

```bash
# eval em uma arquitetura
python runtime/main.py tool-eval --agente monitor-agent \
  --suite evals/suites/tool_selection.yaml

# comparativo entre as 4 arquiteturas
python runtime/main.py tool-eval-comparar --agente monitor-agent \
  --suite evals/suites/tool_selection.yaml
```

Saída no terminal por caso:

```
OK ts-001: esperada=consultar_metricas, escolhida=consultar_metricas, args=1.0
OK ts-002: esperada=buscar_logs, escolhida=buscar_logs, args=1.0
X  ts-003: esperada=historico_deploys, escolhida=buscar_logs, args=0.5
...
```

Resumo final:

```
============================================================
  RESULTADO — react
============================================================
  Tool selection accuracy:  80.0%
  Argument accuracy:        90.0%
  Unnecessary calls rate:   10.0%
  Wrong tool rate:          20.0%
  VIOLACOES:
    X wrong_tool_rate: 0.2 > 0.15
============================================================
```

---

## O ciclo do refinamento — descrição → accuracy

A power-move desta aula é o passo 6 do hands-on: melhorar a `descricao` de skills ambíguas e ver a accuracy subir **sem mudar uma linha de código**.

Exemplo concreto, em `monitor-agent/skills.md`:

| Skill | Antes (ambíguo) | Depois (refinado) |
|-------|-----------------|-------------------|
| `buscar_logs` | "busca logs estruturados do serviço em uma janela de tempo" | "busca logs **recentes via API** (últimos 60 min)" |
| `buscar_logs_historico` | "busca logs históricos do serviço no banco de dados" | "busca logs **antigos via banco de dados** (horas ou dias atrás, para correlação temporal)" |

Rode o eval antes e depois. A accuracy sobe porque a LLM passa a distinguir as duas pelo verbo (`recentes` vs `antigos`) e pela fonte (`API` vs `banco de dados`).

> Contrato é interface. Interface bem escrita = sistema melhor. O eval te dá a evidência que justifica o refinamento.

---

## Comparativo entre arquiteturas — tendência esperada

| Arquitetura | Comportamento esperado em tool selection |
|-------------|------------------------------------------|
| `react` | accuracy alta — raciocina antes de cada escolha |
| `reflect` | accuracy alta — crítico pega tool errada e corrige |
| `plan_execute` | accuracy menor — decide tudo no início, sem ajustar pelo contexto da etapa |
| `padrao` | baseline sem raciocínio explícito |

> O `tool_selection_report.md` consolida isso numa tabela com **negrito no melhor valor** de cada métrica. Não existe vencedora absoluta — depende de quanto custo (tokens, etapas) você aceita pagar pela accuracy.

---

## Checklist de entrega da Unidade 3

| Grupo | Itens-chave |
|-------|-------------|
| **Contratos** | `skills.md` com 1+ tool REST/database/MCP; `rules.md` com `rate_limit_global` e políticas; `hooks.md` com `validar_rate_limit` e `verificar_fallback_mock` |
| **Adapters** | REST contra API real ou local; DB com `read_only` validado; MCP conectando ao server; fallback mock funcionando |
| **MCP** | `mcp/server.py` com 2+ tools; `mcp/config.json` no formato padrão |
| **Segurança** | secrets só no `.env`; timeout no contrato; LIMIT em queries; `read_only` fiscalizado |
| **Evals** | dataset com 5+ casos; suite com métricas e limiares; **accuracy ≥ 80%**; relatório de tool selection gerado |

---

## Os 8 projetos de portfólio da U3

| # | Projeto | Domínio |
|---|---------|---------|
| 1 | DevOps Command Center Agent | SRE/DevOps |
| 2 | Customer Support Agent | suporte + automação |
| 3 | Data Pipeline Monitor Agent | data engineering |
| 4 | Infrastructure Cost Analyzer Agent | FinOps |
| 5 | API Integration Testing Agent | QA + backend |
| 6 | Security Audit Agent | security engineering |
| 7 | Release Coordinator Agent | release engineering |
| 8 | Knowledge Base Agent | developer experience |

Requisitos mínimos para qualquer um:

- 3+ tools reais (REST + database + MCP)
- `tool_selection_accuracy` ≥ 80%
- Checklist completo
- Versionado no Git

> Mesma arquitetura: contratos `.md` → harness → adapters → mundo real. Muda o domínio, não o jeito de construir.

---

## Desafio da aula

1. Rode `tool-eval` no `monitor-agent` com a arquitetura padrão. Anote a accuracy.
2. Identifique no relatório os casos onde o agente errou. Olhe a `descricao` da tool errada e da tool esperada — elas se confundem por quê?
3. Refine as duas descrições e rode `tool-eval` de novo. A accuracy subiu sem mudar Python?
4. Rode `tool-eval-comparar`. Qual arquitetura ganha em accuracy? Qual ganha em `argument_accuracy`?

> Se você consegue justificar a escolha de arquitetura citando números do `tool_selection_report.md`, e o checklist está todo marcado, fechou a Unidade 3 e está pronto pro portfólio.
