import type { Finalidade, ImovelResumo } from "./zomer";

export const SITE = {
  nome: "Imobiliária Zomer",
  cidade: "Orleans/SC",
  creci: "CRECI 6363",
  telefone: "(48) 3466-0462",
  telefoneHref: "tel:+554834660462",
  whatsapp: "(48) 99619-6724",
  whatsappNumero: "5548996196724",
  email: "imobiliariazomer@hotmail.com",
  instagram: "https://www.instagram.com/imobiliariazomer/",
};

export function whatsappLink(mensagem: string) {
  return `https://wa.me/${SITE.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagemImovel(i: Pick<ImovelResumo, "codigo" | "tipo" | "bairro">) {
  return `Olá! Vi no site o imóvel código ${i.codigo} (${i.tipo}${i.bairro ? `, ${i.bairro}` : ""}) e gostaria de mais informações.`;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function preco(valor: number | null, finalidade?: Finalidade) {
  if (!valor) return "Consulte";
  return finalidade === "aluguel" ? `${brl.format(valor)}/mês` : brl.format(valor);
}

export const moeda = (valor: number) => brl.format(valor);

export function rotuloFinalidade(f: Finalidade) {
  return f === "aluguel" ? "Para alugar" : "À venda";
}

export function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}
