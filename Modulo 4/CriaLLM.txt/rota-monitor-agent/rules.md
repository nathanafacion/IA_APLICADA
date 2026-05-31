# rules.md

> Protege o sistema.
> Evita loop infinito. Define comportamento seguro.

---

## Campos

| Campo                               | Tipo   | Descrição                                                       |
| ----------------------------------- | ------ | --------------------------------------------------------------- |
| `ferramentas_obrigatorias`          | lista  | Ferramentas que devem ser chamadas antes de permitir FINALIZAR. |
| `limites.max_etapas`                | int    | Número máximo de iterações do ciclo.                            |
| `limites.chamadas_ferramenta`       | objeto | Limites de chamadas por ferramenta.                             |
| `limites.chamadas_ferramenta.total` | int    | Limite total de chamadas somando todas as ferramentas.          |
| `politicas`                         | lista  | Regras de comportamento injetadas no prompt da LLM como texto.  |
| `limites.sem_progresso`             | int    | Número de etapas consecutivas sem progresso antes de encerrar.  |
| `limites.limite_tempo_segundos`     | int    | Tempo máximo de execução em segundos.                           |
| `acoes_sensiveis`                   | lista  | Ferramentas que requerem confirmação humana antes de executar.  |

---

```yaml
ferramentas_obrigatorias:
  - gerar_md
  - gerar_llms_txt

limites:
  max_etapas: 10
  sem_progresso: 3
  limite_tempo_segundos: 120
  chamadas_ferramenta:
    gerar_md: 10
    gerar_llms_txt: 3
    total: 14

acoes_sensiveis:
  - sobrescrever_arquivo_existente

politicas:
  - Sempre chamar detectar_paginas antes de gerar_md ou gerar_llms_txt.
  - Nao sobrescrever arquivos sem confirmacao.
  - Suportar React Router, Next.js (pages/ e app/) e Jekyll.
```
