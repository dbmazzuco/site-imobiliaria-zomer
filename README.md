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
| Cache de 1h | `'use cache'` + `cacheLife("zomer")` (`next.config.ts`) | Relê o site da Zomer no máximo 1h depois da última leitura, em segundo plano |
| Cron | `vercel.json` → `/api/sync` | Todo dia às 6h (Brasília) força a releitura de tudo; cada execução fica nos Logs como `[sync]` |
| Monitor | `.github/workflows/monitor.yml` + `scripts/monitor.mjs` | De hora em hora confere a landing contra o site da Zomer; se falhar, o GitHub manda e-mail |

A listagem é a fonte da verdade: se o ID não está mais nela, a página do imóvel mostra
"Este imóvel não está mais disponível" com sugestões.

### Proteções contra vitrine vazia

- **Leitura suspeita = erro, nunca lista vazia.** A Zomer sempre mostra "N Imóveis encontrados"
  (ou "Nenhum imóvel encontrado"). Página sem isso, contagem que não bate, total zero ou página de
  imóvel fora do padrão lançam erro em `lib/zomer.ts`.
- **Erro mantém a última versão boa.** Com erro na releitura, o Next continua servindo a última
  vitrine boa (por até 30 dias) e tenta de novo na hora seguinte.
- **Alerta em até ~1h.** O monitor falha (e o GitHub manda e-mail) se a vitrine estiver vazia, se a
  landing ou o site da Zomer não responderem, se o site da Zomer mudar de layout, ou se a vitrine
  ficar diferente da Zomer por mais de 3h. Para rodar na hora: aba **Actions → Monitor landing
  Zomer → Run workflow**, ou local com `node scripts/monitor.mjs`.

> Se a Atoda mudar o layout do site da Zomer, o monitor avisa e os seletores de `lib/zomer.ts`
> precisam de ajuste. Enquanto isso a landing segue com a última vitrine boa.

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
