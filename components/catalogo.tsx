"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import type { Finalidade, ImovelResumo } from "@/lib/zomer";
import { CardImovel } from "./card-imovel";

type Ordem = "recentes" | "menor" | "maior";

const selectCls =
  "h-11 w-full appearance-none rounded-xl border border-linha bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2312204f%22><path d=%22M5.5 7.5 10 12l4.5-4.5%22 stroke=%22%2312204f%22 stroke-width=%221.6%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')] bg-[length:18px] bg-[right_12px_center] bg-no-repeat pr-10 pl-4 text-sm font-medium text-marinho focus:border-marinho focus:outline-none";

const unicos = (xs: string[]) =>
  [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));

export function Catalogo({ imoveis }: { imoveis: ImovelResumo[] }) {
  const contagem = {
    aluguel: imoveis.filter((i) => i.finalidade === "aluguel").length,
    venda: imoveis.filter((i) => i.finalidade === "venda").length,
  };
  const [finalidade, setFinalidade] = useState<Finalidade>(
    contagem.aluguel > 0 ? "aluguel" : "venda",
  );
  const [tipo, setTipo] = useState("");
  const [bairro, setBairro] = useState("");
  const [dorms, setDorms] = useState(0);
  const [ordem, setOrdem] = useState<Ordem>("recentes");

  const daFinalidade = imoveis.filter((i) => i.finalidade === finalidade);
  const tipos = unicos(daFinalidade.map((i) => i.tipo));
  // Bairros agrupados por cidade ("Centro" existe em Orleans e em Lauro Müller).
  const chaveBairro = (i: ImovelResumo) => `${i.cidade}|${i.bairro}`;
  const cidades = unicos(daFinalidade.map((i) => i.cidade)).map((cidade) => ({
    cidade,
    bairros: unicos(daFinalidade.filter((i) => i.cidade === cidade).map((i) => i.bairro)),
  }));

  const preco = (i: ImovelResumo) => i.preco ?? Infinity;
  const lista = daFinalidade
    .filter(
      (i) =>
        (!tipo || i.tipo === tipo) &&
        (!bairro || chaveBairro(i) === bairro) &&
        (!dorms || (i.dormitorios ?? 0) >= dorms),
    )
    .sort((a, b) =>
      ordem === "menor"
        ? preco(a) - preco(b)
        : ordem === "maior"
          ? (b.preco ?? 0) - (a.preco ?? 0)
          : Number(b.id) - Number(a.id),
    );

  function trocaFinalidade(f: Finalidade) {
    setFinalidade(f);
    setTipo("");
    setBairro("");
    setDorms(0);
  }

  const temFiltro = tipo || bairro || dorms;

  return (
    <div>
      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-linha sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="inline-flex shrink-0 rounded-full bg-areia p-1" role="tablist">
            {(["aluguel", "venda"] as const).map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={finalidade === f}
                onClick={() => trocaFinalidade(f)}
                disabled={contagem[f] === 0}
                className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
                  finalidade === f ? "bg-marinho text-white shadow" : "text-marinho hover:bg-areia-escura"
                }`}
              >
                {f === "aluguel" ? "Alugar" : "Comprar"}
                <span className={`ml-2 text-xs ${finalidade === f ? "text-white/70" : "text-cinza"}`}>
                  {contagem[f]}
                </span>
              </button>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
            <select aria-label="Tipo de imóvel" value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectCls}>
              <option value="">Tipo</option>
              {tipos.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select aria-label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} className={selectCls}>
              <option value="">Bairro</option>
              {cidades.map(({ cidade, bairros }) => (
                <optgroup key={cidade} label={cidade}>
                  {bairros.map((b) => (
                    <option key={b} value={`${cidade}|${b}`}>
                      {b}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <select aria-label="Dormitórios" value={dorms} onChange={(e) => setDorms(Number(e.target.value))} className={selectCls}>
              <option value={0}>Dormitórios</option>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}+ dormitório{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <select aria-label="Ordenar" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} className={selectCls}>
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-cinza">
          <strong className="text-marinho">{lista.length}</strong>{" "}
          {lista.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </p>
        {temFiltro ? (
          <button
            onClick={() => trocaFinalidade(finalidade)}
            className="text-sm font-semibold text-vinho underline-offset-4 hover:underline"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      {lista.length > 0 ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((i) => (
            <CardImovel key={i.id} imovel={i} />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-3xl border border-dashed border-linha bg-white/60 px-6 py-16 text-center">
          <SearchX className="size-10 text-cinza" />
          <p className="mt-4 font-display text-xl text-marinho">Nenhum imóvel com esses filtros</p>
          <p className="mt-2 max-w-sm text-sm text-cinza">
            Tente outra combinação ou fale com a gente pelo WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}
