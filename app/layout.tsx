import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsappFlutuante } from "@/components/whatsapp-flutuante";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Imobiliária Zomer | Imóveis para alugar e comprar em Orleans/SC",
    template: "%s | Imobiliária Zomer",
  },
  description:
    "Apartamentos, casas e salas para alugar e comprar em Orleans/SC. Imóveis atualizados todos os dias. CRECI 6363.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      {/* Google Tag Manager da Zomer (tráfego pago / conversões) */}
      <GoogleTagManager gtmId="GTM-TRS2HTC8" />
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsappFlutuante />
      </body>
    </html>
  );
}
