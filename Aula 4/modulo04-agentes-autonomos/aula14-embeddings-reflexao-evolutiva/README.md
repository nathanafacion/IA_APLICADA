# Aula 14 — Embeddings, memória contextual e reflexão evolutiva

> A aula 13 deixou `memory_store/contextual/` vazio — placeholder esperando implementação.
> Esta aula instala busca semântica de verdade (`embedding_adapter`) e adiciona o quarto pilar: **reflexão que aprende**.

Na aula 13 o agente passou a lembrar fatos (`longa`) e episódios (`episodica`) — mas a recuperação era por listagem temporal, não por similaridade. Se você grava "PostgreSQL trava em conexões longas" e na próxima execução chega "timeout no banco", o sistema não conecta os dois. **Falta busca semântica.**

E faltava também algo mais profundo: aprendizado generalizável. Episódio é "o que aconteceu". Lição é "o que aprender com isso". Esta aula traz o `reflection.md` — o agente extrai lições ao final de execuções inesperadas e injeta lições relevantes no prompt da próxima.

---

## O que tem de novo nesta aula

```
aula14/final/
├── monitor-agent/
│   ├── memory.md            ← inalterado (vem da aula 13)
│   ├── reflection.md        ← NOVO: critica + aprendizado (extracao + deteccao + injecao)
│   └── contracts/planner.md ← +contexto_enriquecido, +regras de uso de licoes
├── runtime/
│   ├── adapters/
│   │   ├── memory_adapter.py     ← inalterado
│   │   └── embedding_adapter.py  ← NOVO: indexar, buscar, reindexar
│   ├── contratos.py              ← inicializar_memoria pluga EmbeddingAdapter
│   └── ciclo.py                  ← +busca contextual em _recuperar_contexto
│                                 ← +_extrair_licoes ao final do ciclo
│                                 ← +_detectar_padroes (contador MVP)
├── memory_store/contextual/
│   └── indice.json          ← NOVO: indice JSON local de embeddings
└── reflection_store/        ← NOVO
    ├── licoes/              ← YAMLs lic_<hex>.yaml com {situacao, acao, resultado, licao}
    ├── padroes/             ← YAMLs de padroes detectados (MVP: vazio)
    └── meta.yaml            ← contador de execucoes pra detectar padroes
```

A aula 14 fecha a Unidade 4 do ponto de vista de capabilities — depois dela, a aula 15 cuida de evals.

---

## `embedding_adapter.py` — busca por similaridade

Em `runtime/adapters/embedding_adapter.py`. Três operações:

| Método | O que faz |
|--------|-----------|
| `indexar(texto, metadados=None)` | gera embedding via API (`text-embedding-3-small` por padrão) e grava no `indice.json` com texto, embedding e metadados |
| `buscar(consulta, max_resultados=None, limiar=None)` | embedda a consulta, calcula similaridade de cosseno contra todos os fragmentos, devolve os que passam do limiar ordenados |
| `reindexar(memory_adapter, tipos=None)` | reconstrói o índice a partir das memórias `longa` + `episodica` (útil quando muda o `modelo_embedding`) |

Configuração vem do `memory.md`:

```yaml
contextual:
  ativo: true
  tipo_implementacao: embedding
  diretorio: memory_store/contextual/
  modelo_embedding: text-embedding-3-small
  limiar_similaridade: 0.7
  max_fragmentos_por_consulta: 5
```

> O índice é JSON local, não vetorstore externa. Suficiente pra educacional e pra projetos pequenos. Em produção, troca por Chroma/Qdrant/pgvector — o contrato fica igual.

---

## Lazy reindex — o detalhe que faz funcionar na primeira execução

Na primeira execução depois de habilitar contextual, o `indice.json` não existe. Em vez de obrigar o aluno a rodar um script de setup, o `_recuperar_contexto` em `ciclo.py` faz **reindex automático**:

