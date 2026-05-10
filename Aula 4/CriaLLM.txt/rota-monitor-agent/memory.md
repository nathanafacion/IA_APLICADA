# memory.md

> Define a memória curta do agente.
> O que guardar. O que descartar. Como resumir a execução no final.

---

## Campos

| Campo                         | Tipo   | Descrição                                                         |
| ----------------------------- | ------ | ----------------------------------------------------------------- |
| `memoria_curta`               | objeto | Configuração da memória operacional do agente durante a execução. |
| `memoria_curta.guardar`       | lista  | Tipos de informação que devem ser retidos no histórico.           |
| `memoria_curta.descartar`     | lista  | Tipos de informação que NÃO devem poluir o histórico.             |
| `memoria_curta.max_registros` | int    | Número máximo de registros mantidos na memória curta.             |
| `resumo_final`                | objeto | Como o agente deve resumir a execução ao terminar.                |
| `resumo_final.max_linhas`     | int    | Número máximo de linhas no resumo final.                          |
| `resumo_final.campos`         | lista  | Campos obrigatórios no resumo.                                    |

---

```yaml
memoria_curta:
  guardar:
    - rota_detectada
    - arquivo_md_gerado
    - arquivo_llms_gerado
    - erro_detectado
  descartar:
    - logs_verbosos
    - arquivos_temp
  max_registros: 20

resumo_final:
  max_linhas: 5
  campos:
    - objetivo
    - rotas_documentadas
    - arquivos_gerados
    - erros
```
