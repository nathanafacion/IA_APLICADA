# Aula 4 — Por dentro do runtime

> O agente da aula 3 não mudou. O que muda é a perspectiva: agora você abre o motor.

A aula 3 entregou nove contratos Markdown e o agente rodou. Esta aula explica **como**: cada módulo Python do `runtime/` lê um pedaço dos contratos e executa o ciclo. **Cada linha de YAML que você escreveu tem uma linha de Python que a lê.**

> O runtime não sabe nada sobre o agente. Ele só sabe ler contratos e executar.

---

## Os 6 módulos do runtime

```
runtime/
├── contratos.py     → carrega os 9 .md, monta o estado inicial
├── ciclo.py         → orquestra o loop e o circuit breaker
├── planejador.py    → percepção e chamada à LLM
├── ferramentas.py   → constrói as tools a partir dos skills
├── executor.py      → valida payload, executa, dispara hooks, avalia
├── telemetria.py    → registra eventos, mede tempo, conta tokens
├── main.py          → CLI (rodar, validar, rastreamento, replay, analisar)
└── validador.py     → valida cruzamento entre os 9 contratos
```

Nenhum desses módulos sabe que existe latência, deploy ou incidente. Eles só leem contratos e executam.

---

## 1. `contratos.py` — carregamento

Três funções:

