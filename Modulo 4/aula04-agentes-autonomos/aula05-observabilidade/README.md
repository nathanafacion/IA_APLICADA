# Aula 5 — Observabilidade

> Não basta o agente rodar. Você precisa saber se ele decidiu bem.

Em software tradicional, log resolve. Em agente, **log não basta** — porque agente toma decisões, e decisão precisa de rastreabilidade.

Esta aula entrega um segundo agente (`trace-analyzer`) e o comando `analisar`, completando o quadro de observabilidade em **4 níveis**.

---

## O que tem de novo nesta aula

```
aula5/
├── monitor-agent/      ← inalterado (vem da aula 3)
├── runtime/            ← os 6 módulos que você abriu na aula 4
└── trace-analyzer/     ← NOVO: agente que analisa execução de outro agente
    ├── agent.md
    ├── rules.md
    ├── skills.md       ← 5 skills (analisar_saude, analisar_performance, ...)
    ├── hooks.md
    ├── memory.md
    ├── commands.md
    └── contracts/
        ├── loop.md
        ├── planner.md
        ├── executor.md
        └── toolbox.md
```

E um subcomando novo na CLI: `analisar`.

---

## Os 4 níveis de observabilidade

Cada nível responde uma pergunta diferente. Do mais imediato ao mais profundo.

### Nível 1 — Hooks (tempo real, ponto a ponto)

Disparam durante o ciclo. Definidos em `monitor-agent/hooks.md`:

```yaml
ganchos:
  antes_da_etapa: log
  apos_etapa: log
  antes_da_acao: log
  apos_acao: log
  em_erro: alerta
```

Aparecem no terminal enquanto o agente roda:

```
[13:40:05] gancho:antes_da_etapa etapa=1
[13:40:11] gancho:antes_da_acao ferramenta=consultar_metricas
[13:40:14] gancho:apos_acao sucesso=True
```

**Pergunta que respondem:** o que está acontecendo agora?

---

### Nível 2 — Dashboard de KPIs (tempo real, consolidado)

Aparece a cada etapa do ciclo:

```
┌─ KPIs __________________________________________________┐
│ Progresso:  3/10 etapas    3/9 chamadas    25.2s/120s
│ Tokens:     4654/50000 (9.3%)  ▓░░░░░░░░░
│ Ferramentas: ✓consultar_metricas ✓buscar_logs ○historico_deploys !relatorio_incidente
│ Qualidade:  3/3 ok   0 parcial   0 falha
│ Alertas:    0 circuit_breaker   0 payload_invalido
│ Latencia:   planejar=3819ms  agir=2829ms
└__________________________________________________________┘
```

| Símbolo | Significa |
|---------|-----------|
| `✓` | ferramenta já chamada |
| `!` | ferramenta **obrigatória** ainda não chamada |
| `○` | ferramenta opcional ainda não chamada |

> Se você está no passo 8 de 10 e `relatorio_incidente` ainda mostra `!`, sabe que tem problema antes do ciclo terminar.

**Pergunta que respondem:** o agente está saudável agora?

---

### Nível 3 — `trace.json` (post-mortem detalhado)

Gerado ao final de cada execução. 4 blocos:

#### Cabeçalho
- `trace_id` — identifica essa execução
- `tempo_total` — quanto demorou
- `tokens_consumidos` — quanto custou

#### `etapas` — 4 registros por etapa
| Registro | O que captura |
|----------|---------------|
| `percepcao` | o que o agente sabia naquele momento |
| `plano` | o que ele decidiu fazer e por quê |
| `resultado` | o que a ferramenta retornou |
| `avaliacao` | se funcionou e com que qualidade |

> Se ele errou no passo 4, abra o trace, vá no passo 4, leia percepção/plano/resultado. Não é achismo. É evidência.

#### `health_metrics`
| Métrica | Onde procurar se desviar |
|---------|--------------------------|
| Taxa de sucesso de ferramentas | problema nas tools |
| Ativações de circuit breaker | problema no planner |
| Falhas de validação de payload | problema nos contratos das skills |

