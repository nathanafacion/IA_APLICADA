# Aula 4 — Agentes Autônomos: do Contrato ao Runtime

Esta aula é focada na construção de **agentes autônomos orientados a contratos** — um paradigma onde o comportamento do agente é definido inteiramente por arquivos Markdown/YAML, e o runtime Python é agnóstico ao domínio. O aluno parte de contratos declarativos, abre o motor que os executa, adiciona observabilidade, múltiplas arquiteturas cognitivas, ferramentas reais, memória persistente e evals — tudo sem alterar o núcleo do runtime.

---

## 📂 Estrutura

```
Aula 4/
├── CriaLLM.txt/                     # Projeto entregável: runtime + agente de exemplo
│   ├── runtime/                     # Motor do agente (Python)
│   └── rota-monitor-agent/          # Agente de monitoramento de rotas (contratos + tools)
└── modulo04-agentes-autonomos/      # Evolução aula a aula (aula03 → aula15)
    ├── aula03-contratos/
    ├── aula04-runtime/
    ├── aula05-observabilidade/
    ├── aula06-tipos-agentes-e-projetos/
    ├── aula07-arquiteturas-cognitivas/
    ├── aula08-plan-execute-e-reflection/
    ├── aula09-evals-e-frameworks-mercado/
    ├── aula10-de-mock-para-real/
    ├── aula11-database-e-mcp/
    ├── aula12-tool-selection-eval/
    ├── aula13-agente-que-lembra/
    ├── aula14-embeddings-reflexao-evolutiva/
    └── aula15-evals-memoria/
```

---

## 🏗️ CriaLLM — o Projeto Entregável

### Por que o nome "CriaLLM.txt"?

O nome é uma referência direta ao padrão **`llms.txt`** — um arquivo de texto simples colocado na raiz de um site (ex.: `https://meusite.com/llms.txt`) que descreve as páginas e rotas do projeto em um formato que modelos de linguagem conseguem consumir com facilidade.

O problema que motiva o projeto é real: LLMs não navegam em sites como humanos. Ao responder perguntas sobre um produto, uma documentação ou um blog, o modelo precisa saber **o que existe no site** — quais páginas há, o que cada uma contém, como elas se relacionam. Sem isso, o modelo alucina URLs, descreve rotas que não existem ou ignora seções inteiras.

O `llms.txt` resolve isso da mesma forma que o `robots.txt` resolve a descoberta de conteúdo para crawlers de busca: é um contrato explícito, legível por máquina, que mapeia a estrutura do site. Com ele, ferramentas como Claude, ChatGPT, Copilot e agentes autônomos conseguem entender a arquitetura de um site **sem precisar fazer scraping página a página**.

