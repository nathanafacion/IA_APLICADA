# Os 9 arquivos do monitor-agent

> Cada arquivo responde uma pergunta sobre o agente.
> Nenhum deles é código. Todos governam o runtime.

A ordem abaixo é a mesma em que a aula 3 apresenta os contratos.
A lógica é: **identidade → ciclo → decisão → capacidades → registro → execução → limites → observação → memória**.
Cada camada depende da anterior.

---

## 1. `agent.md` — o RG

**Pergunta:** Quem é o agente?
**Por que vem primeiro:** sem nome, objetivo e contrato de saída, todo o resto fica sem direção.

Define:
- `nome` — identificador único (`monitor-agent`)
- `tipo` — modo de operação (`task_based`, `interactive`, `goal_oriented`, `autonomous`)
- `objetivo` — o que o agente deve alcançar (`resolver_incidente`)
- `contrato_saida` — formato do artefato final (campos obrigatórios: diagnóstico, evidências, recomendação, severidade)

---

## 2. `contracts/loop.md` — o motor

**Pergunta:** Como ele roda em ciclo?
**Por que vem aqui:** depende do objetivo (do `agent.md`). Sem motor, não existe agente.

Define:
- `objetivo` — repetido aqui para o ciclo saber onde parar
- `ciclo.max_etapas` — número máximo de iterações (10)
- `condicoes_parada` — 5 situações que encerram o ciclo: objetivo alcançado, max etapas excedido, sem progresso, limite de tempo excedido, confirmação humana negada

> As fases (perceber → planejar → agir → avaliar) são fixas no runtime. O contrato traz instruções no comentário caso queira torná-las dinâmicas.

---

## 3. `contracts/planner.md` — o cérebro

**Pergunta:** Como ele decide o próximo passo?
**Por que vem aqui:** com o ciclo definido, agora é hora de dizer à LLM o formato da decisão.

Define:
- `formato_saida` — JSON estruturado que a LLM **deve** preencher: `proxima_acao` (`CHAMAR_FERRAMENTA` | `FINALIZAR` | `PERGUNTAR_USUARIO`), `nome_ferramenta`, `argumentos_ferramenta`, `criterio_sucesso`, `pergunta`
- `regras` — instruções injetadas no prompt: coletar evidências antes de diagnosticar, só finalizar após registrar o incidente, etc.

> Isso aqui não é prompt. É contrato. A LLM não pode responder texto livre.

---

## 4. `skills.md` — a ficha técnica

**Pergunta:** O que ele sabe fazer (em detalhe)?
**Por que vem aqui:** com formato de decisão pronto, agora você cataloga as capacidades que a LLM pode escolher.

Define a lista `habilidades`, cada uma com:
- `nome`
- `descricao` — texto injetado no prompt da LLM
- `entrada` — parâmetros tipados (`string`, `int`, `float`, `bool`, `list`, `object`)
- `saida` — campos retornados (também tipados)

As 4 skills do `monitor-agent`:

| Skill | O que faz |
|-------|-----------|
| `consultar_metricas` | latência p99, vazão e taxa de erro do serviço |
| `buscar_logs` | logs estruturados em janela de tempo |
| `historico_deploys` | deploys recentes do serviço |
| `relatorio_incidente` | abre incidente formal com evidências e recomendação |

> O runtime gera a implementação mock automaticamente a partir desse contrato. Você não escreve código de tool.

---

## 5. `contracts/toolbox.md` — a caixa de ferramentas

**Pergunta:** O que ele pode usar?
**Por que vem aqui:** é um recorte dos skills — só nomes e entradas. Você precisa do skills antes para extrair.

Define a lista `ferramentas` com apenas `nome` e `entrada`. Sem descrição, sem saída — esse é o registro mínimo.

> **Skills vs Toolbox = saber vs poder.** Você pode definir 10 habilidades nos skills e liberar só 3 na toolbox. O runtime cruza os dois para montar as ferramentas disponíveis. Se a toolbox referencia algo que não existe nos skills, o validador acusa antes de rodar.

---

## 6. `contracts/executor.md` — o braço

