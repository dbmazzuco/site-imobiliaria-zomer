import "server-only";
import { load, type CheerioAPI } from "cheerio";
import { cacheLife, cacheTag } from "next/cache";

// Fonte dos dados: o site atual da Zomer (sistema AgiWeb, da Atoda Sistemas).
// Tudo o que é cadastrado / marcado como alugado no sistema deles aparece / some
// dessas páginas, então elas são a "fonte da verdade" da landing.
const BASE = "https://imobiliariazomer.com.br";

export const TAG_IMOVEIS = "imoveis";

export type Finalidade = "aluguel" | "venda";

const FIN: Record<Finalidade, number> = { venda: 1, aluguel: 2 };

export interface ImovelResumo {
  id: string;
  finalidade: Finalidade;
  codigo: string;
  tipo: string;
  cidade: string;
  bairro: string;
  preco: number | null;
  foto: string | null;
  area: number | null;
  dormitorios: number | null;
  banheiros: number | null;
  vagas: number | null;
  salas: number | null;
}

export interface ImovelDetalhe extends ImovelResumo {
  titulo: string;
  fotos: string[];
  descricao: string[];
  suites: number | null;
  condominio: number | null;
  iptu: number | null;
  caracteristicas: { label: string; valor: string }[];
  urlOriginal: string;
}

const limpa = (s: string | undefined | null) =>
  (s ?? "").replace(/\s+/g, " ").trim();

function numero(s: string | undefined | null): number | null {
  const m = limpa(s).match(/\d[\d.]*(,\d+)?/);
  if (!m) return null;
  const n = Number(m[0].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// Alguns bairros vêm cadastrados em minúsculas ("oratorio").
const capitaliza = (s: string) => s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1);

const naoZero =(n: number | null) => (n && n > 0 ? n : null);

async function baixa(path: string): Promise<CheerioAPI> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { "User-Agent": "Mozilla/5.0 (landing Imobiliaria Zomer)" },
  });
  if (!res.ok) throw new Error(`Zomer respondeu ${res.status} em ${path}`);
  return load(await res.text());
}

function parseListagem($: CheerioAPI, finalidade: Finalidade): ImovelResumo[] {
  const vistos = new Set<string>();
  const imoveis: ImovelResumo[] = [];

  $(".property_item").each((_, el) => {
    const card = $(el);
    const href = card.find("a[href*='ImovelSelecionado.aspx']").attr("href");
    const id = href?.match(/id=(\d+)/)?.[1];
    if (!id || vistos.has(id)) return;
    vistos.add(id);

    // "Código 12828 - Apartamento"
    const titulo = limpa(card.find("h3").first().text());
    const [, codigo = "", tipo = ""] =
      titulo.match(/C[oó]digo\s*(\S+)\s*-\s*(.+)/i) ?? [];

    // "Orleans - Centro"
    const [cidade = "", bairro = ""] = limpa(
      card.find(".proerty_text p").first().text(),
    ).split(/\s+-\s+/);

    const meta = (t: string) =>
      numero(card.find(`.property_meta span[title^='${t}']`).text());

    imoveis.push({
      id,
      finalidade,
      codigo,
      tipo: limpa(tipo),
      cidade: capitaliza(cidade),
      bairro: capitaliza(bairro),
      preco: naoZero(numero(card.find(".price").text())),
      foto: card.find(".image img").attr("src") ?? null,
      area: naoZero(meta("Área")),
      dormitorios: meta("Dormitório"),
      banheiros: meta("Banheiro"),
      vagas: meta("Garagem"),
      salas: meta("Sala"),
    });
  });

  return imoveis;
}

/** Todos os imóveis ativos no site da Zomer (aluguel + venda). */
export async function getImoveis(): Promise<ImovelResumo[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAG_IMOVEIS);

  const listas = await Promise.all(
    (Object.keys(FIN) as Finalidade[]).map(async (finalidade) =>
      parseListagem(
        await baixa(`ResultadoBusca.aspx?fin=${FIN[finalidade]}`),
        finalidade,
      ),
    ),
  );
  return listas.flat();
}

/**
 * Detalhe de um imóvel. Retorna null quando ele não está mais na listagem
 * (foi alugado/vendido ou desativado no sistema).
 */
export async function getImovel(id: string): Promise<ImovelDetalhe | null> {
  "use cache";
  cacheLife("days");
  cacheTag(TAG_IMOVEIS, `imovel-${id}`);

  const resumo = (await getImoveis()).find((i) => i.id === id);
  if (!resumo) return null;

  const path = `ImovelSelecionado.aspx?id=${id}&fin=${FIN[resumo.finalidade]}`;
  const $ = await baixa(path);

  // Imóvel removido: a página abre, mas sem título.
  if (!limpa($("#MainContent_lblTitulo").text())) return null;

  const fotos = [
    ...new Set(
      $("#property-d-1 img")
        .map((_, img) => $(img).attr("src"))
        .get()
        .filter((src) => src && !src.includes("_pequena")),
    ),
  ];

  // A descrição vem em "Descrição" (venda) ou "Observação" (aluguel).
  const descricao = $("#MainContent_idDescricao p, #MainContent_idObs p")
    .map((_, p) => limpa($(p).text()))
    .get()
    .filter((t) => t && !/^[.?\-]+$/.test(t))
    .map((t) => t.replace(/^\?\s+/, ""));

  const caracteristicas: { label: string; valor: string }[] = [];
  $(".property-d-table tr").each((_, tr) => {
    const tds = $(tr).find("td");
    const label = limpa(tds.eq(0).text());
    const valor = limpa(tds.eq(1).text());
    if (label && valor) caracteristicas.push({ label, valor });
  });
  const campo = (re: RegExp) =>
    caracteristicas.find((c) => re.test(c.label))?.valor;

  const dorms = campo(/Dormit/i);

  return {
    ...resumo,
    titulo: limpa($("meta[property='og:title']").attr("content")),
    fotos: fotos.length ? fotos : resumo.foto ? [resumo.foto] : [],
    descricao,
    tipo: campo(/Tipo do Im/i) ?? resumo.tipo,
    dormitorios: numero(dorms) ?? resumo.dormitorios,
    suites: numero(dorms?.match(/sendo\s+(\d+)/i)?.[1]),
    banheiros: numero(campo(/Banheiro/i)) ?? resumo.banheiros,
    vagas: numero(campo(/Vaga/i)) ?? resumo.vagas,
    salas: numero(campo(/Sala/i)) ?? resumo.salas,
    preco: naoZero(numero(campo(/Valor do Aluguel|Valor de Venda/i))) ?? resumo.preco,
    condominio: naoZero(numero(campo(/Condom/i))),
    iptu: naoZero(numero(campo(/IPTU/i))),
    // Só o que ainda não aparece nos ícones (dorm., banh., vagas, salas) nem nos valores.
    caracteristicas: caracteristicas.filter(
      (c) => !/Valor|Tipo do Im|Dormit|Banheiro|Vaga|Sala/i.test(c.label),
    ),
    urlOriginal: `${BASE}/${path}`,
  };
}
