# 🤖 Agente: Engenheiro de Requisitos

Agente de IA para o **GitHub Copilot Chat** que transforma descrições de problemas de negócio em especificações técnicas completas e visualmente estruturadas — automaticamente.

---

## 📋 O que o agente faz

Dado qualquer problema ou cenário descrito pelo usuário, o agente executa os seguintes passos de forma autônoma:

| Passo                        | O que gera                                                         |
| ---------------------------- | ------------------------------------------------------------------ |
| 🎯 Escopo                    | Resumo do entendimento do problema e proposta da solução           |
| ⚙️ Requisitos Funcionais     | Lista de RFs com verbos de ação, agrupados por módulo              |
| 🔒 Requisitos Não-Funcionais | RNFs com métricas mensuráveis (performance, segurança, LGPD, etc.) |
| 📊 Diagrama Mermaid          | Fluxograma do funcionamento da solução                             |
| 💾 Arquivo `.md`             | Salva toda a especificação em um arquivo `especificacao-<tema>.md` |
| 🖼️ Imagem do diagrama        | Gera e embute a imagem estática do diagrama via `mermaid.ink`      |

---

## 🛠️ Pré-requisitos

### 1. GitHub Copilot Chat

O agente roda dentro do **GitHub Copilot Chat** no VS Code. Certifique-se de ter a extensão instalada e uma conta com acesso ao Copilot.

### 2. Extensões do VS Code necessárias

Para visualizar corretamente os arquivos `.md` gerados com diagramas Mermaid:

| Extensão                             | ID                           | Para que serve                                      |
| ------------------------------------ | ---------------------------- | --------------------------------------------------- |
| **Markdown Preview Mermaid Support** | `bierner.markdown-mermaid`   | Renderiza diagramas `mermaid` no preview do VS Code |
| **Markdown All in One** _(opcional)_ | `yzhang.markdown-all-in-one` | Atalhos e preview aprimorado de Markdown            |

**Como instalar:**

1. Abra o VS Code
2. Pressione `Ctrl+Shift+X` para abrir as Extensões
3. Busque pelo ID da extensão e clique em **Install**

Ou instale direto pelo terminal:

```bash
code --install-extension bierner.markdown-mermaid
```

### 3. Visualizar o preview do `.md`

Com o arquivo `.md` aberto, pressione:

```
Ctrl + Shift + V
```

O painel de preview abrirá ao lado com o diagrama renderizado.

---

## 🚀 Como usar o agente

### Passo 1 — Selecionar o agente

No GitHub Copilot Chat, clique no seletor de agentes (ícone `@` ou dropdown no topo do chat) e escolha **Engenheiro de Requisitos**.

### Passo 2 — Descrever o problema

Digite uma descrição do problema de negócio ou funcionalidade que deseja especificar. Não precisa ser técnico — descreva a dor ou o objetivo.

**Exemplos de prompts:**

```
Criar uma tela de cadastro simples para compra de um item da loja, deve ter nome, endereço, pagamento.
```

```
Preciso de um sistema de agendamento de consultas médicas online.
```

```
Quero especificar um módulo de login com autenticação de dois fatores.
```

### Passo 3 — Aguardar a geração

O agente irá automaticamente:

1. Gerar a especificação completa no chat
2. Salvar o arquivo `especificacao-<tema>.md` na pasta do workspace
3. Executar o comando PowerShell para gerar a URL da imagem do diagrama
4. Atualizar o `.md` com a imagem embutida

### Passo 4 — Abrir o resultado

Abra o arquivo `.md` gerado e pressione `Ctrl+Shift+V` para visualizar com o diagrama renderizado.

---

## 📌 Exemplo de uso

### Prompt enviado ao agente

```
Criar uma tela de cadastro simples para compra de um item da loja, deve ter nome, endereço, pagamento.
```

### Resultado gerado — `especificacao-cadastro-compra.md`

---

### 🎯 1. Entendimento do Problema e Escopo