O agente de exemplo (`rota-monitor-agent`) automatiza exatamente essa tarefa: dado o caminho raiz de um projeto **Jekyll, Next.js ou React Router**, ele detecta todas as páginas e rotas, gera um arquivo Markdown de documentação para cada uma e produz o `llms.txt` no padrão [llmstxt.org](https://llmstxt.org). O runtime CriaLLM é a infraestrutura genérica que executa esse agente — e qualquer outro que você queira criar.

---

O **CriaLLM** é um runtime de agentes autônomos que separa completamente o _o que o agente faz_ (contratos em Markdown) do _como ele faz_ (módulos Python). Criar um novo agente é apenas escrever arquivos `.md` — sem tocar no código do runtime.

Cada agente é uma pasta com até 7 arquivos de contrato:

| Arquivo       | Responsabilidade                                       |
| ------------- | ------------------------------------------------------ |
| `agent.md`    | Identidade, tipo e contrato de saída                   |
| `skills.md`   | Ferramentas disponíveis e suas interfaces              |
| `rules.md`    | Restrições, ferramentas obrigatórias e circuit breaker |
| `memory.md`   | Estratégia de memória                                  |
| `hooks.md`    | Ganchos de ciclo de vida                               |
| `commands.md` | Comandos aceitos via entrada                           |
| `contracts/`  | Contratos de planejador, executor, loop e toolbox      |

O agente exemplo (`rota-monitor-agent`) monitora a integridade de rotas de navegação em projetos Jekyll, Next.js e React Router, executando o ciclo **perceber → planejar → agir → avaliar** de forma autônoma.

- **Stack:** Python, OpenAI GPT-4o-mini (ou modo mock sem chave de API)
- **Conceito central:** Contract-Driven Agents — o runtime não sabe nada do domínio, só lê contratos

---

## 📚 Módulos da Aula

### Aula 3 — Os 9 contratos

Apresentação dos 9 arquivos que definem um agente (`agent.md`, `contracts/loop.md`, `contracts/planner.md`, `skills.md`, `contracts/toolbox.md`, `rules.md`, `contracts/executor.md`, `hooks.md`, `memory.md`). Cada arquivo responde uma pergunta sobre o agente — nenhum deles é código.

---

### Aula 4 — Por dentro do runtime

Abertura do motor Python: os 6 módulos (`contratos.py`, `ciclo.py`, `planejador.py`, `ferramentas.py`, `executor.py`, `telemetria.py`) e como cada linha de YAML escrita nos contratos tem uma linha de Python que a lê. O runtime não sabe nada sobre o agente — ele só sabe ler contratos e executar.

---

### Aula 5 — Observabilidade

Introdução do `trace-analyzer` — um segundo agente que analisa a execução de outro agente. Observabilidade em 4 níveis: saúde, performance, comportamento e conformidade. O log não basta em agentes; decisão precisa de rastreabilidade.

---

### Aula 6 — Tipos de agente e fechamento da Unidade 1

Apresentação dos 4 tipos de agente (`task_based`, `interactive`, `goal_oriented`, `autonomous`) e novo agente `backlog-decomposer` (tipo `goal_oriented`). O runtime injeta o tipo de agente no prompt da LLM — só isso já muda todo o comportamento. Fechamento com o ciclo completo de _contract-driven development_.

---

### Aula 7 — Arquiteturas cognitivas e ReAct

Introdução do slot de **arquitetura cognitiva** como contrato (`architectures/<nome>/planner.md` + `executor.md`). A primeira arquitetura concreta é o **ReAct**, que adiciona um campo `raciocínio` obrigatório ao formato de saída. O agente não muda; o runtime não tem `if/else` por arquitetura — Open-Closed Principle aplicado a agentes.

---

### Aula 8 — Plan-Execute e Reflection

Duas arquiteturas novas no mesmo slot:

- **Plan-Execute:** decide todo o plano no início, depois executa etapa a etapa
- **Reflection:** decide, critica com um `critic.md` e corrige antes de finalizar

Toda evolução acontece em `architectures/` e em duas funções do runtime — sem mexer em `contratos.py` ou `main.py`.

---

### Aula 9 — Evals, equivalências e fechamento da Unidade 2

Transformação das 4 arquiteturas em **evidência comparável**: dataset de incidentes, eval suite com limiares e benchmark engine que roda `padrão`, `react`, `plan_execute` e `reflect` contra o mesmo dataset e gera relatório Markdown. Equivalências com LangChain/LangGraph e checklist de portfólio.

> "ReAct ganha em cobertura mas Plan-Execute custa metade dos tokens."

---

### Aula 10 — De mock para real: padrão Adapter e tools REST

Introdução do **padrão Adapter** no runtime: a habilidade declara `tipo_implementacao: rest`, o runtime resolve dinamicamente qual adapter chamar, e o adapter faz HTTP. API local em FastAPI com 3 endpoints (`/metrics`, `/logs`, `/deploys`). Mock continua sendo o default — quem não tem API real segue funcionando.

---

### Aula 11 — Database, segurança e MCP

Dois novos adapters (`db_adapter.py` com 3 regras de segurança: read-only, parametrização, LIMIT; e `mcp_adapter.py` via SDK oficial MCP). Segurança declarada no contrato: rate limit global, políticas de `rules.md`, hooks que fiscalizam em runtime. O `monitor-agent` termina com 6 ferramentas e 4 tipos de adapter rodando simultaneamente.

---

### Aula 12 — Tool selection eval e fechamento da Unidade 3

Eval dedicado à precisão de seleção de ferramentas: dataset com gabarito explícito, 4 métricas (`accuracy`, `arg_accuracy`, `false_positive_rate`, `rank`) e dois subcomandos na CLI (`tool-eval`, `tool-eval-comparar`). Ajustar a `descricao` de uma skill em uma frase pode subir a accuracy 20 pontos.

---

### Aula 13 — O agente que lembra: 4 tipos de memória

Instalação de **memória real** no agente — quatro tipos com contrato e diretório próprio:

| Tipo         | Descrição                                   |
| ------------ | ------------------------------------------- |
| `curta`      | Estado da execução atual (limpo entre runs) |
| `longa`      | Fatos persistentes em YAML                  |
| `episodica`  | Resumos de execuções passadas               |
| `contextual` | Reservado para embeddings (aula 14)         |

Novo `memory_adapter.py` com 5 operações. O runtime continua agnóstico: lê `tipos_memoria` do contrato e instancia o adapter.

---

### Aula 14 — Embeddings, memória contextual e reflexão evolutiva

**Busca semântica real** com `embedding_adapter.py` (indexar, buscar, reindexar). Preenche o `memory_store/contextual/` com um índice JSON local de embeddings. Novo `reflection.md` para **reflexão evolutiva**: o agente extrai lições ao final de execuções inesperadas e injeta lições relevantes no prompt da próxima execução. Episódio é "o que aconteceu"; lição é "o que aprender com isso".

---

### Aula 15 — Evals de memória e fechamento da Unidade 4

Fechar o ciclo com **evidência de que a memória está ajudando**: dataset de impacto, suite com 6 métricas, comparação `com vs sem memória` e relatório gerado a cada execução. A flag `MEMORY_DISABLED=1` permite rodar o mesmo caso duas vezes para comparação direta. Pergunta central: _a memória instalada está realmente melhorando as decisões do agente?_

---

## 🔑 Conceitos-chave da Aula 4

| Conceito                                       | O que é                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Contract-Driven Agents**                     | Agente definido por contratos Markdown; runtime agnóstico ao domínio                      |
| **Ciclo perceber → planejar → agir → avaliar** | Loop de execução com circuit breaker e condições de parada declarativas                   |
| **Arquitetura cognitiva**                      | Contrato que sobrescreve como o agente raciocina (ReAct, Plan-Execute, Reflection)        |
| **Adapter Pattern**                            | `tipo_implementacao` no contrato; runtime despacha; adapter conecta (REST, DB, MCP, Mock) |
| **Memória em 4 tipos**                         | Curta, longa, episódica e contextual com busca semântica por embeddings                   |
| **Reflexão evolutiva**                         | Extração de lições de execuções passadas e injeção no contexto futuro                     |
| **Evals como prática**                         | Benchmark de arquiteturas, tool selection eval, memory impact eval — tudo mensurável      |

---

## 🚀 Como executar o CriaLLM

```bash
cd "Aula 4/CriaLLM.txt/runtime"
pip install -r requirements.txt

# Rodar o agente (modo mock, sem chave de API)
python main.py rodar --agente ../rota-monitor-agent --entrada "caminho/para/seu/projeto"

# Validar contratos
python main.py validar --agente ../rota-monitor-agent

# Ver rastreamento
python main.py rastreamento
```

Para usar GPT-4o-mini real, copie `.env.example` para `.env` e preencha `OPENAI_API_KEY`.