```python
config_contextual = tipos.get("contextual", {})
if config_contextual.get("ativo") and getattr(memory_adapter, "embedding_adapter", None):
    indice = memory_adapter.embedding_adapter._carregar_indice()
    if not indice:
        print("  [memoria] contextual: indice vazio, reindexando memorias...")
        total = memory_adapter.embedding_adapter.reindexar(memory_adapter)
        print(f"  [memoria] contextual: {total} fragmentos indexados")

    fragmentos = memory_adapter.embedding_adapter.buscar(entrada)
    if fragmentos:
        contexto["conhecimento_relevante"] = [
            {"texto": f["texto"], "similaridade": f["similaridade"]}
            for f in fragmentos
        ]
```

Próximas execuções leem o índice existente — reindex só roda quando ele está vazio.

---

## Pluging em `contratos.py`

`inicializar_memoria` passa a instanciar o `EmbeddingAdapter` e prendê-lo no `MemoryAdapter`:

```python
config_memoria["_caminho_agente"] = str(caminho_agente)

config_contextual = tipos_memoria.get("contextual", {})
if config_contextual.get("ativo"):
    from adapters.embedding_adapter import EmbeddingAdapter
    dir_ctx = config_contextual.get("diretorio", "memory_store/contextual/")
    dir_abs = (caminho_agente.parent / dir_ctx).resolve()
    config_contextual["diretorio"] = str(dir_abs)
    os.makedirs(dir_abs, exist_ok=True)
    adapter.embedding_adapter = EmbeddingAdapter(config_contextual)
```

O `inicializar_embedding` standalone (stub da aula 13) continua existindo — mas o caminho normal é via `inicializar_memoria`.

---

## `reflection.md` — crítica + aprendizado

A U2 já trouxe `critic.md`. Esta aula evolui para `reflection.md`, mantendo a crítica e adicionando **aprendizado**:

```yaml
critica:                  # igual ao critic.md da U2
  criterios: [...]
  limiar: 0.7
  max_reflexoes: 3
  formato: ...

aprendizado:              # NOVO
  ativo: true
  diretorio: reflection_store/

  extracao_licoes:
    quando: apos_finalizacao
    formato: situacao, acao, resultado, licao
    politicas:
      - so se resultado inesperado
      - generalizavel (nao especifica a um input)
      - max 3 por execucao
      - nunca secrets

  deteccao_padroes:
    quando: a_cada_10_execucoes
    formato: padrao, frequencia, impacto, ajuste_sugerido
    politicas:
      - so se 3+ ocorrencias

  injecao:
    onde: contexto_do_planner
    como: licoes_relevantes
    max_licoes_por_execucao: 5
    ordenar_por: relevancia_ao_objetivo
```

> Episódio é "como executei". Lição é "o que aprender". A política `só se resultado inesperado` é o que separa lição útil de ruído.

---

## Três pontos de integração de reflection no ciclo

### 1. Carregar lições em `_recuperar_contexto`

Antes do loop principal, lê `reflection_store/licoes/*.yaml`, ordena por `timestamp` (mais recentes), pega no máximo 5 e adiciona em `contexto["licoes_relevantes"]`. O `caminho_agente_str` vem de `config_memoria["_caminho_agente"]` (gravado pelo `inicializar_memoria`).

### 2. `_extrair_licoes` ao final do ciclo

Roda após `_persistir_memoria`. A heurística decide se vale extrair lição:

| Sinal | Condição |
|-------|----------|
| `houve_erros` | alguma chamada de tool com `sucesso=False` |
| `resultado_ruim` | resultado contém `falha`/`erro`/`nao conclu`/`nao resolv`/`excedido` |
| `etapas_demais` | `etapa > max_etapas * 0.8` |

Nenhum dos três? Imprime `[reflection] resultado esperado, sem licao extraida` e retorna — **não inventa lição**.

Sim? Monta prompt JSON pedindo até 3 lições no formato `{situacao, acao, resultado, licao}`, chama `_chamar_llm_json` (com `response_format={"type": "json_object"}`), filtra qualquer entrada que contenha `secret`/`token`/`password`/`senha`/`api_key` e grava como YAML em `reflection_store/licoes/lic_<hex>.yaml`.

### 3. `_detectar_padroes` — contador MVP

