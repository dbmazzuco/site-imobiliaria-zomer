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

// Links do Tintim, que rastreia de qual campanha veio cada conversa. O Tintim
// aceita ?text=, marca a mensagem com caracteres invisíveis e redireciona para o
// WhatsApp da Zomer. A chave é o começo do tipo do imóvel, em minúsculas.
const TINTIM: [tipo: string, link: string][] = [
  ["apartamento", "https://tintim.link/whatsapp/9fd9dba2-37e8-47a7-afee-e7dbb4fd5db1/c8fbc576-2ae9-400e-a64f-6f17c581bbe9"],
  ["casa", "https://tintim.link/whatsapp/9fd9dba2-37e8-47a7-afee-e7dbb4fd5db1/6e5673d1-42fa-461b-aba4-7e290d1c87a0"],
  ["sala", "https://tintim.link/whatsapp/9fd9dba2-37e8-47a7-afee-e7dbb4fd5db1/1272e4cc-295c-4f21-b0a1-402d0fdf4f2d"],
];

/** WhatsApp do botão "Tenho interesse": Tintim para apartamentos, casas e salas; direto para o resto. */
export function whatsappImovel(i: Pick<ImovelResumo, "codigo" | "tipo" | "bairro">) {
  const mensagem = mensagemImovel(i);
  const tipo = i.tipo.toLowerCase();
  const tintim = TINTIM.find(([t]) => tipo.startsWith(t))?.[1];
  return tintim ? `${tintim}?text=${encodeURIComponent(mensagem)}` : whatsappLink(mensagem);
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
