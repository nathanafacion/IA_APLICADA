# CriaLLM — Runtime de Agentes Autônomos

> Infraestrutura genérica para criar, configurar e executar agentes autônomos orientados a contratos, com suporte a OpenAI GPT-4o-mini e modo mock sem chave de API.

Para um mergulho completo nos conceitos por trás deste projeto, leia o post:
**[Do Mock ao Real: construindo um runtime de agentes autônomos](https://nathanafacion.github.io/2026/05/10/runtime-agentes-autonomos.html)**

---

## O que é este projeto

CriaLLM é um **runtime de agentes autônomos** baseado em contratos YAML declarados em arquivos Markdown. A ideia central é separar o _o que o agente faz_ (contratos) do _como ele faz_ (runtime), permitindo criar novos agentes apenas escrevendo arquivos `.md` — sem alterar o código do runtime.

Cada agente é uma pasta com até 7 arquivos de contrato:

| Arquivo       | Responsabilidade                                       |
| ------------- | ------------------------------------------------------ |
| `agent.md`    | Identidade, tipo e contrato de saída                   |
| `skills.md`   | Ferramentas disponíveis e suas interfaces              |
| `rules.md`    | Restrições, ferramentas obrigatórias e circuit breaker |
| `memory.md`   | Estratégia de memória do agente                        |
| `hooks.md`    | Ganchos de ciclo de vida (antes/após cada etapa)       |
| `commands.md` | Comandos aceitos via entrada                           |
| `contracts/`  | Contratos de planejador, executor, loop e toolbox      |

O runtime lê esses contratos, monta o ciclo **perceber → planejar → agir → avaliar** e executa automaticamente.

---

## Estrutura do projeto

```
CriaLLM.txt/
├── runtime/               # Motor do agente (não precisa ser alterado)
│   ├── main.py            # CLI: rodar, validar, rastreamento, analisar, replay
│   ├── ciclo.py           # Orquestrador do ciclo de execução
│   ├── contratos.py       # Carregamento e parsing dos contratos YAML
│   ├── planejador.py      # Percepção + chamada à LLM (ou mock)
│   ├── executor.py        # Execução de ferramentas com retry e validação
│   ├── ferramentas.py     # Builder de ferramentas a partir dos contratos
│   ├── validador.py       # Validação de consistência dos contratos
│   ├── telemetria.py      # Telemetria, KPIs e rastreamento
│   ├── requirements.txt
│   └── .env.example
│
└── rota-monitor-agent/    # Exemplo de agente pronto para uso
    ├── agent.md
    ├── skills.md
    ├── rules.md
    ├── memory.md
    ├── hooks.md
    ├── commands.md
    ├── tools.py            # Implementações reais das ferramentas
    └── contracts/
        ├── loop.md
        ├── planner.md
        ├── executor.md
        └── toolbox.md
```

---

## Instalação

```bash
cd runtime
pip install -r requirements.txt
```

Crie um arquivo `.env` (opcional — sem ele o agente roda em modo mock):

```bash
cp .env.example .env
# edite .env e coloque sua chave:
# OPENAI_API_KEY=sk-...
```

---

## Como usar

### Rodar um agente

```bash
python main.py rodar --agente ../rota-monitor-agent --entrada "caminho/para/seu/projeto"
```

O argumento `--entrada` é passado ao agente como contexto inicial. Para o `rota-monitor-agent`, deve ser o caminho raiz de um projeto Jekyll, Next.js ou React Router.

### Validar os contratos de um agente

```bash
python main.py validar --agente ../rota-monitor-agent
```

### Ver o rastreamento da última execução

```bash
python main.py rastreamento
```

### Analisar o trace salvo

```bash
python main.py analisar
```

### Replay de uma execução anterior

```bash
python main.py replay
```

---

## O agente incluído: `rota-monitor-agent`

Agente autônomo que documenta automaticamente todas as páginas de um projeto web.

**Suporte:** Jekyll · Next.js (App Router e Pages Router) · React Router

**O que ele faz em 3 etapas:**

1. **`detectar_paginas`** — varre o projeto, identifica o tipo (Jekyll/Next.js/React), extrai rotas, títulos e descrições do frontmatter de cada página
2. **`gerar_md`** — gera um arquivo `.md` por página com título e descrição reais
3. **`gerar_llms_txt`** — gera o arquivo `llms.txt` no padrão [llmstxt.org](https://llmstxt.org) com todas as rotas, seguindo o formato oficial: H1 com nome do site, blockquote com descrição e lista `- [Título](url): descrição` por página

**Exemplo de execução contra um site Jekyll:**

```bash
python main.py rodar --agente ../rota-monitor-agent --entrada "C:\caminho\para\seu-site"
```

Saída gerada em `seu-site/public/`:

```
public/
├── pagina_index.md
├── pagina_projetos.md
├── pagina_blog_nome-do-post.md
├── ...
└── llms.txt
```

---

## Criando seu próprio agente

1. Crie uma pasta com o nome do agente
2. Copie os arquivos de `rota-monitor-agent` como ponto de partida
3. Edite `agent.md` com o objetivo do seu agente
4. Edite `skills.md` com as ferramentas que ele precisa
5. Crie um `tools.py` com as implementações reais (opcional — sem ele, o runtime usa a LLM para simular cada ferramenta)
6. Rode:

```bash
python main.py validar --agente ../seu-agente
python main.py rodar --agente ../seu-agente --entrada "sua-entrada"
```

---

## Modo mock vs modo real

|                                | Sem `OPENAI_API_KEY`                                | Com `OPENAI_API_KEY`  |
| ------------------------------ | --------------------------------------------------- | --------------------- |
| **Planejador**                 | Mock determinístico (percorre ferramentas em ordem) | GPT-4o-mini           |
| **Ferramentas sem `tools.py`** | LLM gera o retorno simulado                         | GPT-4o-mini           |
| **Ferramentas com `tools.py`** | Código real executado                               | Código real executado |

---

## Mais informações

Post completo com a explicação da arquitetura, decisões de design e exemplos:

👉 [Do Mock ao Real: construindo um runtime de agentes autônomos](https://nathanafacion.github.io/2026/05/10/runtime-agentes-autonomos.html)