Mantém um contador em `reflection_store/meta.yaml`. A cada 10 execuções imprime:

```
[reflection] marco de N execucoes — detecao de padroes seria acionada aqui
```

Detecção real (agrupar lições por similaridade, consolidar via LLM, gravar em `padroes/`) fica como exercício. O contador é o gancho.

---

## Evolução do `planner.md`

Bloco novo `contexto_enriquecido` declara as fontes que o planner agora recebe, e regras dizem como usá-las:

```yaml
contexto_enriquecido:
  conhecimento_relevante: fragmentos da memoria contextual
  experiencia_anterior: resumos de episodios similares
  licoes_relevantes: licoes do reflection store
  fatos_conhecidos: entradas da memoria longa

regras:
  - considerar conhecimento_relevante antes de escolher ferramenta
  - se experiencia_anterior mostra que abordagem falhou, evita-la
  - se licoes_relevantes sugerem ajuste, aplicar
  - se fatos_conhecidos contradizem a entrada, perguntar ao usuario
```

> O planner não chama tool nenhuma de memória. Ele só **lê** o contexto que o runtime injetou — exatamente como na U1 lia `objetivo` e `formato_saida`.

---

## Como rodar

```bash
# 1. primeira execucao — dispara reindex automatico de memoria longa+episodica
python runtime/main.py rodar --agente monitor-agent --entrada "erro 500 no servico de pedidos"

# observe:
#   [memoria] contextual: indice vazio, reindexando memorias...
#   [memoria] contextual: N fragmentos indexados
#   [recuperar] conhecimento_relevante: N itens (com similaridade)

# 2. forcando extracao de licao (baixe max_etapas em rules.md temporariamente)
python runtime/main.py rodar --agente monitor-agent --entrada "alerta de cpu alta no servico novo"
# se max_etapas estourou:
#   [reflection] extraindo licoes... N gravadas
# se tudo correu bem:
#   [reflection] resultado esperado, sem licao extraida

# 3. proxima execucao — licoes injetadas no planner
python runtime/main.py rodar --agente monitor-agent --entrada "timeout no servico novo"
# observe:
#   [recuperar] licoes_relevantes: N itens
```

Pra confirmar a injeção, abra o trace e procure no prompt do planner uma seção tipo "Licoes aprendidas (reflection store)".

---

## Diagnóstico de busca semântica

| Sintoma | Ajuste em `memory.md` |
|---------|------------------------|
| Fragmentos irrelevantes vazando | aumentar `contextual.limiar_similaridade` |
| Pouca recuperação, contexto pobre | diminuir `contextual.limiar_similaridade` |
| Cabe muita coisa no prompt | reduzir `contextual.max_fragmentos_por_consulta` |
| Mudou modelo de embedding | rodar `reindexar` (varre `longa` + `episodica` de novo) |

> Limiar é tradeoff. 0.7 é seguro. Se está perdendo conexões óbvias, derrube pra 0.6. Se está injetando lixo, suba pra 0.8.

---

## Política contra ruído

Três defesas que diferenciam memória útil de lixão:

1. **Política `só extrair se resultado inesperado`** — heurística no `_extrair_licoes` antes de chamar LLM
2. **Política `generalizável`** — entra no prompt de extração; se a LLM retornar lição específica demais, é descartada
3. **Filtro de sensíveis** — `secret`/`token`/`password`/`senha`/`api_key` nunca chegam ao YAML

Se o `reflection_store/licoes/` enche de lição inútil, o problema está em uma dessas três — não no adapter.

---

## Fechamento

Com a aula 14, o monitor-agent tem os 4 pilares:

| Pilar | Origem | Granularidade |
|-------|--------|---------------|
| Memória curta | RAM, vive no estado do ciclo | etapa |
| Memória longa | `memory_store/longa/*.yaml` | fato |
| Memória episódica | `memory_store/episodica/*.yaml` | execução |
| Memória contextual | `memory_store/contextual/indice.json` | fragmento por similaridade |
| Reflexão | `reflection_store/licoes/*.yaml` | lição generalizável |

A aula 15 mede tudo isso com eval de impacto de memória.
