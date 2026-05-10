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

  # NOVO na Unidade 4: hooks de memoria
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
