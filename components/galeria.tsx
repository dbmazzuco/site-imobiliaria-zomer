"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, House, X } from "lucide-react";

export function Galeria({ fotos, alt }: { fotos: string[]; alt: string }) {
  const [atual, setAtual] = useState(0);
  const [tela, setTela] = useState(false);
  const total = fotos.length;

  const anda = useCallback(
    (passo: number) => setAtual((a) => (a + passo + total) % total),
    [total],
  );

  useEffect(() => {
    if (!tela) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTela(false);
      if (e.key === "ArrowRight") anda(1);
      if (e.key === "ArrowLeft") anda(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [tela, anda]);

  if (total === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-3xl bg-areia-escura text-cinza">
        <House className="size-12" />
      </div>
    );
  }

  const seta =
    "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-marinho shadow-md transition hover:bg-white";

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-areia-escura">
        <Image
          key={fotos[atual]}
          src={fotos[atual]}
          alt={`${alt}: foto ${atual + 1} de ${total}`}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="cursor-zoom-in object-cover"
          onClick={() => setTela(true)}
        />
        {total > 1 && (
          <>
            <button aria-label="Foto anterior" onClick={() => anda(-1)} className={`${seta} left-3`}>
              <ChevronLeft className="size-5" />
            </button>
            <button aria-label="Próxima foto" onClick={() => anda(1)} className={`${seta} right-3`}>
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
        <button
          onClick={() => setTela(true)}
          className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full bg-marinho/85 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-marinho"
        >
          <Expand className="size-3.5" /> {atual + 1} / {total}
        </button>
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((f, i) => (
            <button
              key={f}
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setAtual(i)}
              className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl transition sm:w-28 ${
                i === atual ? "ring-2 ring-vinho ring-offset-2 ring-offset-areia" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={f} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {tela && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fotos do imóvel"
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setTela(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/70">
            <span>
              {atual + 1} / {total}
            </span>
            <button aria-label="Fechar" className="grid size-10 place-items-center rounded-full hover:bg-white/10">
              <X className="size-6 text-white" />
            </button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image src={fotos[atual]} alt={`${alt}: foto ${atual + 1}`} fill sizes="100vw" className="object-contain" />
            {total > 1 && (
              <>
                <button aria-label="Foto anterior" onClick={() => anda(-1)} className={`${seta} left-3`}>
                  <ChevronLeft className="size-5" />
                </button>
                <button aria-label="Próxima foto" onClick={() => anda(1)} className={`${seta} right-3`}>
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
          <div className="h-6" />
        </div>
      )}
    </div>
  );
}
