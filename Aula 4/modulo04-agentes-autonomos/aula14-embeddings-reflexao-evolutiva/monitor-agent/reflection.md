# Reflexao do Agente

```yaml
critica:
  criterios:
    - corretude: as evidencias sustentam o diagnostico?
    - completude: todas as fontes relevantes foram consultadas?
    - qualidade_evidencia: os dados sao especificos ou genericos demais?
  limiar_aprovacao: 70
  max_reflexoes: 2
  formato_critica:
    nota: int (0-100)
    aprovado: bool
    problemas: lista de problemas encontrados
    sugestoes: lista de acoes para melhorar

aprendizado:
  ativo: true
  diretorio: reflection_store/

  extracao_licoes:
    quando: apos_finalizacao
    formato:
      situacao: o que aconteceu
      acao: o que o agente fez
      resultado: qual foi o resultado
      licao: o que aprender com isso
    politicas:
      - so extrair licao se o resultado foi inesperado (bom ou ruim)
      - licoes devem ser generalizaveis (nao especificas a um input)
      - max 3 licoes por execucao
      - nunca gravar dados sensiveis nas licoes

  deteccao_padroes:
    quando: a_cada_10_execucoes
    formato:
      padrao: descricao do padrao recorrente
      frequencia: quantas vezes observado
      impacto: como afeta o resultado
      ajuste_sugerido: o que mudar no comportamento
    politicas:
      - padrao so e valido se observado em 3+ execucoes
      - padroes devem ser acionaveis (sugerir ajuste concreto)

  injecao:
    onde: contexto_do_planner
    como: licoes_relevantes
    max_licoes_por_execucao: 5
    ordenar_por: relevancia_ao_objetivo
```
