import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { TAG_IMOVEIS } from "@/lib/zomer";

// Chamada pelo Vercel Cron todo dia às 6h (horário de Brasília), ver vercel.json.
// Marca os imóveis como desatualizados e já "acorda" a home para que ela releia o
// site da Zomer em segundo plano: imóvel novo entra, imóvel alugado/vendido sai.
// Mesmo sem o cron, os dados se renovam sozinhos a cada 24h (cacheLife "days").
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  revalidateTag(TAG_IMOVEIS, "max");

  // Primeira visita depois do revalidateTag dispara a releitura; fazemos ela aqui.
  const res = await fetch(new URL("/", request.nextUrl.origin), { cache: "no-store" });

  return Response.json({ ok: true, home: res.status, em: new Date().toISOString() });
}
