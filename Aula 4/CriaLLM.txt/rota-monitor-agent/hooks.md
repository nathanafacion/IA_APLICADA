# hooks.md

> Permite observar e intervir.
> Antes. Depois. Erro.

---

## Campos

| Campo                    | Tipo   | Descrição                                                                                                                      |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `ganchos`                | objeto | Mapeamento de eventos do ciclo para ações. O runtime dispara o gancho no momento correspondente.                               |
| `ganchos.antes_da_etapa` | string | Disparado antes de cada etapa do ciclo. Útil para log de progresso e checagem de budget.                                       |
| `ganchos.apos_etapa`     | string | Disparado após cada etapa do ciclo. Útil para registrar resultado da etapa.                                                    |
| `ganchos.antes_da_acao`  | string | Disparado antes de executar uma ferramenta. Valores possíveis: `log` (imprime no terminal) ou `alerta` (imprime com destaque). |
| `ganchos.apos_acao`      | string | Disparado após executar uma ferramenta com sucesso ou falha. Mesmos valores possíveis.                                         |
| `ganchos.em_erro`        | string | Disparado quando a ferramenta retorna erro. Mesmos valores possíveis.                                                          |

---

```yaml
ganchos:
  antes_da_etapa: log
  apos_etapa: log
  antes_da_acao: log
  apos_acao: log
  em_erro: alerta
```
