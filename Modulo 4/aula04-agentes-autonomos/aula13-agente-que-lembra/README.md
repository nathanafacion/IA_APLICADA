# Aula 13 — O agente que lembra: 4 tipos de memória

> Até aqui o agente esquecia tudo entre execuções. Cada `rodar` começava do zero.
> Esta aula instala memória de verdade — quatro tipos, cada um com contrato e diretório próprio.

A Unidade 3 fechou o agente conectado a tools reais (REST, DB, MCP) através de adapters. O agente decidia bem dentro de uma execução, mas a próxima começava em folha em branco. **Memória curta sozinha não basta** — em produção, o agente precisa lembrar o que descobriu ontem, generalizar do que já viu antes e pular etapas redundantes.

Esta aula evolui o `memory.md` para 4 tipos de memória, instala o `memory_adapter.py` (mesmo padrão dos tool adapters da U3) e cria o `memory_store/` com 4 subdiretórios. O runtime continua agnóstico: lê `tipos_memoria` do contrato e instancia o adapter — não sabe nada sobre incidente, latência ou serviço.

---

## O que tem de novo nesta aula

```
aula13/final/
├── monitor-agent/
│   ├── memory.md            ← REESCRITO: 4 tipos de memória (curta, longa, episodica, contextual)
│   ├── hooks.md             ← +4 hooks de memória (antes/apos recuperar/persistir)
│   ├── rules.md             ← +politicas_memoria (governanca)
│   └── ... (resto inalterado da U3)
├── runtime/
│   ├── adapters/
│   │   └── memory_adapter.py  ← NOVO: 5 operações (gravar, recuperar, atualizar, remover, listar)
│   ├── contratos.py           ← +inicializar_memoria, +inicializar_embedding
│   └── ciclo.py               ← +_recuperar_contexto (antes do loop), +_persistir_memoria (após o loop)
├── memory_store/              ← NOVO
│   ├── curta/                 ← estado da execução atual (limpo entre runs)
│   ├── longa/                 ← fatos persistentes em YAML
│   ├── episodica/             ← resumos de execuções passadas em YAML
│   └── contextual/            ← reservado pra embeddings (entra na aula 14)
└── ... (api_local, mcp, evals, trace-analyzer, backlog-decomposer da U3 inalterados)
```

A pasta `memory_store/contextual/` já existe, mas só vai ser populada na aula 14, quando o `embedding_adapter` entra. Aqui ela fica vazia — placeholder do contrato.

---

## Os 4 tipos de memória

> O `memory.md` da U1 falava de "memoria curta" como se fosse a única. Não é.

| Tipo | `tipo_implementacao` | Pergunta que responde | Onde mora |
|------|---------------------|------------------------|-----------|
| `curta` | `local` | O que aconteceu nessa execução? | em RAM, vive enquanto o ciclo roda |
| `longa` | `arquivo` | Que fatos confirmados eu já vi? | `memory_store/longa/*.yaml` |
| `episodica` | `arquivo` | Como executei isso da última vez? | `memory_store/episodica/*.yaml` |
| `contextual` | `embedding` | Que conhecimento é semanticamente parecido? | `memory_store/contextual/` (aula 14) |

Bloco do contrato (recorte do `monitor-agent/memory.md`):

```yaml
tipos_memoria:
  curta:
    ativo: true
    tipo_implementacao: local
    guardar: [resultado_de_ferramenta, decisao, evidencia, erro]
    descartar: [prompt_sistema, args_mock, dados_repetidos]
    max_registros: 20

  longa:
    ativo: true
    tipo_implementacao: arquivo
    diretorio: memory_store/longa/
    formato: yaml
    max_entradas: 500
    politicas:
      - so gravar fato se confirmado por evidencia de tool
      - atualizar fato existente em vez de duplicar
      - remover fato se contradito por evidencia mais recente
      - nunca gravar dados sensiveis (secrets, tokens, senhas)

  episodica:
    ativo: true
    tipo_implementacao: arquivo
    diretorio: memory_store/episodica/
    max_episodios: 100
    resumo_por_episodio:
      campos: [objetivo, etapas, ferramentas, resultado, erros, licoes]

  contextual:
    ativo: true
    tipo_implementacao: embedding
    diretorio: memory_store/contextual/
    modelo_embedding: text-embedding-3-small
    limiar_similaridade: 0.7
```

> Política não é decoração. É instrução pra LLM. "só gravar fato se confirmado por evidência de tool" entra no prompt e impede a memória de virar lixão.

---

## `memory_adapter.py` — 5 operações, mesmo padrão dos tool adapters

Em `runtime/adapters/memory_adapter.py`. A classe `MemoryAdapter` recebe `config_memoria` (o dict do `memory.md`) e expõe:

| Método | O que faz |
|--------|-----------|
| `gravar(tipo, conteudo)` | gera id + timestamp, salva como YAML em `memory_store/<tipo>/` |
| `recuperar(tipo, filtro=None)` | lê o diretório do tipo, aplica filtro opcional, devolve lista |
| `atualizar(tipo, id_registro, novo)` | reescreve preservando id e `criado_em`, atualiza `atualizado_em` |
| `remover(tipo, id_registro)` | apaga o arquivo |
| `listar(tipo)` | lista metadados (id, timestamp) sem carregar conteúdo |

Três regras inegociáveis do adapter:

> **O adapter NÃO decide o que guardar.** Política mora no `memory.md`.
> **O adapter NÃO valida se o fato é verdade.** O harness compara com o resultado de tools.
> **O adapter SÓ conecta** — mesmo padrão dos `rest_adapter.py`, `db_adapter.py`, `mcp_adapter.py` da U3.

