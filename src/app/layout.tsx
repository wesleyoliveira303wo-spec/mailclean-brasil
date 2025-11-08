import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";

// Importar fontes do @fontsource (já instaladas)
import "@fontsource/geist-sans";
import "@fontsource/geist-mono";
import "@fontsource/inter";

export const metadata: Metadata = {
  title: "MailClean Brasil - Proteção Inteligente de E-mail",
  description: "Mantenha sua caixa de entrada limpa e segura com IA brasileira. Bloqueie spam e phishing automaticamente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-geist-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}