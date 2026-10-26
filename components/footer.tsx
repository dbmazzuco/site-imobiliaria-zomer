import Image from "next/image";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { InstagramIcon } from "./icones";
import { SITE, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer id="contato" className="bg-marinho-escuro text-white/80">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image
            src="/logo-zomer-branco.png"
            alt={SITE.nome}
            width={180}
            height={179}
            className="h-20 w-auto"
          />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            Imóveis para alugar e comprar em {SITE.cidade}. {SITE.creci}.
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Fale com a gente</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a
                href={whatsappLink("Olá! Vim pelo site e gostaria de falar com a Zomer.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 hover:text-white"
              >
                <MessageCircle className="size-4 text-vinho-claro" /> {SITE.whatsapp}
              </a>
            </li>
            <li>
              <a href={SITE.telefoneHref} className="inline-flex items-center gap-3 hover:text-white">
                <Phone className="size-4 text-vinho-claro" /> {SITE.telefone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-3 break-all hover:text-white">
                <Mail className="size-4 shrink-0 text-vinho-claro" /> {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg text-white">Acompanhe</h2>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-3 text-sm hover:text-white"
          >
            <InstagramIcon className="size-4 text-vinho-claro" /> @imobiliariazomer
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-white/40 sm:px-6">
          © {SITE.nome} · {SITE.cidade} · {SITE.creci}
        </p>
      </div>
    </footer>
  );
}