**Pergunta:** Como ele executa?
**Por que vem aqui:** só faz sentido depois que ferramentas e ciclo já existem.

Define:
- `execucao.validar_entrada: true` — confere se a ferramenta existe antes de executar
- `execucao.tentar_novamente_em_falha: true` — uma segunda chance se der exceção
- `pos_execucao.avaliar_resultado: true` — resultado passa pelo `avaliar` que decide continuar ou encerrar

> Operário cuidadoso: confere antes, tenta de novo se falhou, confere depois.

---

## 7. `rules.md` — o livro de regras

**Pergunta:** Quais são os limites?
**Por que vem aqui:** com tudo o que o agente faz, usa e executa já definido, agora você instala as travas.

Define:
- `ferramentas_obrigatorias` — `relatorio_incidente` (não pode finalizar sem)
- `limites.max_etapas: 10`
- `limites.sem_progresso: 3` — para se ficar 3 rodadas sem avançar
- `limites.limite_tempo_segundos: 120`
- `limites.chamadas_ferramenta` — limite por skill (`consultar_metricas: 3`, `relatorio_incidente: 1`, `total: 9`)
- `acoes_sensiveis` — `rollback_deploy` exige confirmação humana
- `politicas` — texto livre injetado no prompt da LLM (não é interpretado pelo runtime, só repassado)

> Limites + obrigatoriedade + confirmação humana. É o que separa um agente seguro de um agente perigoso.

---

## 8. `hooks.md` — os sensores

**Pergunta:** O que ele observa durante a execução?
**Por que vem aqui:** os sensores dependem de já ter ciclo e execução definidos. Você instrumenta depois que a máquina está montada.

Define os 5 ganchos:
- `antes_da_etapa: log`
- `apos_etapa: log`
- `antes_da_acao: log`
- `apos_acao: log`
- `em_erro: alerta`

> Câmeras de segurança em cada ponto. `log` imprime no terminal; `alerta` imprime com destaque. Sem observabilidade você não sabe o que o agente fez — e se não sabe, não pode confiar nele.

---

## 9. `memory.md` — o caderno de anotações

**Pergunta:** O que ele lembra e o que esquece?
**Por que vem por último:** só depois de saber tudo o que o agente faz, usa e produz é que você decide o que vale guardar.

Define:
- `memoria_curta.guardar` — resultado de ferramenta, decisão do planejador, evidência coletada, erro encontrado
- `memoria_curta.descartar` — prompt de sistema completo, argumentos mock internos, dados de entrada repetidos
- `memoria_curta.max_registros: 20`
- `resumo_final.max_linhas: 5` — campos: objetivo, etapas executadas, ferramentas chamadas, resultado final, próximos passos

> Memória não é lixo. É contexto filtrado.

---

## Resumo visual

| # | Arquivo | Metáfora | Pergunta |
|---|---------|----------|----------|
| 1 | `agent.md` | RG | Quem é o agente? |
| 2 | `contracts/loop.md` | Motor | Como ele roda em ciclo? |
| 3 | `contracts/planner.md` | Cérebro | Como ele decide? |
| 4 | `skills.md` | Ficha técnica | O que ele sabe fazer? |
| 5 | `contracts/toolbox.md` | Caixa de ferramentas | O que ele pode usar? |
| 6 | `contracts/executor.md` | Braço | Como ele executa? |
| 7 | `rules.md` | Livro de regras | Quais são os limites? |
| 8 | `hooks.md` | Sensores | O que ele observa? |
| 9 | `memory.md` | Caderno | O que ele lembra e esquece? |

### Por localização no projeto

```
monitor-agent/
├── agent.md         → 1. identidade
├── rules.md         → 7. limites
├── skills.md        → 4. capacidades detalhadas
├── hooks.md         → 8. observabilidade
├── memory.md        → 9. memória curta
└── contracts/
    ├── loop.md      → 2. ciclo
    ├── planner.md   → 3. decisão
    ├── executor.md  → 6. execução
    └── toolbox.md   → 5. registro de ferramentas
```

> Nove arquivos. Nenhum é código. Todos governam o runtime.
