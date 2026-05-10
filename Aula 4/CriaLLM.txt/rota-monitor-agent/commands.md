# commands.md

> Define a operação do agente como produto.
> Cada comando é uma ação que o operador pode executar.

---

## Campos

| Campo                   | Tipo   | Descrição                             |
| ----------------------- | ------ | ------------------------------------- |
| `comandos`              | lista  | Lista de comandos disponíveis na CLI. |
| `comandos[].nome`       | string | Nome do comando (usado no terminal).  |
| `comandos[].descricao`  | string | O que o comando faz.                  |
| `comandos[].argumentos` | lista  | Parâmetros aceitos pelo comando.      |
| `comandos[].exemplo`    | string | Exemplo de uso.                       |

---

```yaml
comandos:
  - nome: scan
    descricao: escaneia o projeto em busca de novas rotas
    argumentos:
      - nome: --projeto
        obrigatorio: true
        descricao: caminho para a raiz do projeto
      - nome: --publico
        obrigatorio: true
        descricao: caminho para a pasta pública
    exemplo: "python rota_monitor_agent.py scan --projeto ./meu-app --publico ./meu-app/public"

  - nome: generate-md
    descricao: gera arquivo .md para cada rota encontrada
    argumentos:
      - nome: --rota
        obrigatorio: true
        descricao: rota a ser documentada
      - nome: --publico
        obrigatorio: true
        descricao: caminho para a pasta pública
    exemplo: "python rota_monitor_agent.py generate-md --rota /produtos --publico ./meu-app/public"

  - nome: generate-llms
    descricao: gera arquivo llms.txt conforme padrão llmstxt.org
    argumentos:
      - nome: --rotas
        obrigatorio: true
        descricao: lista de rotas detectadas
      - nome: --publico
        obrigatorio: true
        descricao: caminho para a pasta pública
    exemplo: "python rota_monitor_agent.py generate-llms --rotas /produtos,/carrinho --publico ./meu-app/public"
```
