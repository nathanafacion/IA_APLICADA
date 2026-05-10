# planejador.md

> Define como o agente decide o proximo passo.
> Saida sempre estruturada em JSON.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `formato_saida` | string | Formato da resposta do planejador. |
| `campos` | lista | Campos obrigatorios na resposta. |
| `contexto_enriquecido` | objeto | NOVO na Unidade 4. Fragmentos recuperados da memoria (longa, episodica, contextual) e licoes do reflection store que o planner deve considerar antes de decidir. |
| `regras` | lista | Restricoes do planejador. |

---

```yaml
formato_saida: json

campos:
  - proxima_acao
  - nome_ferramenta
  - argumentos_ferramenta
  - criterio_sucesso

# NOVO na Unidade 4: contexto de memoria
contexto_enriquecido:
  conhecimento_relevante: fragmentos da memoria contextual
  experiencia_anterior: resumos de episodios similares
  licoes_relevantes: licoes do reflection store
  fatos_conhecidos: entradas da memoria longa sobre o dominio

regras:
  - analisar os dados do trace na ordem: saude, performance, conformidade, anomalias, veredito
  - cada ferramenta deve receber como argumento os dados relevantes extraidos do trace
  - nao chamar gerar_veredito sem ter resultados das 4 analises anteriores
  - proxima_acao deve ser exatamente CHAMAR_FERRAMENTA, FINALIZAR ou PERGUNTAR_USUARIO
  # NOVO na Unidade 4: politicas de memoria e reflexao
  - considerar conhecimento_relevante antes de escolher ferramenta
  - se experiencia_anterior mostra que uma abordagem falhou, evita-la
  - se licoes_relevantes sugerem ajuste, aplicar
  - se fatos_conhecidos contradizem a entrada do usuario, perguntar
```
