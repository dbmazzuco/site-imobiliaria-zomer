// Monitor da landing da Zomer. Roda de hora em hora pelo GitHub Actions
// (.github/workflows/monitor.yml). Se algo estiver errado, o job falha e o
// GitHub manda e-mail para o dono do repositório.
//
// Verifica:
//  1. a landing responde e tem imóveis na vitrine;
//  2. o site da Zomer está legível (fora do ar ou layout novo quebram a leitura);
//  3. a vitrine bate com o site da Zomer (ou está se atualizando dentro do prazo);
//  4. a página de um imóvel abre normalmente.
//
// Uso local: node scripts/monitor.mjs

const SITE = process.env.SITE_URL ?? "https://imobiliariazomer.vercel.app";
const ZOMER = process.env.ZOMER_URL ?? "https://imobiliariazomer.com.br";
// Com cacheLife "zomer" (revalida em 1h), a vitrine nunca deveria ficar mais
// velha que isso enquanto o site da Zomer estiver legível.
const IDADE_MAXIMA_H = 3;

const erros = [];
const avisos = [];
const resumo = [];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function baixa(url, { tentativas = 3, intervalo = 30_000 } = {}) {
  let ultimo;
  for (let i = 1; i <= tentativas; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (monitor landing Zomer)" },
        signal: AbortSignal.timeout(60_000),
      });
      const texto = await res.text();
      if (res.ok) return { res, texto };
      ultimo = new Error(`HTTP ${res.status}`);
    } catch (e) {
      ultimo = e;
    }
    if (i < tentativas) await espera(intervalo);
  }
  throw new Error(`${url} falhou ${tentativas}x: ${ultimo?.message ?? ultimo}`);
}

const ids = (texto, re) => new Set([...texto.matchAll(re)].map((m) => m[1]));

// 1. Landing
let landing = new Set();
let idadeH = null;
try {
  const { res, texto } = await baixa(`${SITE}/`);
  // Os imóveis vão no payload do componente da vitrine: "id":"60428","finalidade":"aluguel"
  landing = ids(texto.replaceAll('\\"', '"'), /"id":"(\d+)","finalidade":"(?:aluguel|venda)"/g);
  idadeH = Number(res.headers.get("age") ?? 0) / 3600;
  resumo.push(`Landing: ${landing.size} imóveis (página gerada há ${idadeH.toFixed(1)}h)`);
  if (landing.size === 0) erros.push("A vitrine da landing está SEM IMÓVEIS.");
} catch (e) {
  erros.push(`A landing não respondeu: ${e.message}`);
}

// 2. Site da Zomer
let zomer = null;
try {
  const paginas = await Promise.all(
    [1, 2].map(async (fin) => (await baixa(`${ZOMER}/ResultadoBusca.aspx?fin=${fin}`)).texto),
  );
  const legivel = paginas.every(
    (p) => /MainContent_lblSubTitulo">\s*\d+\s+Im/.test(p) || /Nenhum im[oó]vel encontrado/i.test(p),
  );
  if (!legivel) {
    erros.push(
      "O site da Zomer respondeu fora do padrão (layout mudou ou página de erro). " +
        "A landing segue mostrando a última vitrine boa, mas não vai se atualizar até ajustarmos lib/zomer.ts.",
    );
  } else {
    zomer = ids(paginas.join("\n"), /ImovelSelecionado\.aspx\?id=(\d+)/g);
    resumo.push(`Site da Zomer: ${zomer.size} imóveis`);
  }
} catch (e) {
  erros.push(
    `O site da Zomer (${ZOMER}) está fora do ar: ${e.message}. ` +
      "A landing segue com a última vitrine boa enquanto isso.",
  );
}

// 3. Vitrine x Zomer
if (zomer && landing.size > 0) {
  const faltando = [...zomer].filter((id) => !landing.has(id));
  const sobrando = [...landing].filter((id) => !zomer.has(id));
  if (faltando.length || sobrando.length) {
    const msg =
      `Diferença: ${faltando.length} novo(s) na Zomer ainda fora da landing [${faltando.join(", ")}], ` +
      `${sobrando.length} removido(s) da Zomer ainda na landing [${sobrando.join(", ")}].`;
    if (idadeH !== null && idadeH > IDADE_MAXIMA_H) {
      erros.push(`A vitrine não está se atualizando (página com ${idadeH.toFixed(1)}h). ${msg}`);
    } else {
      avisos.push(`${msg} Normal logo após mudanças na Zomer; a landing relê em até 1h.`);
    }
  } else {
    resumo.push("Vitrine idêntica ao site da Zomer.");
  }
}

// 4. Página de um imóvel
const amostra = [...landing][0];
if (amostra) {
  try {
    const { texto } = await baixa(`${SITE}/imovel/${amostra}`);
    if (!texto.includes("Tenho interesse") && !texto.includes("não está mais disponível")) {
      erros.push(`A página do imóvel ${amostra} abriu sem conteúdo.`);
    } else {
      resumo.push(`Página de imóvel (${amostra}): ok`);
    }
  } catch (e) {
    erros.push(`A página do imóvel ${amostra} não abriu: ${e.message}`);
  }
}

// Saída (anotações do GitHub Actions + resumo do job)
const status = erros.length ? "❌ PROBLEMA" : "✅ OK";
const linhas = [
  `## Monitor landing Zomer: ${status}`,
  "",
  ...resumo.map((l) => `- ${l}`),
  ...avisos.map((l) => `- ⚠️ ${l}`),
  ...erros.map((l) => `- ❌ ${l}`),
];
console.log(linhas.join("\n"));
for (const a of avisos) console.log(`::warning::${a}`);
for (const e of erros) console.log(`::error::${e}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, linhas.join("\n") + "\n");
}
// exitCode em vez de process.exit(): deixa as conexões fecharem sozinhas.
process.exitCode = erros.length ? 1 : 0;
