# loop.md

> Define como o agente roda.
> Controla o ciclo inteiro.

---

## Campos

| Campo              | Tipo   | Descrição                                                                             |
| ------------------ | ------ | ------------------------------------------------------------------------------------- |
| `objetivo`         | string | O que o agente deve alcançar. Exibido no início da execução e usado no prompt da LLM. |
| `ciclo.max_etapas` | int    | Número máximo de iterações do ciclo. Funciona como trava de segurança.                |
| `condicoes_parada` | lista  | Situações que encerram o ciclo. O runtime verifica essas condições a cada iteração.   |

---

```yaml
objetivo: documentar_paginas

ciclo:
  max_etapas: 10

condicoes_parada:
  - todas_paginas_documentadas
  - erro_fatal
```
