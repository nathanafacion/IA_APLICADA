# Aula 8 — Plan-Execute e Reflection

> ReAct decide um passo por vez. Plan-Execute decide tudo no início. Reflection decide, critica e corrige antes de finalizar.

A aula 7 entregou o slot de arquitetura e a primeira implementação (ReAct). Esta aula encaixa duas arquiteturas a mais nesse mesmo slot — sem mexer em `contratos.py`, sem mexer em `main.py`. Toda a evolução acontece em `architectures/` e em duas funções do `runtime/`: a fase **PLANEJAR** do `ciclo.py` e o `planejador_mock` do `planejador.py`.

> O runtime continua agnóstico. Plan-Execute é detectado por `modo_execucao: plan_execute` no contrato. Reflection é detectado pela presença de `critic.md` na pasta da arquitetura.

---

## O que tem de novo nesta aula

```
aula8/
├── monitor-agent/                ← inalterado
├── trace-analyzer/               ← inalterado
├── backlog-decomposer/           ← inalterado
├── architectures/
│   ├── react/                    ← vem da aula 7
│   ├── plan_execute/             ← NOVO
│   │   ├── planner.md            ← formato_saida com plano_completo + modo_execucao
│   │   └── executor.md           ← idêntico ao base
│   └── reflect/                  ← NOVO
│       ├── planner.md            ← formato_saida base + regras de reflexão
│       ├── executor.md
│       └── critic.md             ← critérios + limiar_aprovacao + max_reflexoes
└── runtime/
    ├── ciclo.py                  ← fase PLANEJAR reescrita + nova função _executar_critica + fase REFLEXÃO
    └── planejador.py             ← bloco plan_execute no mock
```

`contratos.py` e `main.py` ficam intactos: o slot de `critic.md` já foi previsto na aula 7, a flag `--arquitetura` já existe.

---

## Plan-Execute — uma chamada à LLM, N execuções

A ideia: a LLM gera um plano com **todos os passos** na primeira etapa, o runtime executa o plano sequencialmente sem chamar a LLM de novo. `tokens=0` nas etapas seguintes.

### O contrato

`architectures/plan_execute/planner.md`:

```yaml
modo_execucao: plan_execute

formato_saida:
  plano_completo: obrigatório (lista de passos ordenados)
  proxima_acao: CHAMAR_FERRAMENTA | FINALIZAR
  nome_ferramenta: obrigatório
  argumentos_ferramenta: obrigatório
  criterio_sucesso: obrigatório

regras:
  - gerar o plano COMPLETO na primeira chamada
  - cada passo do plano deve ter: objetivo, ferramenta, argumentos_ferramenta, criterio_sucesso
  - ordenar os passos pela dependência lógica
  - o primeiro passo do plano deve ser retornado como proxima_acao
```

`modo_execucao: plan_execute` é a chave que o runtime detecta.

### O que muda no `planejador_mock`

Antes do bloco de modo `interactive`, um novo bloco intercepta o caso "primeira chamada com `modo_execucao: plan_execute`":

```python
modo_execucao = contratos.get("planejador", {}).get("modo_execucao")
if modo_execucao == "plan_execute" and not histórico:
    passos = []
    for i, nome in enumerate(nomes_ferramentas, 1):
        habilidade = next((h for h in habilidades if h["nome"] == nome), {})
        passos.append({
            "passo": i,
            "objetivo": f"executar {nome}",
            "ferramenta": nome,
            "argumentos_ferramenta": montar_argumentos_mock(habilidade, []),
            "criterio_sucesso": f"{nome} executado com dados coletados",
        })
    primeiro_passo = passos[0]
    return {
        "plano_completo": passos,
        "proxima_acao": "CHAMAR_FERRAMENTA",
        "nome_ferramenta": primeiro_passo["ferramenta"],
        ...
    }
```

### O que muda na fase PLANEJAR do `ciclo.py`

A fase virou um `if/else`:

| Ramo | Quando | O que faz |
|------|--------|-----------|
| `if modo_execucao == "plan_execute" and plano_armazenado` | etapas 2, 3, ... | `pop(0)` do plano armazenado, monta `plano` local, `uso_tokens_plano = _TOKENS_ZERO.copy()` |
| `else` | primeira etapa OU outra arquitetura | chama `chamar_llm` normalmente; se vier `plano_completo`, guarda `passos[1:]` em `estado["plano_completo"]` |

> A LLM só é chamada uma vez. Nas etapas seguintes, o runtime imprime `[plan_execute] seguindo plano: passo 2/3 — buscar_logs (...ms, tokens=0)` e segue sem custo.

Importação adicional no topo do `ciclo.py`:

```python
from planejador import _TOKENS_ZERO, chamar_llm, perceber
```

---

## Reflection — execute, critique, improve, finalize

Reflection adiciona uma fase nova: antes de `FINALIZAR`, o agente submete o resultado a um **crítico**. Se a nota fica abaixo do limiar, o ciclo rejeita o `FINALIZAR`, escolhe uma ferramenta de correção e continua.

### Os 3 contratos da arquitetura

| Arquivo | Papel |
|---------|-------|
| `architectures/reflect/planner.md` | igual ao base, com regras orientando o planejador a aceitar feedback do crítico |
| `architectures/reflect/executor.md` | igual ao base — a crítica acontece no `ciclo.py`, não no executor |
| `architectures/reflect/critic.md` | **novo slot** — define os critérios, o `limiar_aprovacao`, o `max_reflexoes` e o `formato_critica` |

Conteúdo do `critic.md`:

