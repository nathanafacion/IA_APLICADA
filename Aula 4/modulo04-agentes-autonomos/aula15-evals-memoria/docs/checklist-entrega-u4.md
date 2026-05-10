# Checklist de Entrega — Unidade 4

### Contratos
- [ ] memory.md com 4 tipos de memoria governados por contrato
- [ ] reflection.md com critica intra + aprendizado inter-execucao
- [ ] planner.md com contexto enriquecido
- [ ] hooks.md com interceptacao de operacoes de memoria
- [ ] rules.md com politicas de memoria e seguranca

### Adapters
- [ ] memory_adapter.py (gravar, recuperar, atualizar, remover, listar)
- [ ] embedding_adapter.py (indexar, buscar, reindexar)

### Stores
- [ ] memory_store/longa/ com pelo menos 5 fatos persistidos
- [ ] memory_store/episodica/ com pelo menos 3 episodios resumidos
- [ ] memory_store/contextual/ com indice de embeddings funcional
- [ ] reflection_store/licoes/ com pelo menos 3 licoes aprendidas
- [ ] reflection_store/padroes/ com pelo menos 1 padrao detectado

### Evals
- [ ] Dataset com 5+ casos de teste
- [ ] Eval suite com 6 metricas de impacto
- [ ] retrieval_precision >= 0.80
- [ ] hallucination_from_memory <= 0.02
- [ ] decision_improvement >= 0.15
- [ ] Relatorio comparativo gerado

### Integracao
- [ ] Ciclo com RECUPERAR CONTEXTO e PERSISTIR MEMORIA
- [ ] Planner usando fatos, episodios, fragmentos e licoes
- [ ] Licoes sendo extraidas ao final da execucao
- [ ] Agente melhora entre execucoes (comprovado por eval)
