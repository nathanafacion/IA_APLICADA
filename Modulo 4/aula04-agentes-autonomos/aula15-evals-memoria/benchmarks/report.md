# Benchmark Comparativo de Arquiteturas

**Agente:** monitor-agent
**Cenarios:** 5

## Comparativo

| Metrica | padrao | react | plan_execute | reflect |
|---|---|---|---|---|
| Taxa conclusao | **100.0%** | 80.0% | **100.0%** | **100.0%** |
| Media etapas | **5.0** | **5.0** | **5.0** | **5.0** |
| Media tokens | 10973.0 | 9746.0 | **3029.0** | 9332.0 |
| Tokens planejamento | 9880.0 | 7827.0 | **1852.0** | 7618.0 |
| Cobertura ferramentas | **100.0%** | **100.0%** | **100.0%** | **100.0%** |
| Reflexoes | 0 | 0 | 0 | 0 |
| Tempo total | 130.13s | 183.05s | **106.72s** | 172.01s |

## Violacoes de Limiares

Nenhuma violacao detectada em nenhuma arquitetura.

## Veredito

- **Mais eficiente (tokens):** plan_execute
- **Maior cobertura:** padrao
- **Mais rapido:** plan_execute
