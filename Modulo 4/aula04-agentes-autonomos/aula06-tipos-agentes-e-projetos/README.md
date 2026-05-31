# Aula 6 — Tipos de agente e fechamento da Unidade 1

> Mesmo runtime. Mesmos módulos Python. Mesmo loop. O que muda é o que o runtime injeta no prompt da LLM — e só isso já muda o comportamento inteiro.

Até a aula 5 você usou apenas `task_based`. Esta aula apresenta os outros três tipos, traz um agente novo (`backlog-decomposer`, do tipo `goal_oriented`), e fecha a Unidade 1 com o ciclo de **contract-driven development** completo e a entrega do projeto de portfólio.

---

## O que tem de novo nesta aula

```
aula6/
├── monitor-agent/        ← inalterado (vem da aula 3)
├── runtime/              ← inalterado (mesmo motor)
├── trace-analyzer/       ← inalterado (vem da aula 5)
└── backlog-decomposer/   ← NOVO: agente goal_oriented
    ├── agent.md
    ├── rules.md
    ├── skills.md         ← 6 skills de decomposição
    ├── hooks.md
    ├── memory.md
    ├── commands.md
    └── contracts/
        ├── loop.md
        ├── planner.md    ← regras encadeadas: 1→2→3→4→5→6
        ├── executor.md
        └── toolbox.md
```

E duas flags novas na CLI:
- `--modo {task_based, interactive, goal_oriented, autonomous}`
- `--evento <nome>` (usado com `--modo autonomous`)

---

## Os 4 tipos de agente

> O `tipo` no `agent.md` é como a marcha de um carro. Motor é o mesmo. Mudou de marcha, comportamento muda inteiro.

| Tipo | Entrada | Comportamento | Exemplo |
|------|---------|---------------|---------|
| **task_based** | tarefa clara | executa direto, loop curto | `monitor-agent` recebe alerta e entrega relatório |
| **interactive** | tarefa ambígua | pergunta antes de agir | `"algo estranho no sistema"` → "qual serviço?" |
| **goal_oriented** | objetivo amplo | decompõe em sub-objetivos, encadeia | `backlog-decomposer` recebe objetivo e devolve backlog |
| **autonomous** | evento/trigger | responde a evento com limites rígidos | `--evento alerta_cpu` dispara o pipeline |

### Tabela comparativa detalhada

|                          | `task_based`   | `interactive`  | `goal_oriented`     | `autonomous`        |
|--------------------------|----------------|----------------|---------------------|---------------------|
| Entrada                  | tarefa clara   | tarefa ambígua | objetivo amplo      | evento/trigger      |
| Faz perguntas?           | não            | sim            | se necessário       | não                 |
| Decompõe?                | não            | não            | sim                 | não                 |
| Confirma ações?          | só sensíveis   | só sensíveis   | só sensíveis        | sempre sensíveis    |
| Loop típico              | 3–5 passos     | 5–8 passos     | 6–12 passos         | 3–5 passos          |
| Prioridade               | eficiência     | clareza        | completude          | segurança           |

---

## O que muda fisicamente entre os tipos

A flag `--modo` faz `planejador.py` injetar instruções diferentes no prompt do sistema:

### `--modo interactive`
```
MODO INTERACTIVE:
- Antes de agir, valide ambiguidades com o usuario usando PERGUNTAR_USUARIO
- Se faltar informacao critica, pergunte antes de chamar ferramentas
- Inclua o campo "pergunta" com a pergunta para o usuario
```

A LLM passa a usar `proxima_acao: PERGUNTAR_USUARIO` quando falta contexto. Em modo não-interativo, a pergunta vai pro log e o ciclo segue registrando "modo nao-interativo: sem resposta do usuario".

### `--modo goal_oriented`
```
MODO GOAL-ORIENTED:
- Decomponha o objetivo em sub-objetivos executaveis
- Para cada sub-objetivo, planeje quais ferramentas usar
- Reavalie o plano apos cada etapa com base nos resultados
```

