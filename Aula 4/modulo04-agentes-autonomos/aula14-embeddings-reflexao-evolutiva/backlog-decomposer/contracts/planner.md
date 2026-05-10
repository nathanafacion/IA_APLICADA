# planejador.md

> Define como a LLM decide.
> Contrato, nao prompt.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `formato_saida` | objeto | Estrutura JSON que a LLM deve retornar. |
| `contexto_enriquecido` | objeto | NOVO na Unidade 4. Fragmentos recuperados da memoria (longa, episodica, contextual) e licoes do reflection store que o planner deve considerar antes de decidir. |
| `regras` | lista | Instrucoes injetadas no prompt da LLM. |

---

```yaml
formato_saida:
  proxima_acao: CHAMAR_FERRAMENTA | FINALIZAR | PERGUNTAR_USUARIO
  nome_ferramenta: opcional
  argumentos_ferramenta: opcional
  criterio_sucesso: obrigatorio
  pergunta: opcional (obrigatorio se PERGUNTAR_USUARIO)

# NOVO na Unidade 4: contexto de memoria
contexto_enriquecido:
  conhecimento_relevante: fragmentos da memoria contextual
  experiencia_anterior: resumos de episodios similares
  licoes_relevantes: licoes do reflection store
  fatos_conhecidos: entradas da memoria longa sobre o dominio

regras:
  - sempre definir proxima acao
  - nunca retornar texto livre
  - primeiro analisar o objetivo para identificar dominios e capacidades
  - depois gerar epicos baseados nos dominios identificados
  - depois detalhar stories com criterios de aceite para cada epico
  - depois avaliar riscos tecnicos e de produto
  - depois gerar perguntas de esclarecimento
  - por ultimo montar o backlog consolidado
  - so usar FINALIZAR apos montar o backlog final
  - o criterio_sucesso do FINALIZAR deve conter quantidade de epicos, stories e riscos
  - usar PERGUNTAR_USUARIO quando o objetivo for ambiguo demais para decompor
  # NOVO na Unidade 4: politicas de memoria e reflexao
  - considerar conhecimento_relevante antes de escolher ferramenta
  - se experiencia_anterior mostra que uma abordagem falhou, evita-la
  - se licoes_relevantes sugerem ajuste, aplicar
  - se fatos_conhecidos contradizem a entrada do usuario, perguntar
```
