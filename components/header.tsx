import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

const LINKS = [
  { href: "/#imoveis", label: "Imóveis" },
  { href: "/#sobre", label: "A Zomer" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-linha/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-20 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={SITE.nome}>
          <Image
            src="/logo-zomer.jpg"
            alt={SITE.nome}
            width={767}
            height={544}
            priority
            className="h-11 w-auto sm:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-marinho md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-vinho">
              {l.label}
            </Link>
          ))}
        </nav>

        <a
          href={whatsappLink("Olá! Vim pelo site e gostaria de falar com a Zomer.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-marinho px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vinho"
        >
          <MessageCircle className="size-4" />
          <span className="hidden sm:inline">Fale no WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