O sistema deve disponibilizar uma tela de cadastro simplificada para o fluxo de compra de um item em uma loja virtual. O escopo cobre a coleta de dados do comprador (identificação, endereço de entrega e forma de pagamento), validação das informações e confirmação do pedido. A solução deve ser leve e guiar o usuário até a finalização sem etapas desnecessárias.

---

### ⚙️ 2. Requisitos Funcionais (RF)

**Módulo: Identificação**

- **RF001:** O sistema deve permitir que o usuário informe seu nome completo.
- **RF002:** O sistema deve validar que o campo nome contém ao menos nome e sobrenome antes de avançar.

**Módulo: Endereço de Entrega**

- **RF003:** O sistema deve permitir que o usuário informe o endereço de entrega (logradouro, número, complemento, bairro, cidade, estado e CEP).
- **RF004:** O sistema deve consultar e preencher automaticamente os campos de endereço ao usuário digitar o CEP válido.
- **RF005:** O sistema deve validar que todos os campos obrigatórios do endereço foram preenchidos antes de avançar.

**Módulo: Pagamento**

- **RF006:** O sistema deve permitir que o usuário selecione a forma de pagamento (cartão de crédito, boleto ou Pix).
- **RF007:** O sistema deve exibir o formulário de dados do cartão (número, nome, validade e CVV) quando selecionado "cartão de crédito".
- **RF008:** O sistema deve gerar e exibir o QR Code Pix ou código de barras do boleto conforme a forma selecionada.
- **RF009:** O sistema deve mascarar os dados sensíveis do cartão durante a digitação (ex: `**** **** **** 1234`).

**Módulo: Confirmação**

- **RF010:** O sistema deve exibir um resumo do pedido antes da confirmação final.
- **RF011:** O sistema deve gerar e exibir um número de protocolo após a submissão bem-sucedida.
- **RF012:** O sistema deve enviar confirmação ao e-mail do usuário após a finalização.

---

### 🔒 3. Requisitos Não-Funcionais (RNF)

- **RNF001 (Segurança):** Os dados de pagamento devem ser tokenizados via gateway e nunca armazenados no servidor.
- **RNF002 (Segurança):** Toda comunicação deve utilizar HTTPS/TLS 1.2 ou superior.
- **RNF003 (Performance):** A consulta de CEP deve retornar os dados em no máximo 1 segundo.
- **RNF004 (Performance):** O tempo de resposta para confirmação do pedido não deve ultrapassar 3 segundos.
- **RNF005 (Usabilidade):** O formulário deve ser responsivo em dispositivos com tela a partir de 320px.
- **RNF006 (Usabilidade):** Mensagens de erro devem aparecer inline em no máximo 200ms após saída do foco.
- **RNF007 (Disponibilidade):** Disponibilidade mínima de 99,5% ao mês.
- **RNF008 (Conformidade):** Conformidade com a LGPD (Lei 13.709/2018).

---

### 📊 4. Diagrama de Funcionamento

