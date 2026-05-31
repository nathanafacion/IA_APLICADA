# skills.md

> Define as ferramentas.
> Não implementa. Só define interface.

---

## Campos

| Campo                     | Tipo   | Descrição                                                                                            |
| ------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `habilidades`             | lista  | Lista de ferramentas que o agente sabe usar.                                                         |
| `habilidades[].nome`      | string | Identificador único da ferramenta.                                                                   |
| `habilidades[].descricao` | string | Texto descritivo injetado no prompt da LLM para que ela saiba quando e por que usar esta ferramenta. |
| `habilidades[].entrada`   | objeto | Parâmetros que a ferramenta recebe.                                                                  |
| `habilidades[].saida`     | objeto | Campos retornados pela ferramenta.                                                                   |

---

```yaml
habilidades:
  - nome: detectar_paginas
    descricao: detecta paginas e rotas em projetos React Router, Next.js (pages/ e app/) e Jekyll (_posts/, .md, .html). Identifica automaticamente o tipo de projeto pelo conteudo do diretorio.
    entrada:
      caminho_projeto: string
    saida:
      tipo_projeto: string
      paginas: list

  - nome: gerar_md
    descricao: gera um arquivo Markdown para cada pagina da lista, usando titulo e descricao extraidos pelo detectar_paginas
    entrada:
      paginas: list
      caminho_saida: string
    saida:
      arquivos_gerados: list

  - nome: gerar_llms_txt
    descricao: gera arquivo llms.txt no padrao llmstxt.org com todas as paginas do projeto
    entrada:
      paginas: list
      tipo_projeto: string
      caminho_saida: string
    saida:
      arquivo_llms_txt: string
```
