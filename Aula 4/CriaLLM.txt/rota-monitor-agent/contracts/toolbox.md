# toolbox.md

> Define o que o agente pode fazer.
> Quais ferramentas existem. Quais parâmetros aceitam.

---

## Campos

| Campo                   | Tipo   | Descrição                                                                                   |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `ferramentas`           | lista  | Lista de ferramentas disponíveis para o agente.                                             |
| `ferramentas[].nome`    | string | Identificador único da ferramenta. Deve ser o mesmo nome usado em `skills.md` e `rules.md`. |
| `ferramentas[].entrada` | objeto | Parâmetros que a ferramenta aceita.                                                         |

> **Nota:** este contrato define apenas quais ferramentas existem e seus parâmetros.
> A descrição completa (com saídas) fica em `skills.md`.
> As restrições de uso ficam em `rules.md`.

---

```yaml
ferramentas:
  - nome: detectar_paginas
    descricao: detecta paginas e rotas em projetos React Router, Next.js e Jekyll, com titulo e descricao de cada pagina
    entrada:
      caminho_projeto: string

  - nome: gerar_md
    descricao: gera um arquivo Markdown para cada pagina da lista
    entrada:
      paginas: list
      caminho_saida: string

  - nome: gerar_llms_txt
    descricao: gera arquivo llms.txt com todas as paginas
    entrada:
      paginas: list
      tipo_projeto: string
      caminho_saida: string
```
