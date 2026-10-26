import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export function WhatsappFlutuante() {
  return (
    <a
      href={whatsappLink("Olá! Vim pelo site e gostaria de falar com a Zomer.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
