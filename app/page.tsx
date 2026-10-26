import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, KeyRound, MapPin, MessageCircle, RefreshCw } from "lucide-react";
import { Catalogo } from "@/components/catalogo";
import { getImoveis, type ImovelResumo } from "@/lib/zomer";
import { SITE, whatsappLink } from "@/lib/site";

async function carregaImoveis(): Promise<ImovelResumo[] | null> {
  try {
    return await getImoveis();
  } catch (e) {
    console.error("Falha ao ler imóveis da Zomer", e);
    return null;
  }
}

const DIFERENCIAIS = [
  {
    icon: MapPin,
    titulo: "Gente de Orleans",
    texto: "Conhecemos cada bairro da cidade e ajudamos você a escolher o lugar certo para morar ou investir.",
  },
  {
    icon: RefreshCw,
    titulo: "Vitrine sempre atualizada",
    texto: "Os imóveis deste site são atualizados todos os dias. Se está aqui, está disponível.",
  },
  {
    icon: BadgeCheck,
    titulo: "Negócio com segurança",
    texto: `Imobiliária registrada (${SITE.creci}), com contrato e documentação acompanhados do início ao fim.`,
  },
];

export default async function Home() {
  const imoveis = await carregaImoveis();
  const destaques = (imoveis ?? [])
    .filter((i) => i.foto)
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 3);
  const qtdAluguel = imoveis?.filter((i) => i.finalidade === "aluguel").length ?? 0;
  const qtdVenda = imoveis?.filter((i) => i.finalidade === "venda").length ?? 0;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-vinho ring-1 ring-linha">
              <span className="size-1.5 rounded-full bg-vinho" /> Imobiliária em {SITE.cidade}
            </p>
            <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] font-medium tracking-tight text-marinho sm:text-6xl lg:text-7xl">
              Seu próximo endereço em <em className="text-vinho">Orleans</em> começa aqui.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cinza">
              Apartamentos, casas e salas para alugar ou comprar, com atendimento próximo de quem conhece a cidade.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#imoveis"
                className="inline-flex items-center gap-2 rounded-full bg-vinho px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-marinho"
              >
                Ver imóveis disponíveis <ArrowRight className="size-4" />
              </a>
              <a
                href={whatsappLink("Olá! Estou procurando um imóvel e gostaria de ajuda.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-marinho ring-1 ring-linha transition-colors hover:ring-marinho"
              >
                <MessageCircle className="size-4" /> Falar com um corretor
              </a>
            </div>

            {imoveis && (
              <dl className="mt-12 flex gap-10 border-t border-linha pt-8">
                <div>
                  <dt className="text-sm text-cinza">Para alugar</dt>
                  <dd className="font-display text-4xl text-marinho">{qtdAluguel}</dd>
                </div>
                <div>
                  <dt className="text-sm text-cinza">À venda</dt>
                  <dd className="font-display text-4xl text-marinho">{qtdVenda}</dd>
                </div>
              </dl>
            )}
          </div>

          {destaques.length === 3 && (
            <div className="relative grid h-[420px] grid-cols-2 grid-rows-2 gap-4 sm:h-[520px]">
              {destaques.map((d, idx) => (
                <Link
                  key={d.id}
                  href={`/imovel/${d.id}`}
                  prefetch={true}
                  className={`group relative overflow-hidden rounded-3xl bg-areia-escura ${
                    idx === 0 ? "row-span-2" : ""
                  }`}
                >
                  <Image
                    src={d.foto!}
                    alt={`${d.tipo} em ${d.bairro}`}
                    fill
                    priority={idx === 0}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 px-3 py-2 text-xs font-semibold text-marinho shadow-sm backdrop-blur">
                    {d.tipo} · {d.bairro}
                  </span>
                </Link>
              ))}
              <div className="absolute -top-4 -left-4 hidden rounded-2xl bg-marinho px-5 py-4 text-white shadow-xl sm:block">
                <KeyRound className="mb-1 size-5 text-vinho-claro" />
                <p className="text-sm font-semibold">Atualizado todos os dias</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* IMÓVEIS */}
      <section id="imoveis" className="bg-areia-escura/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-vinho uppercase">Imóveis disponíveis</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-marinho sm:text-5xl">
              Encontre o imóvel certo para você
            </h2>
          </div>
          {imoveis ? (
            <Catalogo imoveis={imoveis} />
          ) : (
            <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-linha">
              <p className="font-display text-2xl text-marinho">Estamos atualizando nossa vitrine</p>
              <p className="mt-2 text-cinza">
                Fale com a gente pelo WhatsApp {SITE.whatsapp} para ver os imóveis disponíveis.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold tracking-widest text-vinho uppercase">A Zomer</p>
              <h2 className="mt-3 font-display text-4xl leading-tight text-marinho sm:text-5xl">
                Cuidamos do seu imóvel como se fosse nosso.
              </h2>
            </div>
            <ul className="grid gap-8 sm:grid-cols-3 lg:gap-6">
              {DIFERENCIAIS.map(({ icon: Icon, titulo, texto }) => (
                <li key={titulo}>
                  <div className="grid size-12 place-items-center rounded-2xl bg-marinho text-white">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl text-marinho">{titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cinza">{texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA PROPRIETÁRIOS */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-marinho px-6 py-14 text-white sm:px-14 sm:py-16">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-vinho/40 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                Tem um imóvel para alugar ou vender?
              </h2>
              <p className="mt-3 text-white/70">
                Anuncie com a Zomer: cuidamos da divulgação, das visitas e do contrato.
              </p>
            </div>
            <a
              href={whatsappLink("Olá! Tenho um imóvel e gostaria de anunciar com a Zomer.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-marinho transition-colors hover:bg-areia lg:self-auto"
            >
              Quero anunciar meu imóvel <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
