import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getImoveis, TAG_IMOVEIS } from "@/lib/zomer";

// Chamada pelo Vercel Cron todo dia às 6h (horário de Brasília), ver vercel.json.
// Marca os imóveis como desatualizados e já "acorda" as páginas para que elas releiam
// o site da Zomer em segundo plano: imóvel novo entra, imóvel alugado/vendido sai.
// Mesmo sem o cron, os dados se renovam sozinhos a cada 24h (cacheLife "days").
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // IDs da lista anterior (ainda em cache), lidos antes de invalidar. Um imóvel que
  // saiu da Zomer continua com a página antiga guardada até alguém visitá-la; sem
  // acordá-la aqui, o primeiro visitante de um link antigo veria o imóvel como ativo.
  const anteriores = await getImoveis().then(
    (lista) => lista.map((i) => i.id),
    () => [] as string[],
  );

  revalidateTag(TAG_IMOVEIS, "max");

  // A primeira visita depois do revalidateTag recebe a versão antiga e dispara a
  // releitura em segundo plano; fazemos essas visitas aqui, de 6 em 6.
  const paginas = ["/", ...anteriores.map((id) => `/imovel/${id}`)];
  const status: Record<string, number> = {};
  for (let i = 0; i < paginas.length; i += 6) {
    await Promise.all(
      paginas.slice(i, i + 6).map(async (path) => {
        const res = await fetch(new URL(path, request.nextUrl.origin), { cache: "no-store" }).catch(
          () => null,
        );
        status[path] = res?.status ?? 0;
      }),
    );
  }

  const falhas = Object.entries(status).filter(([, s]) => s !== 200);
  return Response.json({
    ok: falhas.length === 0,
    paginas: paginas.length,
    falhas: Object.fromEntries(falhas),
    em: new Date().toISOString(),
  });
}
