# Memoria do Agente

```yaml
tipos_memoria:
  curta:
    ativo: true
    tipo_implementacao: local
    guardar:
      - resultado_de_ferramenta
      - decisao_do_planejador
      - evidencia_coletada
      - erro_encontrado
    descartar:
      - prompt_sistema_completo
      - argumentos_mock_internos
      - dados_de_entrada_repetidos
    max_registros: 20

  longa:
    ativo: true
    tipo_implementacao: arquivo
    diretorio: memory_store/longa/
    formato: yaml
    max_entradas: 500
    guardar:
      - fatos_sobre_dominios
      - preferencias_usuario
      - configuracoes_aprendidas
      - resolucoes_conhecidas
    descartar:
      - dados_temporarios
      - valores_numericos_volateis
    politicas:
      - so gravar fato se confirmado por evidencia de tool
      - atualizar fato existente em vez de duplicar
      - remover fato se contradito por evidencia mais recente
      - nunca gravar dados sensiveis (secrets, tokens, senhas)

  episodica:
    ativo: true
    tipo_implementacao: arquivo
    diretorio: memory_store/episodica/
    formato: yaml
    max_episodios: 100
    resumo_por_episodio:
      max_linhas: 10
      campos:
        - objetivo
        - etapas_executadas
        - ferramentas_chamadas
        - resultado_final
        - erros_encontrados
        - licoes_aprendidas
    politicas:
      - resumir episodio ao final de cada execucao
      - episodios com mais de 30 dias sao compactados
      - episodios com erros criticos nunca sao descartados

  contextual:
    ativo: true
    tipo_implementacao: embedding
    diretorio: memory_store/contextual/
    modelo_embedding: text-embedding-3-small
    max_fragmentos_por_consulta: 5
    limiar_similaridade: 0.7
    fontes:
      - memoria_longa
      - memoria_episodica
      - documentos_indexados
    politicas:
      - recuperar fragmentos antes da etapa de planejamento
      - injetar no contexto do planner como conhecimento_relevante
      - max tokens de contexto recuperado: 2000
      - se nenhum fragmento acima do limiar, nao injetar nada

resumo_final:
  max_linhas: 5
  campos:
    - objetivo
    - etapas_executadas
    - ferramentas_chamadas
    - resultado_final
    - proximos_passos
    - licoes_aprendidas
```
