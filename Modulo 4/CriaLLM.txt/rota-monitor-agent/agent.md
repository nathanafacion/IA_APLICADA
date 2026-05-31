# agent.md

> Identidade do agente.
> O que ele é, o que entrega, como se comporta.

---

## Campos

| Campo                                | Tipo   | Descrição                                                                       |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| `nome`                               | string | Identificador único do agente.                                                  |
| `descricao`                          | string | O que o agente faz em uma frase.                                                |
| `tipo`                               | string | Modo de operação: `task_based`, `interactive`, `goal_oriented` ou `autonomous`. |
| `objetivo`                           | string | O que o agente deve alcançar.                                                   |
| `contrato_saida`                     | objeto | Estrutura do artefato final que o agente entrega.                               |
| `contrato_saida.formato`             | string | Tipo do artefato: `md`, `txt`, `relatorio`.                                     |
| `contrato_saida.campos_obrigatorios` | lista  | Campos que devem estar presentes no artefato final.                             |
| `contrato_saida.exemplo`             | objeto | Exemplo de saída esperada.                                                      |

---

```yaml
nome: rota-monitor-agent
descricao: agente que detecta paginas de projetos React Router, Next.js e Jekyll e gera documentacao automaticamente
tipo: autonomous
objetivo: documentar_paginas
contrato_saida:
  formato: md/txt
  campos_obrigatorios:
    - pagina
    - descricao
    - arquivo_md
    - arquivo_llms_txt
  exemplo:
    pagina: /produtos
    descricao: Pagina de listagem de produtos
    arquivo_md: pagina_produtos.md
    arquivo_llms_txt: llms.txt
```