### `--modo autonomous`
```
MODO AUTONOMOUS:
- Responda ao evento trigger fornecido na percepcao
- Opere dentro dos limites rigidos definidos
- NUNCA execute acoes destrutivas sem confirmacao humana
- Priorize seguranca sobre velocidade
```

> Mesmo agente, mesmo contrato, mesmo runtime. A flag `--modo` muda 4 linhas no prompt. E o comportamento muda inteiro.

---

## O `backlog-decomposer` — exemplo de `goal_oriented`

`tipo: goal_oriented` no `agent.md`. As **6 skills** rodam em ordem fixa, encadeadas por evidência:

```
analisar_objetivo → gerar_epicos → detalhar_stories → avaliar_riscos → gerar_perguntas → montar_backlog
```

A ordem é garantida pelas `regras` do `planner.md`:

```yaml
regras:
  - primeiro analisar o objetivo para identificar dominios e capacidades
  - depois gerar epicos baseados nos dominios identificados
  - depois detalhar stories com criterios de aceite
  - depois avaliar riscos tecnicos e de produto
  - depois gerar perguntas de esclarecimento
  - por ultimo montar o backlog consolidado
  - so usar FINALIZAR apos montar o backlog final
```

> No `monitor-agent`, o encadeamento é por **causalidade** (métricas → logs → deploy → diagnóstico).
> No `backlog-decomposer`, o encadeamento é por **decomposição** (objetivo → domínios → épicos → stories → riscos → backlog).
> O runtime é o mesmo. Os contratos é que mudaram.

### Rodando

```bash
python runtime/main.py rodar --agente ../backlog-decomposer \
  --entrada "permitir que novos usuarios completem cadastro sem suporte humano"
```

Resultado típico: 6 ferramentas chamadas em ordem, backlog com épicos + stories + critérios + riscos + perguntas.

---

## Ações sensíveis e o modo `autonomous`

No `monitor-agent/rules.md`:

```yaml
acoes_sensiveis:
  - rollback_deploy
```

Em modo `autonomous`, se a LLM decidir fazer `rollback_deploy`, o runtime **para e pede confirmação humana**. Sem o `s`, o ciclo encerra com `encerrado por negacao humana` registrado no trace.

```bash
python runtime/main.py rodar --agente ../monitor-agent \
  --entrada "cpu em 95 por cento no servico de pagamentos" \
  --modo autonomous --evento alerta_cpu
```

> Autonomia não é liberdade total. É operação dentro de limites rígidos. Como piloto automático: voa sozinho, mas se aparecer tempestade, o humano assume.

---

## Contract-driven development

> Não é debugar código. É iterar sobre especificação.

O ciclo de trabalho:

```
1. roda          → python main.py rodar --agente meu-agente --entrada "..."
2. observa       → python main.py rastreamento  (ou abre trace.json)
3. ajusta        → edita o .md (uma frase em português no rules ou no planner)
4. roda de novo  → volta ao 1
```

Exemplo concreto: o trace mostra que o agente repete a mesma ferramenta sem avançar. Você **não debuga código**. Abre `contracts/planner.md` e adiciona uma regra: `"não repetir a mesma ferramenta duas vezes seguidas sem justificativa"`. Uma frase. Comportamento muda junto.

> Não é tentativa e erro com prompt. É engenharia: definir contrato, observar trace, ajustar especificação, versionar no Git.

---

## Validação antes de rodar

```bash
python runtime/main.py validar --agente meu-agente
```

O validador cruza os 9 arquivos:
- ferramenta da `toolbox` que não existe nos `skills`?
- `ferramentas_obrigatorias` que não estão registradas?
- `limites.chamadas_ferramenta` referenciando ferramenta inexistente?

Erro aparece **antes da execução**. Como o compilador do Java — te xinga antes de rodar, não depois. Melhor descobrir agora do que ver o agente travar no passo 7.

