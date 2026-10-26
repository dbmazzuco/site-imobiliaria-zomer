# Imobiliária Zomer: landing page

Landing page da Imobiliária Zomer (Orleans/SC). Os imóveis são lidos **direto do site atual**
(imobiliariazomer.com.br, sistema AgiWeb da Atoda Sistemas), sem API e sem n8n:

- imóvel cadastrado no sistema da Zomer → aparece aqui;
- imóvel marcado como alugado/vendido → some daqui;
- preço, fotos, descrição e características vêm do cadastro deles.

## Como a sincronização funciona

| Peça | Onde | O que faz |
| --- | --- | --- |
| Leitor | `lib/zomer.ts` | Lê `ResultadoBusca.aspx?fin=1/2` (venda/aluguel) e `ImovelSelecionado.aspx` de cada imóvel |
| Cache diário | `'use cache'` + `cacheLife("days")` | Guarda os dados por 24h; depois disso a próxima visita relê o site em segundo plano |
| Cron | `vercel.json` → `/api/sync` | Todo dia às 6h (Brasília) força a releitura, para a vitrine já amanhecer atualizada |

A listagem é a fonte da verdade: se o ID não está mais nela, a página do imóvel mostra
"Este imóvel não está mais disponível" com sugestões.

> Se a Atoda mudar o layout do site da Zomer, os seletores de `lib/zomer.ts` podem precisar de ajuste.

## Rodar local

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Forçar a sincronização: http://localhost:3000/api/sync

## Publicar na Vercel

1. Importe o repositório na Vercel (framework detectado: Next.js, sem configuração extra).
2. Em **Settings → Environment Variables**, crie `CRON_SECRET` com um valor aleatório.
   A Vercel envia esse segredo automaticamente nas chamadas do cron; sem ele, qualquer
   pessoa poderia chamar `/api/sync` (inofensivo, mas desnecessário).
3. O cron diário (`vercel.json`) é ativado sozinho no deploy de produção.

## Onde mexer

- Contatos (WhatsApp, telefone, e-mail, Instagram): `lib/site.ts`
- Cores e fontes: `app/globals.css` e `app/layout.tsx`
- Home: `app/page.tsx` · Página do imóvel: `app/imovel/[id]/page.tsx`
