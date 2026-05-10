# planner.md

> Define como a LLM decide.
> Isso não é prompt. É contrato. Obriga a LLM a responder estruturado.

---

## Campos

| Campo                                 | Tipo   | Descrição                                                                                                           |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `formato_saida`                       | objeto | Estrutura JSON que a LLM deve retornar. O runtime faz parse dessa resposta para decidir o que executar.             |
| `formato_saida.proxima_acao`          | string | Ação que a LLM escolheu: `CHAMAR_FERRAMENTA` para executar uma ferramenta ou `FINALIZAR` para encerrar o ciclo.     |
| `formato_saida.nome_ferramenta`       | string | Nome da ferramenta a ser chamada. Obrigatório quando `proxima_acao = CHAMAR_FERRAMENTA`.                            |
| `formato_saida.argumentos_ferramenta` | objeto | Parâmetros passados para a ferramenta. As chaves devem corresponder aos campos de entrada definidos em `skills.md`. |
| `formato_saida.criterio_sucesso`      | string | Descreve o que define sucesso nesta etapa. Usado na avaliação e exibido no rastreamento.                            |
| `regras`                              | lista  | Instruções injetadas no prompt da LLM. O runtime não interpreta — apenas repassa como texto.                        |

---

```yaml
formato_saida:
  proxima_acao: CHAMAR_FERRAMENTA | FINALIZAR | PERGUNTAR_USUARIO
  nome_ferramenta: opcional
  argumentos_ferramenta: opcional
  criterio_sucesso: obrigatorio
  pergunta: opcional (obrigatorio se PERGUNTAR_USUARIO)

regras:
  - sempre definir proxima_acao
  - nunca retornar texto livre
  - documentar todas as paginas detectadas
  - so usar FINALIZAR apos gerar todos os arquivos .md e llms.txt
  - usar PERGUNTAR_USUARIO quando faltar informacao critica
```
