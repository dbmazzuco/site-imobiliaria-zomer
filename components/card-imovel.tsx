import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Car, House, Ruler } from "lucide-react";
import type { ImovelResumo } from "@/lib/zomer";
import { preco, rotuloFinalidade } from "@/lib/site";

export function CardImovel({ imovel }: { imovel: ImovelResumo }) {
  const specs = [
    imovel.dormitorios ? { icon: BedDouble, valor: imovel.dormitorios, label: "dorm." } : null,
    imovel.banheiros ? { icon: Bath, valor: imovel.banheiros, label: "banh." } : null,
    imovel.vagas ? { icon: Car, valor: imovel.vagas, label: imovel.vagas === 1 ? "vaga" : "vagas" } : null,
    imovel.area ? { icon: Ruler, valor: imovel.area, label: "m²" } : null,
  ].filter((s) => s !== null);

  return (
    <Link
      href={`/imovel/${imovel.id}`}
      prefetch={true}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-linha transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-marinho/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-areia-escura">
        {imovel.foto ? (
          <Image
            src={imovel.foto}
            alt={`${imovel.tipo} em ${imovel.bairro}, ${imovel.cidade}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-cinza">
            <House className="size-10" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-marinho shadow-sm">
          {rotuloFinalidade(imovel.finalidade)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-vinho uppercase">{imovel.tipo}</p>
          <p className="text-xs text-cinza">Cód. {imovel.codigo}</p>
        </div>
        <h3 className="mt-1.5 font-display text-xl leading-snug text-marinho">
          {imovel.bairro || imovel.cidade}
          <span className="text-cinza">, {imovel.cidade}</span>
        </h3>

        {specs.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-cinza">
            {specs.map(({ icon: Icon, valor, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon className="size-4 text-marinho/70" />
                {valor} {label}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-auto pt-5 text-xl font-bold text-marinho">
          {preco(imovel.preco, imovel.finalidade)}
        </p>
      </div>
    </Link>
  );
}