#### `performance_data` — tempo por fase
Diagnóstico empírico: `perceber` e `avaliar` ficam em frações de ms (verificação local). `planejar` e `agir` ficam em segundos — porque ambos chamam LLM. **O gargalo está claro: planejar e agir, LLM e LLM.**

**Pergunta que respondem:** o que aconteceu nessa execução, em detalhe?

---

### Nível 4 — Análise automatizada (`trace-analyzer`)

Os 3 níveis acima são lidos por **você**. Este é lido por **outro agente**.

> Um agente que analisa a execução de outro agente. Definido por contratos. Executado pelo mesmo runtime. Mas o input dele é o `trace.json` do outro.

As 5 skills do `trace-analyzer` rodam na ordem:

| # | Skill | O que faz |
|---|-------|-----------|
| 1 | `analisar_saude` | avalia taxa de sucesso, circuit breaker, qualidade |
| 2 | `analisar_performance` | avalia tempo, tokens, gargalos |
| 3 | `analisar_conformidade` | verifica se ferramentas obrigatórias foram chamadas |
| 4 | `detectar_anomalias` | identifica comportamentos fora do padrão |
| 5 | `gerar_veredito` | consolida e gera recomendações acionáveis |

E a ordem é garantida pelas `regras` do `planner.md` do `trace-analyzer` — ele não pode pular etapa.

**Pergunta que responde:** o agente decidiu bem? E se não, onde corrigir?

---

## Como rodar a análise

```bash
cd runtime

# 1. Gera o trace de algum agente
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia no servico de pagamentos"

# 2. Roda o trace-analyzer sobre esse trace
python main.py analisar --agente ../trace-analyzer
```

O comando `analisar`:
1. Lê o `trace.json` da última execução
2. Gera um resumo compacto
3. Passa esse resumo como entrada pro `trace-analyzer`
4. O analyzer roda como qualquer agente — mesmo runtime, mesmo loop
5. Gera dois artefatos:
   - **`analise.json`** — o trace da análise (rastreabilidade da rastreabilidade)
   - **`analise-agente.md`** — o relatório legível com saúde, performance, conformidade, anomalias e veredito

> Um agente rodou. Outro agente analisou. Os dois com trace. Os dois rastreáveis.

---

## Por que isso importa em produção

| Sem observabilidade | Com observabilidade |
|---------------------|---------------------|
| Agente faz algo errado, você não sabe o quê | Abre o trace, vê a decisão |
| Não sabe onde procurar | Health metric aponta a área |
| Horas debugando no escuro | Análise automatizada entrega o diagnóstico |
| "Acho que é o prompt" | "A taxa de sucesso da `buscar_logs` caiu de 100% para 60% no dia X" |

> É a diferença entre agente de brinquedo e agente de produção.

---

## Os 4 níveis em uma tabela

| Nível | Quando | Granularidade | Quem lê |
|-------|--------|---------------|---------|
| 1. Hooks | tempo real | ponto a ponto | você (terminal) |
| 2. Dashboard KPIs | tempo real | consolidado por etapa | você (terminal) |
| 3. `trace.json` | post-mortem | tudo, em detalhe | você (investigação) |
| 4. `trace-analyzer` | post-mortem | diagnóstico automático | outro agente |

Do tempo real ao post-mortem. Do simples ao profundo.

> Observabilidade não é feature. É requisito.

---

## Desafio da aula

```bash
# rode o monitor-agent
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia"

# rode a análise
python main.py analisar --agente ../trace-analyzer

# abra o relatório
# analise-agente.md
```

E responda, sem chutar:

1. Qual foi a taxa de sucesso?
2. O circuit breaker ativou?
3. Qual foi o gargalo de performance?
4. As ferramentas obrigatórias foram chamadas?

> Se você sabe responder essas quatro perguntas, sabe operar um agente em produção.