```yaml
critérios:
  - corretude: as evidências sustentam o diagnóstico?
  - completude: todas as fontes relevantes foram consultadas?
  - qualidade_evidencia: os dados são específicos ou genéricos demais?

limiar_aprovacao: 70
max_reflexoes: 2

formato_critica:
  nota: int (0-100)
  aprovado: bool
  problemas: lista de problemas encontrados
  sugestões: lista de ações para melhorar
```

> Sem crítico, o agente entrega o que tem. Com crítico, o agente entrega o melhor que consegue — dentro de `max_reflexoes` rodadas.

### A nova função `_executar_critica` (em `ciclo.py`)

Inserida entre `gerar_resumo_final()` e `rodar()`. Duas implementações em uma:

| Cenário | Comportamento |
|---------|---------------|
| `OPENAI_API_KEY` presente | monta prompt de crítica com o histórico do agente, formata os critérios do contrato, pede JSON com `nota`, `aprovado`, `problemas`, `sugestões` |
| sem chave (mock) | primeira reflexão devolve `nota=55, aprovado=False` com problemas concretos; segunda devolve `nota=85, aprovado=True` |

O mock simula o ciclo realista **rejeita → corrige → aprova** sem custo de LLM.

### A fase REFLEXÃO no loop principal

Inserida entre o enforcement de ferramentas obrigatórias e a fase **AGIR**:

```python
contrato_critico = contratos.get("crítico")
if plano.get("proxima_acao") == "FINALIZAR" and contrato_critico:
    if reflexoes_feitas < max_reflexoes:
        crítica = _executar_critica(estado, contratos, contrato_critico)
        if aprovado or nota >= limiar:
            print(f"  [reflexão] aprovado! nota={nota}/100")
        else:
            estado["reflexoes_feitas"] += 1
            # procura nas sugestões do crítico uma ferramenta existente para chamar
            # SOBRESCREVE o plano de FINALIZAR para CHAMAR_FERRAMENTA
            ...
```

> Só dispara quando o planejador quer `FINALIZAR` **e** existe `contrato_critico`. Para `react` e `plan_execute`, o bloco inteiro é ignorado — o `contratos.get("crítico")` devolve `None`.

Fluxo típico no mock:

```
Etapa 1: consultar_metricas
Etapa 2: buscar_logs
Etapa 3: relatorio_incidente → FINALIZAR
   [reflexão] rejeitado. nota=55/100, limiar=70
     problema: evidências de métricas coletadas mas não cruzadas com logs
     sugestão: chamar buscar_logs com janela mais ampla...
   [reflexão] redirecionando para: buscar_logs
Etapa 4: buscar_logs (correção) → FINALIZAR
   [reflexão] aprovado! nota=85/100
```

---

## As 3 arquiteturas em uma tabela

| Arquitetura | Sinal no contrato | LLM por etapa | Fase extra | Quando usar |
|-------------|-------------------|---------------|------------|-------------|
| `react` | `formato_saida.raciocínio: obrigatório` | 1 | — | quando você quer auditar a decisão passo a passo |
| `plan_execute` | `modo_execucao: plan_execute` | 1 (só na primeira) | — | quando o pipeline é determinístico e tokens importam |
| `reflect` | existência de `critic.md` | 1 + crítica | reflexão | quando completude/qualidade do output é crítica |

> Mesmo `monitor-agent`. Mesmo `runtime`. Mesmo loop `perceber → planejar → agir → avaliar`. O comportamento muda inteiro pela flag `--arquitetura`.

---

## Como rodar

A partir de `runtime/`:

```bash
# baseline (sem arquitetura)
python main.py rodar --agente ../monitor-agent --entrada "alerta de cpu alta no serviço X"

# ReAct (raciocínio em cada etapa)
python main.py rodar --agente ../monitor-agent --entrada "alerta de cpu alta no serviço X" --arquitetura react

# Plan-Execute (uma LLM call, depois tokens=0 nas etapas seguintes)
python main.py rodar --agente ../monitor-agent --entrada "alerta de cpu alta no serviço X" --arquitetura plan_execute

# Reflection (rejeita o primeiro FINALIZAR, corrige, aprova)
python main.py rodar --agente ../monitor-agent --entrada "alerta de cpu alta no serviço X" --arquitetura reflect
```

O que observar em cada caso:

| Comando | Sinais no terminal |
|---------|---------------------|
| `--arquitetura plan_execute` | etapa 1: `[plan_execute] plano gerado com 3 passos`. Etapas 2+: `[plan_execute] seguindo plano: passo 2/3 — buscar_logs (... tokens=0)` |
| `--arquitetura reflect` | ao tentar `FINALIZAR`: `[reflexão] rejeitado. nota=55/100`, lista de `problema:` e `sugestão:`, `[reflexão] redirecionando para: ...`. Próxima rodada: `[reflexão] aprovado!` |

---

## Princípio arquitetural

> A arquitetura cognitiva modifica APENAS os contratos. O runtime não tem `if/else` por nome de arquitetura — ele responde a sinais (`modo_execucao`, presença de `critic.md`, `formato_saida` com campos extras). Isso é Open-Closed Principle. A próxima arquitetura que você inventar não muda o runtime — só adiciona uma pasta nova em `architectures/`.

---

## Desafio da aula

1. Rode os 4 cenários acima. Anote tokens consumidos e número de etapas em cada.
2. Abra `architectures/reflect/critic.md` e baixe `limiar_aprovacao` para `50`. Rode de novo. O agente passa pela crítica de primeira?
3. Crie `architectures/reflect-strict/` copiando `reflect/`, mude `limiar_aprovacao: 95` e `max_reflexoes: 3`. Rode com `--arquitetura reflect-strict`. O runtime não precisou ser modificado — confirma?

> Se você adicionou uma arquitetura nova sem tocar em Python, o spec-driven está consolidado.