---

## Hooks de memória

`monitor-agent/hooks.md` ganha 4 ganchos novos, que disparam em volta das operações de gravar/recuperar:

```yaml
antes_de_recuperar_contexto:
  - log
  - verificar_cache_embedding

apos_recuperar_contexto:
  - log
  - registrar_fragmentos_recuperados
  - verificar_relevancia_minima

antes_de_persistir_memoria:
  - log
  - validar_conteudo_contra_politicas
  - verificar_duplicata

apos_persistir_memoria:
  - log
  - confirmar_gravacao
```

Ficam ao lado dos hooks de etapa/ação da U1. O ciclo dispara um par antes do loop principal (recuperar) e outro par depois (persistir).

---

## Políticas em `rules.md`

Bloco novo `politicas_memoria` no `monitor-agent/rules.md`:

```yaml
politicas_memoria:
  - nunca gravar secrets, tokens ou senhas em nenhum tipo de memoria
  - memoria longa so aceita fatos confirmados por evidencia de tool
  - memoria episodica deve ser resumida, nunca trace completo
  - embeddings devem ser regenerados se o modelo de embedding mudar
  - licoes de reflection devem ser generalizaveis, nao especificas
  - se o agente recupera contextos contraditorios, perguntar ao usuario
  - max tokens de contexto recuperado por execucao: 2000
  - memorias com mais de 90 dias sem acesso podem ser arquivadas
```

Vai pro prompt do planner do mesmo jeito que `politicas` da U1 — texto livre injetado, não interpretado pelo runtime.

---

## Integração no `runtime/`

Duas funções novas em `contratos.py` e dois pontos de integração em `ciclo.py`. **O runtime continua sem saber nada do domínio.**

### `contratos.py` — inicialização

```python
def inicializar_memoria(contratos: dict, caminho_agente: Path) -> tuple:
    """Inicializa memory adapter a partir do contrato memory.md.
    Retorna (memory_adapter, config_memoria) ou (None, {}).
    Backward compatible: sem tipos_memoria, retorna None.
    """
    config_memoria = contratos.get("memoria", {})
    tipos_memoria = config_memoria.get("tipos_memoria")
    if not tipos_memoria:
        return None, config_memoria

    # resolve diretorios relativos ao agente e cria se faltar
    for tipo, config in tipos_memoria.items():
        if isinstance(config, dict) and "diretorio" in config:
            dir_abs = (caminho_agente.parent / config["diretorio"]).resolve()
            config["diretorio"] = str(dir_abs)
            os.makedirs(dir_abs, exist_ok=True)

    from adapters.memory_adapter import MemoryAdapter
    return MemoryAdapter(config_memoria), config_memoria
```

`inicializar_embedding` é stub aqui — só checa `contextual.ativo` e tenta importar o `EmbeddingAdapter`. Implementação real chega na aula 14.

### `ciclo.py` — dois pontos de integração

| Quando | Função | O que faz |
|--------|--------|-----------|
| **Antes** do loop principal | `_recuperar_contexto` | lê `longa` (últimos 10 fatos) e `episodica` (últimos 5 resumos) e devolve dict pra entrar na percepção |
| **Depois** do loop principal | `_persistir_memoria` | monta resumo do episódio (`objetivo`, `etapas_executadas`, `ferramentas_chamadas`, `resultado_final`, `erros_encontrados`) e grava em `memory_store/episodica/` |

Em volta de cada um, dispara o par de hooks correspondente.

> Se o `memory.md` do agente não tem `tipos_memoria`, `inicializar_memoria` devolve `(None, {})` e o ciclo segue exatamente como na U1. **Memória é opt-in.**

---

## Como rodar

Mesmo CLI da U3, comportamento muda conforme o contrato:

```bash
# 1. primeira execucao — memoria vazia, sem contexto recuperado
python runtime/main.py rodar --agente monitor-agent --entrada "alerta de latencia no servico de pagamentos"

# verifique:
#   memory_store/longa/      → fatos confirmados gravados
#   memory_store/episodica/  → 1 resumo do episodio
#   no terminal: [memoria] episodio gravado (N etapas)

# 2. segunda execucao — agente recupera fatos + episodio anterior
python runtime/main.py rodar --agente monitor-agent --entrada "erro 500 no servico de pagamentos"

# verifique no inicio:
#   --- Contexto de Memoria ---
#   fatos_conhecidos: N itens
#   experiencia_anterior: 1 itens
```

Comparação típica entre as duas execuções:

| | 1ª execução (sem memória) | 2ª execução (com memória) |
|---|--------------------------|--------------------------|
| Contexto prévio | nenhum | fatos + episódio |
| Etapas | fluxo completo de coleta | tende a tomar atalho |
| Decisão da LLM | escolhe da estaca zero | já vê histórico relevante |

Se a segunda execução não muda em nada, confira: `longa.ativo: true`, `episodica.ativo: true`, e se o ciclo está chamando `_recuperar_contexto` antes do loop.

---

## Por que isso importa

Sem memória, o agente é amnésico — investiga o mesmo serviço dez vezes do zero. Com memória estruturada por contrato, cada execução acumula evidência: fatos confirmados em `longa`, padrões em `episodica`, conhecimento semântico em `contextual` (aula 14), lições generalizáveis em `reflection_store/` (também aula 14).

> Memória não é cache. É contexto filtrado, governado por política, gravado por adapter, recuperado pelo runtime — sem o agente saber de onde veio.