![Diagrama de Funcionamento](https://mermaid.ink/img/Z3JhcGggVEQKICAgIEEoW1VzdWFyaW8gYWNlc3NhIGEgdGVsYSBkZSBjb21wcmFdKSAtLT4gQltQcmVlbmNoZSBOb21lIENvbXBsZXRvXQogICAgQiAtLT4gQ3siTm9tZSB2YWxpZG8_In0KICAgIEMgLS0gTmFvIC0tPiBCCiAgICBDIC0tIFNpbSAtLT4gRFtJbmZvcm1hIG8gQ0VQXQogICAgRCAtLT4gRVtBUEkgZGUgQ0VQIHByZWVuY2hlIGVuZGVyZWNvXQogICAgRSAtLT4gRltVc3VhcmlvIHJldmlzYSBvIGVuZGVyZWNvXQogICAgRiAtLT4gR3siRW5kZXJlY28gdmFsaWRvPyJ9CiAgICBHIC0tIE5hbyAtLT4gRgogICAgRyAtLSBTaW0gLS0-IEhbU2VsZWNpb25hIGZvcm1hIGRlIHBhZ2FtZW50b10KICAgIEggLS0-IEl7IlRpcG8gZGUgcGFnYW1lbnRvIn0KICAgIEkgLS0gQ2FydGFvIC0tPiBKW1ByZWVuY2hlIGRhZG9zIGRvIGNhcnRhb10KICAgIEkgLS0gUGl4IC0tPiBLW1Npc3RlbWEgZ2VyYSBRUiBDb2RlIFBpeF0KICAgIEkgLS0gQm9sZXRvIC0tPiBMW1Npc3RlbWEgZ2VyYSBjb2RpZ28gZGUgYmFycmFzXQogICAgSiAtLT4gTXsiRGFkb3MgZG8gY2FydGFvIHZhbGlkb3M_In0KICAgIE0gLS0gTmFvIC0tPiBKCiAgICBNIC0tIFNpbSAtLT4gTltFeGliZSByZXN1bW8gZG8gcGVkaWRvXQogICAgSyAtLT4gTgogICAgTCAtLT4gTgogICAgTiAtLT4gT3siVXN1YXJpbyBjb25maXJtYT8ifQogICAgTyAtLSBOYW8gLS0-IFAoW1VzdWFyaW8gY2FuY2VsYSBvdSBlZGl0YV0pCiAgICBPIC0tIFNpbSAtLT4gUVtQcm9jZXNzYSBwYWdhbWVudG8gdmlhIEdhdGV3YXldCiAgICBRIC0tPiBSeyJQYWdhbWVudG8gYXByb3ZhZG8_In0KICAgIFIgLS0gTmFvIC0tPiBTW0V4aWJlIGVycm8gZSBzb2xpY2l0YSBub3ZvIG1ldG9kb10KICAgIFMgLS0-IEgKICAgIFIgLS0gU2ltIC0tPiBUW0dlcmEgbnVtZXJvIGRlIHByb3RvY29sb10KICAgIFQgLS0-IFVbRW52aWEgY29uZmlybWFjYW8gcG9yIGUtbWFpbF0KICAgIFUgLS0-IFYoW1RlbGEgZGUgc3VjZXNzbyBjb20gcHJvdG9jb2xvXSk)

```mermaid
graph TD
    A([Usuario acessa a tela de compra]) --> B[Preenche Nome Completo]
    B --> C{"Nome valido?"}
    C -- Nao --> B
    C -- Sim --> D[Informa o CEP]
    D --> E[API de CEP preenche endereco]
    E --> F[Usuario revisa o endereco]
    F --> G{"Endereco valido?"}
    G -- Nao --> F
    G -- Sim --> H[Seleciona forma de pagamento]
    H --> I{"Tipo de pagamento"}
    I -- Cartao --> J[Preenche dados do cartao]
    I -- Pix --> K[Sistema gera QR Code Pix]
    I -- Boleto --> L[Sistema gera codigo de barras]
    J --> M{"Dados do cartao validos?"}
    M -- Nao --> J
    M -- Sim --> N[Exibe resumo do pedido]
    K --> N
    L --> N
    N --> O{"Usuario confirma?"}
    O -- Nao --> P([Usuario cancela ou edita])
    O -- Sim --> Q[Processa pagamento via Gateway]
    Q --> R{"Pagamento aprovado?"}
    R -- Nao --> S[Exibe erro e solicita novo metodo]
    S --> H
    R -- Sim --> T[Gera numero de protocolo]
    T --> U[Envia confirmacao por e-mail]
    U --> V([Tela de sucesso com protocolo])
```

---

## 📁 Estrutura de arquivos gerada

```
AgenteUX/
├── .github/
│   └── agents/
│       └── engenheiro-requisitos.agent.md   ← definição do agente
├── especificacao-cadastro-compra.md          ← arquivo gerado pelo agente
└── README.md                                 ← este arquivo
```

---

## ⚠️ Observações

- O diagrama usa sintaxe sem acentos para garantir compatibilidade com todos os renderizadores Mermaid
- A imagem estática (`![...]`) funciona no GitHub, Notion e qualquer visualizador que carregue imagens externas
- O bloco ` ```mermaid ` é renderizado localmente no VS Code com a extensão `bierner.markdown-mermaid`
