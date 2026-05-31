# Aula 15 — Evals de memória e fechamento da Unidade 4

> Memória de quatro tipos rodando, lições sendo extraídas. Como medir se está ajudando?

A aula 13 instalou os 4 tipos de memória. A 14 plugou embeddings e reflexão evolutiva. Mas até aqui a verificação foi qualitativa — "rode, observe, ajuste". Esta aula fecha a Unidade 4 com o que separa POC de sistema mensurável: **dataset de impacto, suite de 6 métricas, comparação com vs sem memória, relatório**.

A pergunta que o eval responde é única: **a memória, instalada e funcionando, está realmente melhorando as decisões do agente?**

---

## O que tem de novo nesta aula

```
aula15/final/
├── monitor-agent/                ← inalterado (vem da aula 14)
├── runtime/
│   ├── memory_eval.py            ← NOVO: harness do eval de memoria
│   └── main.py                   ← +subcomando memory-eval
├── evals/
│   ├── datasets/
│   │   └── memory_impact_cases.json   ← NOVO: 5+ casos de teste
│   ├── suites/
│   │   └── memory_impact_eval.yaml    ← NOVO: 6 metricas + limiares
│   └── resultados/
│       └── memory_impact_report_<ts>.md  ← gerado a cada execucao
└── reflection_store/licoes/      ← precisa ter pelo menos 1 licao pra metrica funcionar
```

A flag de runtime `MEMORY_DISABLED=1` (que o `ciclo.py` aceita pra desligar memória sob demanda) é o que permite rodar o mesmo caso duas vezes — uma com memória, uma sem — e comparar.

---

## O dataset — `memory_impact_cases.json`

Em `evals/datasets/memory_impact_cases.json`. Cada caso declara:

| Campo | O que captura |
|-------|---------------|
| `id` | identificador único do caso |
| `entrada` | texto que o agente recebe |
| `contexto_memoria` | fragmentos que a memória **deve** trazer |
| `decisao_esperada` | o que o planner **deveria** decidir COM memória |
| `sem_memoria` | baseline — o que o planner decidiria SEM memória |
| `resultado_esperado` | resultado correto da investigação |

Mínimo 5 casos cobrindo as situações típicas:

| Situação | Por que importa |
|----------|-----------------|
| Memória ajudando | experiência anterior relevante recupera bem |
| Memória irrelevante | recupera fragmentos que não ajudam |
| Memória desatualizada | fato obsoleto vence — ou perde — decisão atual |
| Sem memória anterior | primeira execução, contextual deve ser tolerante |
| Lições de reflection | lição generalizável muda decisão |

> Se você não cobre os 5 casos, está medindo só "quando dá certo". Eval honesto inclui ruído e desatualização.

---

## A suite — `memory_impact_eval.yaml`

Em `evals/suites/memory_impact_eval.yaml`. **6 métricas, cada uma com limiar de aceitação:**

| Métrica | Pergunta que responde | Limiar |
|---------|------------------------|--------|
| `retrieval_precision` | os fragmentos recuperados são úteis? | 0.7 |
| `retrieval_recall` | encontrou tudo que importava? | 0.6 |
| `memory_utilization` | o planner usou o contexto recuperado? | 0.5 |
| `hallucination_from_memory` | inventou dados não presentes na memória? | max 0.1 |
| `decision_improvement` | decisões melhoram com memória? | min 0.15 (15%) |
| `lesson_quality` | lições extraídas são úteis? | 0.6 |

> `decision_improvement` é a métrica-chefe da aula. Mede a redução de etapas (ou aumento de acerto) entre `com memória` e `sem memória` no mesmo caso. Se vier 0 ou negativo, sua memória é decoração.

---

## Por que `lesson_quality` exige `reflection_store/licoes/` populado

A métrica lê `reflection_store/licoes/`. Se está vazio, `lesson_quality` reporta 0.0 → FAIL automático. **Antes de rodar o eval, garanta lições.**

Receita rápida pra forçar extração (descrita no hands-on, passo 3):

1. Em `monitor-agent/rules.md`, baixe `limites.max_etapas` de 12 pra 3
2. Rode: `python runtime/main.py rodar --agente monitor-agent --entrada "alerta de cpu alta no servico de notificacoes por push novo"`
3. O ciclo bate `max_etapas_excedido` e a heurística de `_extrair_licoes` (aula 14) dispara
4. Observe o output: `[reflection] extraindo licoes... N gravadas` ou `[reflection] nenhuma licao generalizavel emergiu desta execucao` (a LLM respeitando política)
5. Restaure `max_etapas: 12`

Se `nenhuma licao generalizavel emergiu` persistir, troque a entrada por algo mais único — `erro 503 desconhecido em servico novo de analytics sem precedente`. A LLM não é determinística; uma rodada não basta.

---

## Como rodar

```bash
# eval completo (todos os casos do dataset)
python runtime/main.py memory-eval --agente monitor-agent --suite evals/suites/memory_impact_eval.yaml

# eval rapido pra demo/desenvolvimento (limita aos primeiros N casos)
python runtime/main.py memory-eval --agente monitor-agent --suite evals/suites/memory_impact_eval.yaml --max-casos 2
```