---

## Os 8 projetos de portfólio (entrega da unidade)

Escolha um (ou traga seu próprio problema real):

| # | Projeto | Entrada | Saída | Portfólio |
|---|---------|---------|-------|-----------|
| 1 | Incident Triage Report Agent | alerta + logs | relatório com classificação, hipóteses, evidências, próximos passos | SRE / DevOps |
| 2 | PR Review Gate Agent | diff + checklist | review com riscos, testes ausentes, observabilidade | engenharia de software |
| 3 | API Contract Draft Agent | requisitos de endpoint | OpenAPI + exemplos + validação + erros | backend design |
| 4 | Runbook Generator Agent | descrição de serviço + SLIs | runbook (health checks, triage, dashboards, rollback) | platform engineering |
| 5 | Backlog Decomposer Agent | objetivo de produto | épicos, stories, critérios, riscos, perguntas | product + engineering |
| 6 | Data Quality Auditor Agent | amostra CSV/JSON | regras de validação + anomalias + ações | data engineering |
| 7 | Compliance Checklist Agent | mudança proposta | checklist + riscos + bloqueantes | governança |
| 8 | Onboarding Guide Agent | estrutura do repo + README | guia primeiro dia + como rodar + onde mexer + pitfalls | dev productivity |

---

## Passo a passo para construir seu agente

```bash
# 1. estrutura
mkdir -p meu-agente/contracts

# 2. identidade   — agent.md (nome, descrição, tipo, objetivo, contrato_saida)
# 3. ciclo        — contracts/loop.md (max_etapas, condicoes_parada)
# 4. decisão      — contracts/planner.md (formato_saida, regras)
# 5. capacidades  — skills.md (3 a 6 ferramentas com entrada/saida tipadas)
# 6. registro     — contracts/toolbox.md (recorte das skills)
# 7. execução     — contracts/executor.md (validar, retry, avaliar)
# 8. limites      — rules.md (max, ferramentas_obrigatorias, acoes_sensiveis, politicas)
# 9. observação   — hooks.md (5 ganchos)
# 10. memória     — memory.md (guardar, descartar, max_registros, resumo_final)

# antes de rodar
python runtime/main.py validar --agente meu-agente

# rodar
python runtime/main.py rodar --agente meu-agente --entrada "sua entrada aqui"

# observar
python runtime/main.py rastreamento

# diagnosticar com outro agente
python runtime/main.py analisar --agente trace-analyzer
```

> Não pule o `rules.md`. Agente sem rules é dar a chave do carro pro adolescente sem falar limite de velocidade. Rules é o que separa agente confiável de agente perigoso.

---

## Balanço da Unidade 1

| Aula | Você aprendeu a... |
|------|---------------------|
| 1 | distinguir agente de chatbot/automação |
| 2 | desenhar o agent loop (perceber, planejar, agir, avaliar) e por que stop conditions são obrigatórias |
| 3 | definir um agente inteiro por 9 contratos Markdown — sem código de domínio |
| 4 | abrir o runtime e ver como cada módulo Python lê esses contratos e executa o loop |
| 5 | observar em 4 níveis (hooks, KPIs, trace, análise automatizada) |
| 6 | usar os 4 tipos de agente e iterar via contract-driven development |

> Você não consome IA. Você constrói sistemas de IA.

---

## Desafio final da unidade

Construa seu agente de portfólio do zero:

1. Escolha um dos 8 projetos (ou traga o seu)
2. Crie os 9 contratos
3. Valide. Rode. Observe o trace. Ajuste. Rode de novo.
4. Quando o pipeline rodar limpo, rode `analisar --agente trace-analyzer`
5. Confirme no `analise-agente.md`:
   - Taxa de sucesso 100%?
   - Ferramentas obrigatórias chamadas?
   - Pipeline completo?
   - Sem anomalias?

> Se sim: você tem um agente de produção — definido por contrato, rastreável, governado e pronto pro portfólio.
