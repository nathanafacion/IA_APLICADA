```yaml
ferramentas_obrigatorias:
  - relatorio_incidente
  - buscar_issues

limites:
  max_etapas: 12
  sem_progresso: 3
  limite_tempo_segundos: 120 
  chamadas_ferramenta:
    consultar_metricas: 3
    buscar_logs: 3
    buscar_logs_historico: 2
    historico_deploys: 2
    buscar_issues: 1
    relatorio_incidente: 1
    total: 12

  # Unidade 3: limites globais para tools reais
  rate_limit_global:
    chamadas_por_minuto: 60
    custo_maximo_centavos: 50

acoes_sensiveis:
  - rollback_deploy

politicas:
  - parar se nao houver progresso apos 3 tentativas consecutivas
  - relatorio_incidente e obrigatorio antes de finalizar. Se ela ainda nao aparece na lista de ferramentas ja utilizadas, voce NAO pode retornar proxima_acao=FINALIZAR; retorne CHAMAR_FERRAMENTA com nome_ferramenta=relatorio_incidente primeiro
  - priorizar historico_deploys na primeira etapa SOMENTE SE a palavra 'deploy', 'release' ou 'rollout' aparecer literalmente na entrada do usuario. Caso contrario, comecar pelo fluxo normal (consultar_metricas). NAO inferir 'mudanca recente' de sinais indiretos como latencia ou erro
  - relatorio_incidente so pode ser chamado apos coletar evidencias
  - os argumentos evidencia e recomendacao do relatorio_incidente devem conter dados reais coletados
  - buscar_issues e obrigatoria e deve ser chamada antes de relatorio_incidente para correlacionar o incidente com issues conhecidas
  - buscar_issues deve usar repositorio igual ao nome_servico do alerta (ex repositorio=checkout) estado=open e labels=["bug","p1"]
  - rollback requer confirmacao humana
  # Unidade 3: politicas de seguranca para tools reais
  - tools com tipo_implementacao database devem usar modo read_only
  - tools com tipo_implementacao rest devem ter timeout maximo de 30 segundos
  - nunca logar conteudo de headers de autenticacao
  - se uma tool real falhar 2 vezes seguidas, usar fallback mock e marcar no trace
  - secrets so podem vir de variaveis de ambiente (.env)
```