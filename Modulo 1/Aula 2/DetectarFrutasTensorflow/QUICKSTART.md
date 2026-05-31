# 🚀 Início Rápido

## Comandos Essenciais

### 1️⃣ Instalar Dependências

```powershell
npm install
```

### 2️⃣ Treinar o Modelo

```powershell
npm run train
```

⏱️ Aguarde o treinamento concluir (pode demorar alguns minutos)

### 3️⃣ Iniciar Aplicação Web

```powershell
npm run dev
```

🌐 Acesse: http://localhost:3000

---

## 📝 Checklist

- [ ] Dependências instaladas
- [ ] Dados em `Dados/train/train/` organizados por pasta
- [ ] Modelo treinado (pasta `public/model/` criada)
- [ ] Servidor iniciado
- [ ] Aplicação aberta no navegador

---

## ⚠️ Problemas Comuns

### Erro ao instalar 'canvas' no Windows?

```powershell
npm install --global windows-build-tools
npm install
```

### Modelo não encontrado?

Execute primeiro: `npm run train`

---

Para mais detalhes, consulte o [README.md](README.md)
