import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Bath, BedDouble, Car, MessageCircle, Phone, Ruler, Sofa } from "lucide-react";
import { CardImovel } from "@/components/card-imovel";
import { Galeria } from "@/components/galeria";
import { getImovel, getImoveis, type ImovelResumo } from "@/lib/zomer";
import { SITE, mensagemImovel, moeda, plural, preco, rotuloFinalidade, whatsappLink } from "@/lib/site";

export async function generateStaticParams() {
  const imoveis = await getImoveis();
  return imoveis.map((i) => ({ id: i.id }));
}

export async function generateMetadata(props: PageProps<"/imovel/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const imovel = await getImovel(id);
  if (!imovel) return { title: "Imóvel indisponível" };
  const titulo = `${imovel.tipo} ${imovel.finalidade === "aluguel" ? "para alugar" : "à venda"} em ${imovel.bairro}, ${imovel.cidade}`;
  return {
    title: titulo,
    description: `${titulo} · ${preco(imovel.preco, imovel.finalidade)} · Código ${imovel.codigo}`,
    openGraph: { images: imovel.fotos.slice(0, 1) },
  };
}

export default function ImovelPage(props: PageProps<"/imovel/[id]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10">
      <Link
        href="/#imoveis"
        className="inline-flex items-center gap-2 text-sm font-semibold text-marinho hover:text-vinho"
      >
        <ArrowLeft className="size-4" /> Todos os imóveis
      </Link>
      <Suspense fallback={<Esqueleto />}>
        <Detalhe params={props.params} />
      </Suspense>
    </div>
  );
}

async function Detalhe({ params }: Pick<PageProps<"/imovel/[id]">, "params">) {
  const { id } = await params;
  const [imovel, todos] = await Promise.all([getImovel(id), getImoveis()]);

  if (!imovel) {
    return (
      <>
        <div className="mt-8 rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-linha">
          <p className="font-display text-3xl text-marinho">Este imóvel não está mais disponível</p>
          <p className="mx-auto mt-3 max-w-md text-cinza">
            Ele provavelmente já foi alugado ou vendido. Veja abaixo outras opções ou fale com a gente.
          </p>
          <Link
            href="/#imoveis"
            className="mt-8 inline-flex rounded-full bg-marinho px-6 py-3 text-sm font-semibold text-white hover:bg-vinho"
          >
            Ver imóveis disponíveis
          </Link>
        </div>
        <Relacionados imoveis={[...todos].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 3)} />
      </>
    );
  }

  const specs = [
    imovel.dormitorios
      ? {
          icon: BedDouble,
          texto:
            plural(imovel.dormitorios, "dormitório", "dormitórios") +
            (imovel.suites ? ` (${plural(imovel.suites, "suíte", "suítes")})` : ""),
        }
      : null,
    imovel.banheiros ? { icon: Bath, texto: plural(imovel.banheiros, "banheiro", "banheiros") } : null,
    imovel.vagas ? { icon: Car, texto: plural(imovel.vagas, "vaga", "vagas") } : null,
    imovel.salas ? { icon: Sofa, texto: plural(imovel.salas, "sala", "salas") } : null,
    imovel.area ? { icon: Ruler, texto: `${imovel.area} m²` } : null,
  ].filter((s) => s !== null);

  const valores = [
    { label: imovel.finalidade === "aluguel" ? "Aluguel" : "Valor de venda", valor: imovel.preco },
    { label: "Condomínio (aprox.)", valor: imovel.condominio },
    { label: "IPTU (aprox.)", valor: imovel.iptu },
  ].filter((v): v is { label: string; valor: number } => !!v.valor);

  const relacionados = todos
    .filter((i) => i.id !== imovel.id && i.finalidade === imovel.finalidade)
    .sort((a, b) => Number(b.tipo === imovel.tipo) - Number(a.tipo === imovel.tipo))
    .slice(0, 3);

  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");

  return (
    <>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <Galeria fotos={imovel.fotos} alt={`${imovel.tipo} em ${local}`} />

          <div className="mt-10">
            <p className="text-sm font-semibold tracking-widest text-vinho uppercase">
              {imovel.tipo} · {rotuloFinalidade(imovel.finalidade)}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-marinho sm:text-5xl">{local}</h1>

            {specs.length > 0 && (
              <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map(({ icon: Icon, texto }) => (
                  <li key={texto} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-marinho ring-1 ring-linha">
                    <Icon className="size-5 shrink-0 text-vinho" /> {texto}
                  </li>
                ))}
              </ul>
            )}

            {imovel.descricao.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-2xl text-marinho">Sobre o imóvel</h2>
                <div className="mt-4 space-y-2 leading-relaxed text-tinta/80">
                  {imovel.descricao.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            )}

            {imovel.caracteristicas.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-2xl text-marinho">Características</h2>
                <dl className="mt-4 divide-y divide-linha overflow-hidden rounded-2xl bg-white ring-1 ring-linha">
                  {imovel.caracteristicas.map((c) => (
                    <div key={c.label} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
                      <dt className="text-cinza">{c.label}</dt>
                      <dd className="text-right font-semibold text-marinho">{c.valor}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-marinho/5 ring-1 ring-linha sm:p-8">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-areia px-3 py-1 text-xs font-bold text-marinho">
                {rotuloFinalidade(imovel.finalidade)}
              </span>
              <span className="text-sm text-cinza">Código {imovel.codigo}</span>
            </div>
            <p className="mt-5 font-display text-4xl text-marinho">{preco(imovel.preco, imovel.finalidade)}</p>

            {valores.length > 1 && (
              <dl className="mt-5 space-y-2 border-t border-linha pt-5 text-sm">
                {valores.map((v) => (
                  <div key={v.label} className="flex justify-between">
                    <dt className="text-cinza">{v.label}</dt>
                    <dd className="font-semibold text-marinho">{moeda(v.valor)}</dd>
                  </div>
                ))}
              </dl>
            )}

            <a
              href={whatsappLink(mensagemImovel(imovel))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-vinho px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-marinho"
            >
              <MessageCircle className="size-4" /> Tenho interesse
            </a>
            <a
              href={SITE.telefoneHref}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-marinho ring-1 ring-linha transition hover:ring-marinho"
            >
              <Phone className="size-4" /> {SITE.telefone}
            </a>
            <p className="mt-5 text-center text-xs text-cinza">
              Atendimento {SITE.nome} · {SITE.creci}
            </p>
          </div>
        </aside>
      </div>

      <Relacionados imoveis={relacionados} />
    </>
  );
}

function Relacionados({ imoveis }: { imoveis: ImovelResumo[] }) {
  if (imoveis.length === 0) return null;
  return (
    <section className="mt-20">
      <h2 className="font-display text-3xl text-marinho">Você também pode gostar</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {imoveis.map((i) => (
          <CardImovel key={i.id} imovel={i} />
        ))}
      </div>
    </section>
  );
}

function Esqueleto() {
  return (
    <div className="mt-6 grid animate-pulse gap-10 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <div className="aspect-[16/10] rounded-3xl bg-areia-escura" />
        <div className="mt-10 h-4 w-40 rounded bg-areia-escura" />
        <div className="mt-4 h-10 w-2/3 rounded bg-areia-escura" />
      </div>
      <div className="h-80 rounded-3xl bg-white ring-1 ring-linha" />
    </div>
  );
}
