```yaml
habilidades:
  - nome: consultar_metricas
    descricao: consulta metricas de latencia, throughput e taxa de erro do servico
    tipo_implementacao: rest
    entrada:
      nome_servico: string
      janela_tempo_minutos: int
    saida:
      latencia_p99_ms: float
      vazao_rps: int
      taxa_erro: float
      status: string
    conexao:
      endpoint: /api/v1/metrics
      metodo: GET
      timeout_segundos: 10
      retries: 2
      autenticacao: header_api_key
    limites:
      chamadas_por_minuto: 30

  - nome: buscar_logs
    descricao: busca logs recentes via API, últimos 60 minutos
    tipo_implementacao: rest
    entrada:
      nome_servico: string
      janela_tempo_minutos: int
      nivel_minimo: string
    saida:
      eventos: list
      contagem_total: int
    conexao:
      endpoint: /api/v1/logs
      metodo: GET
      timeout_segundos: 10
      retries: 2
      autenticacao: header_api_key
    limites:
      chamadas_por_minuto: 30

  - nome: historico_deploys
    descricao: consulta historico de deploys recentes do servico
    tipo_implementacao: rest
    entrada:
      nome_servico: string
      janela_tempo_horas: int
    saida:
      deploys: list
      contagem_total: int
    conexao:
      endpoint: /api/v1/deploys
      metodo: GET
      timeout_segundos: 10
      retries: 2
      autenticacao: header_api_key
    limites:
      chamadas_por_minuto: 20

  - nome: buscar_logs_historico
    descricao: busca logs antigos (horas ou dias atras) via banco de dados para correlacao temporal ampla. Use SOMENTE apos buscar_logs ja ter sido chamada, quando os logs recentes indicarem padrao que precisa ser investigado em janela historica maior (ex erros de conexao com banco, falhas recorrentes). NAO e substituto de buscar_logs
    tipo_implementacao: database
    entrada:
      nome_servico: string
      janela_tempo_horas: int
      nivel_minimo: string
    saida:
      eventos: list
      contagem_total: int
    conexao:
      tipo_banco: sqlite
      query_template: >
        SELECT timestamp, level, service, message
        FROM logs
        WHERE service = :nome_servico
          AND timestamp > datetime('now', '-' || :janela_tempo_horas || ' hours')
          AND level_priority >=
            CASE :nivel_minimo
              WHEN 'ERROR' THEN 3
              WHEN 'WARN' THEN 2
              WHEN 'INFO' THEN 1
              ELSE 0
            END
        ORDER BY timestamp DESC
        LIMIT 100
      modo: read_only
      timeout_segundos: 5
    limites:
      chamadas_por_minuto: 10
      max_resultados: 100

  - nome: buscar_issues
    descricao: busca issues abertas no repositorio para correlacionar com incidentes
    tipo_implementacao: mcp
    entrada:
      repositorio: string
      estado: string
      labels: list
    saida:
      issues: list
      contagem_total: int
    conexao:
      mcp_server: monitor-mcp
      tool_name: buscar_issues
    limites:
      chamadas_por_minuto: 20

  - nome: relatorio_incidente
    descricao: abre incidente formal com evidencias e recomendacao de acao. Usar como ETAPA FINAL do ciclo, quando TODAS as evidencias (metricas, logs, deploys, issues) ja estiverem coletadas. Nao voltar a coletar mais dados depois dela
    tipo_implementacao: mock
    entrada:
      nome_servico: string
      severidade: string
      evidencia: object
      recomendacao: object
    saida:
      id_incidente: string
      status: string
```