| Função | O que faz |
|--------|-----------|
| `carregar_yaml_do_md(caminho)` | extrai o primeiro bloco ` ```yaml ` de um `.md` e parseia |
| `carregar_contratos(caminho_agente)` | carrega os 9 arquivos e devolve um dict com 9 chaves (`agente`, `regras`, `habilidades`, `ganchos`, `memoria`, `ciclo`, `planejador`, `executor`, `caixa_ferramentas`) |
| `criar_estado(contratos, entrada, modo, evento)` | monta a "folha em branco" inicial: contadores zerados, limites lidos das `rules`, histórico vazio, tokens em zero |

> Markdown é documentação. YAML é máquina. O bloco YAML dentro do `.md` é o que vai pra runtime.

---

## 2. `ciclo.py` — o loop

A função `rodar` é o coração. Sequência por iteração:

```
perceber → planejar → validar (circuit breaker) → executar → avaliar
```

A cada iteração, antes da próxima, o ciclo verifica:
- Excedeu `max_etapas`?
- Excedeu `limite_tempo_segundos`?
- Excedeu limite por ferramenta ou total?
- Está sem progresso (`sem_progresso` consecutivas)?

> Tudo o que está em `rules.md` é fiscalizado aqui — a cada passo.

`exibir_kpis` (também em `ciclo.py`) imprime o painel de KPIs ao final de cada etapa.

---

## 3. `planejador.py` — percepção e decisão

Duas funções principais:

**`perceber(estado)`** — monta a string de contexto para a LLM:
- alerta original (entrada do usuário)
- tipo do agente (`task_based`, `interactive`, etc)
- evento trigger (se modo `autonomous`)
- resultados anteriores do histórico
- ferramentas já usadas
- progresso (`etapa atual / max`)
- aviso de estagnação

> Se o contexto é ruim, a decisão é ruim. Percepção define qualidade.

**`chamar_llm(percepcao, contratos, historico)`** — monta o prompt de sistema com nome/descrição/objetivo do agente, lista de habilidades com entrada/saída, regras do `planner.md` e políticas do `rules.md`. Chama `gpt-4o-mini` em modo JSON e retorna `(plano, uso_tokens)`.

> Sem `OPENAI_API_KEY`, cai no `planejador_mock` — percorre as habilidades em ordem e simula decisões. Permite rodar sem gastar token.

---

## 4. `ferramentas.py` — construção automática de tools

A função `construir_ferramenta(habilidade)` recebe uma skill do `skills.md` e devolve uma função executável que:

1. Monta um prompt: "você é a ferramenta X, gere dados realistas"
2. Lista os campos de saída esperados (do contrato)
3. Chama a LLM pedindo JSON com esses campos
4. Retorna `{sucesso, dados, _tokens}`

> Você definiu o contrato da skill. O runtime gera a implementação. Em produção, troca a chamada à LLM por API real (Grafana, logs, etc.) — mas o contrato não muda.

---

## 5. `executor.py` — quatro responsabilidades

| Função | O que faz |
|--------|-----------|
| `executar_gancho(nome, contrato, **kwargs)` | dispara hooks (`log` imprime; `alerta` imprime com destaque) |
| `validar_payload(nome, args, contratos)` | confere tipo de cada argumento contra o `skills.md` |
| `executar(nome, args, ferramentas, contratos)` | chama a tool; se falhar e `executor.md.tentar_novamente_em_falha: true`, tenta de novo |
| `avaliar(plano, resultado, contratos)` | classifica `qualidade: completa | parcial | falha` e decide se o objetivo foi alcançado |

> A avaliação é o que fecha o feedback loop. Se a qualidade é "parcial", o histórico registra; o próximo `perceber` enxerga; e a LLM pode decidir diferente. Cada iteração melhora a decisão **porque o estado está melhor**.

---

## 6. Circuit breaker (em `ciclo.py`)

Antes de mandar pro executor, valida a resposta da LLM:

- `plano` é dict?
- `proxima_acao` é uma das três válidas (`CHAMAR_FERRAMENTA`, `FINALIZAR`, `PERGUNTAR_USUARIO`)?
- Se `CHAMAR_FERRAMENTA`: ferramenta existe na toolbox?
- Se `PERGUNTAR_USUARIO`: tem campo `pergunta`?

E tenta auto-corrigir antes de desistir:
- Ação inválida + ferramenta válida → corrige para `CHAMAR_FERRAMENTA`
- Ferramenta inexistente → substitui pela primeira não-usada
- Sem recuperação → encerra

> Tolerância a falhas — não do sistema, da LLM.

---

## 7. `telemetria.py` — observabilidade estruturada

A classe `Telemetria` acompanha a execução do início ao fim:

- `trace_id` único (12 chars hex)
- registra eventos com timestamp e tempo decorrido
- mede duração de cada fase (perceber, planejar, agir, avaliar)
- acumula tokens por chamada LLM
- conta sucesso/falha de ferramentas, ativações de circuit breaker, falhas de payload

E gera 4 saídas no `trace.json`:

| Saída | O que tem |
|-------|-----------|
| `telemetry_stream` | todos os eventos em ordem |
| `audit_logs` | só decisões e ações (filtrado) |
| `health_metrics` | taxa de sucesso, falhas, ativações |
| `performance_data` | tempo por fase com min, max, média |

> Cada evento tem `trace_id`. Cada fase tem duração em ms. Cada ferramenta tem taxa de sucesso. Se algo deu errado, o trace mostra onde, quando e por quê.

---

## O caminho completo de uma execução

Quando você roda:

```bash
python runtime/main.py rodar --agente monitor-agent --entrada "alerta de latencia"
```

Acontece, em ordem:

1. **`contratos.py`** carrega os 9 `.md` → dict com 9 chaves
2. **`criar_estado`** monta a folha em branco (limites, contadores, histórico vazio)
3. **`ferramentas.py`** lê os skills → 1 função executável por habilidade
4. **`telemetria.py`** inicializa com `trace_id` único
5. **Loop principal** (`ciclo.rodar`):
   - `perceber` monta contexto
   - `chamar_llm` envia pra LLM e recebe plano JSON
   - circuit breaker valida o plano
   - `validar_payload` checa argumentos contra schema
   - `executar` roda a ferramenta (com retry se configurado)
   - `avaliar` classifica qualidade
   - `telemetria` registra; KPIs aparecem no terminal
6. **Próxima iteração** com mais contexto, mais histórico, melhor decisão
7. Encerra ao atingir o objetivo **ou** um limite. `trace.json` salvo.

---

## Contrato vira código — exemplos diretos

| O que você escreveu na aula 3 | Onde o runtime lê |
|---|---|
| `rules.md → limites.max_etapas: 10` | `criar_estado` em `contratos.py`, depois `while etapa < max_etapas` em `ciclo.py` |
| `executor.md → tentar_novamente_em_falha: true` | função `executar` em `executor.py` faz retry |
| `hooks.md → em_erro: alerta` | `executar_gancho` em `executor.py` dispara o alerta |
| `skills.md → entrada: { nome_servico: string }` | `validar_payload` em `executor.py` checa o tipo |
| `rules.md → ferramentas_obrigatorias: [relatorio_incidente]` | enforcement em `ciclo.py` antes de aceitar `FINALIZAR` |
| `rules.md → politicas: [...]` | injetadas no prompt em `chamar_llm` (`planejador.py`) |

> Isso é spec-driven. A especificação dirige o comportamento. O código só obedece.

---

## Como rodar

Mesmo set de comandos da aula 3:

```bash
cd runtime
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia no servico de pagamentos"
python main.py validar --agente ../monitor-agent
python main.py rastreamento
```

A diferença não está no comando — está em saber **o que cada linha do trace mapeia** dentro dos 6 módulos. Esse é o desafio da aula:

> Abra `ciclo.py`, encontre a função `rodar`, identifique as 5 fases. Depois abra `trace.json` da última execução. Para cada etapa do trace, encontre o código que gerou aquela decisão. Se você consegue mapear trace pra código, sabe debugar qualquer agente.