Cada caso roda **2 vezes** — uma com memória, uma com `MEMORY_DISABLED=1`. Tempo escala linear com o número de casos. Use `--max-casos` durante iteração, completo pra entrega.

O que aparece no terminal:

```
caso 1/5  fragmentos recuperados=4 esperados=4
          decisao planner: chamar buscar_logs   esperada: chamar buscar_logs
          ... PASS

caso 2/5  ...
```

E ao final, o resumo de métricas com PASS/FAIL e o caminho do relatório:

```
relatorio: evals/resultados/memory_impact_report_20260504_T143012.md
```

---

## O ruído honesto da aula

Duas métricas dão FAIL falso com frequência — e é importante saber por quê:

| Métrica | Por que dá FAIL falso |
|---------|------------------------|
| `memory_utilization` | a heurística é busca por tokens; o planner reescreve a memória em vez de copiar tokens literais |
| `hallucination_from_memory` | nomes de ferramentas aparecem na decisão sem estar no contexto recuperado — tecnicamente "inventa", didaticamente é certo |

> Em produção, métricas de eval costumam usar **LLM-as-judge** (outra LLM avalia se houve uso/alucinação). Aqui a heurística simples é proposital — material didático pra entender por que o cálculo binário falha.
> Ferramenta de produção: **Ragas** (referência no fechamento da aula).

E mais uma regra inegociável:

> A LLM **não é determinística**. Uma rodada não prova nada. Eval de verdade é estatístico — várias rodadas, média, tendência.

---

## Diagnóstico — guia rápido

| Métrica baixa | O que ajustar |
|---------------|---------------|
| `retrieval_precision` | aumentar `contextual.limiar_similaridade` em `memory.md` |
| `retrieval_recall` | diminuir o limiar; ou melhorar descrições nas memórias |
| `memory_utilization` | revisar `regras` no `planner.md` (`considerar conhecimento_relevante antes...`) |
| `hallucination_from_memory` | adicionar política de expiração (`memorias com mais de 90 dias...` em `rules.md`) |
| `decision_improvement` negativo | verificar as outras 5 antes — sintoma, não causa |
| `lesson_quality` | ajustar políticas de extração no `reflection.md` |

---

## Relatório comparativo — assinatura esperada

`evals/resultados/memory_impact_report_<timestamp>.md` mostra:

- Etapas médias: com vs sem memória
- `decision_improvement` percentual
- Diagnósticos mais/menos precisos
- Recomendações de ajuste

A direção esperada (não números fixos): **com memória → menos etapas, menos tokens, mais acerto**. Se não bate, alguma das 6 métricas vai mostrar onde corrigir.

---

## Checklist de entrega da Unidade 4

```
Contratos
  [ ] memory.md com 4 tipos de memoria (curta, longa, episodica, contextual)
  [ ] reflection.md com critica + aprendizado
  [ ] hooks.md com interceptacao de memoria (4 hooks da aula 13)
  [ ] rules.md com politicas_memoria
  [ ] planner.md com regras de contexto enriquecido

Adapters
  [ ] memory_adapter.py com 5 operacoes (gravar, recuperar, atualizar, remover, listar)
  [ ] embedding_adapter.py com 3 operacoes (indexar, buscar, reindexar)

Stores
  [ ] memory_store/curta/ (existe; vive em RAM dentro da execucao)
  [ ] memory_store/longa/ com fatos populados
  [ ] memory_store/episodica/ com episodios populados
  [ ] memory_store/contextual/indice.json gerado pelo lazy reindex
  [ ] reflection_store/licoes/ com licoes extraidas
  [ ] reflection_store/padroes/ (vazio no MVP da aula 14)

Evals
  [ ] dataset com pelo menos 5 casos cobrindo as 5 situacoes
  [ ] suite com 6 metricas e limiares
  [ ] decision_improvement positivo (>0.15)
  [ ] relatorio comparativo gerado em evals/resultados/

Seguranca
  [ ] nunca secrets na memoria (politica em rules.md + filtro no _extrair_licoes)
  [ ] fatos so confirmados por evidencia de tool
  [ ] politica de expiracao para fatos antigos
```

---

## Projeto de portfólio — opções

Na entrega final da Unidade 4, escolha um (ou traga o seu):

| # | Projeto | Domínio |
|---|---------|---------|
| 1 | Incident Learning Agent | SRE |
| 2 | Adaptive PR Review Agent | engenharia de software |
| 3 | Personal Debugging Assistant | produtividade de dev |
| 4 | Adaptive Support Agent | suporte |
| 5 | Data Quality Agent | data engineering |
| 6 | Runbook Evolution Agent | platform engineering |
| 7 | Architecture Decision Record Agent | tech lead |
| 8 | Onboarding Agent | developer experience |

Requisitos mínimos:

- 4 tipos de memória ativos e funcionando
- `reflection.md` extraindo lições com política de "só inesperado"
- Eval de impacto rodando, `decision_improvement` positivo
- Checklist completo
- Tudo versionado no Git

> Memória sem eval é fé. Eval sem memória é checklist. Os dois juntos é engenharia.
