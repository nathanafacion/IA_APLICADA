```yaml
ganchos:
  antes_da_etapa: log
  apos_etapa: log

  # Unidade 3: interceptacao de tool calls reais
  antes_da_acao:
    - log
    - validar_rate_limit
    - verificar_budget

  apos_acao:
    - log
    - registrar_latencia
    - registrar_custo

  em_erro:
    - alerta
    - verificar_fallback_mock
```