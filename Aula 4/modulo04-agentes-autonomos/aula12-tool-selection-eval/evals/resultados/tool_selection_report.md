# Tool Selection Eval — Relatorio

**Agente:** monitor-agent
**Casos:** 8

## Comparativo por Arquitetura

| Metrica | padrao | react | plan_execute | reflect |
|---|---|---|---|---|
| Tool selection accuracy | **100.0%** | **100.0%** | **100.0%** | **100.0%** |
| Argument accuracy | **100.0%** | **100.0%** | **100.0%** | **100.0%** |
| Unnecessary calls rate | **0.0%** | **0.0%** | **0.0%** | **0.0%** |
| Wrong tool rate | **0.0%** | **0.0%** | **0.0%** | **0.0%** |

## Detalhamento por Caso

| Caso | Tool Esperada | Tool Escolhida | Acertou | Args |
|------|--------------|----------------|---------|------|
| ts-001 | consultar_metricas | consultar_metricas | ✓ | 100% |
| ts-002 | buscar_logs | buscar_logs | ✓ | 100% |
| ts-003 | historico_deploys | historico_deploys | ✓ | 100% |
| ts-004 | buscar_logs_historico | buscar_logs_historico | ✓ | 100% |
| ts-005 | buscar_issues | buscar_issues | ✓ | 100% |
| ts-006 | relatorio_incidente | relatorio_incidente | ✓ | 100% |
| ts-007 | consultar_metricas | consultar_metricas | ✓ | 100% |
| ts-008 | buscar_issues | buscar_issues | ✓ | 100% |

## Violacoes

Nenhuma violacao.
