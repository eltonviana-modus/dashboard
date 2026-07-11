# Dashboard de Performance — Consultoria ML

App Next.js único que serve o dashboard de todos os sellers. Cada seller acessa por um link
próprio (`/s/<token>`); não há login. Os dados vêm ao vivo do workflow n8n `[DASH] API Dados do
Dashboard` (webhook `dashboard-data`), que lê as planilhas de cada seller — o app nunca fala
direto com o Google Sheets.

Como é "uma matriz só": como existe um único app servindo todos os sellers, qualquer alteração de
layout, cálculo ou nova aba feita aqui vale para todos os sellers ao mesmo tempo — não é
necessário reeditar nada por seller.

## Estrutura

- `app/s/[token]/geral` — KPIs gerais, saúde da conta, relatório do Gerente Geral (IA)
- `app/s/[token]/vendas` — Produtos 60D, curva ABC, preço vs. concorrência, pesquisa de mercado
- `app/s/[token]/operacao` — status de anúncios, fila de ações da IA, produtos problemáticos,
  reclamações, performance de Ads
- `lib/api.ts` — único ponto que fala com o n8n (`DASHBOARD_API_URL`)

## Rodando local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Deploy no Hostinger (Easypanel)

Você já usa Easypanel para o n8n — o mesmo fluxo serve aqui:

1. Suba esta pasta (`dashboard-app`) para um repositório Git (ou envie via SFTP para o VPS).
2. No Easypanel, crie um novo serviço do tipo **App** apontando para este repositório/pasta —
   ele vai detectar o `Dockerfile` automaticamente.
3. Em **Environment**, adicione a variável:
   - `DASHBOARD_API_URL=https://n8n-consult-n8n.k7je8d.easypanel.host/webhook/dashboard-data`
4. Porta do container: `3000`.
5. Configure o domínio (ex.: `dashboard.seudominio.com.br`) e ative o SSL automático do
   Easypanel.
6. Deploy. Depois disso, qualquer alteração futura no código = novo deploy, e todos os sellers
   recebem a atualização automaticamente.

### Alternativa sem Easypanel (PM2 direto no VPS)

```bash
npm install
npm run build
pm2 start npm --name dashboard -- start
```

Depois configure um proxy reverso (Nginx) apontando o domínio para a porta 3000.

## Gerando/renovando links de seller

O workflow n8n tem uma rota de administração que gera (ou recupera, se já existir) o token de
cada seller cadastrado na planilha Tokens:

```
GET https://n8n-consult-n8n.k7je8d.easypanel.host/webhook/dashboard-data?admin_sync=elton-dash-2026-sync
```

Chame essa URL sempre que um novo seller for onboardado (ou peça para eu automatizar isso dentro
do WF00, que já dispara outras rotinas automáticas no onboarding). Ela nunca sobrescreve um token
já existente — só preenche o que estiver faltando.

**Troque a chave `elton-dash-2026-sync`** por algo só seu se quiser reforçar a segurança (é só
uma string de comparação dentro do Code node `Verificar Admin Key` do workflow).

Link final de cada seller: `https://<seu-dominio>/s/<dashboard_token>`
