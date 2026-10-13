import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadScore IA - Qualificação e Priorização Inteligente de Leads",
  description:
    "Aplicação web para captação, análise comercial com Gemini AI e priorização de leads de pequenas e médias empresas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-200">
                ⚡
              </div>
              <div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">
                  LeadScore <span className="text-indigo-600">IA</span>
                </span>
                <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150">
                  Gemini 3.8 Flash
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="hidden sm:inline">Neon PostgreSQL</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Google Antigravity</span>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t bg-white py-6 mt-12 text-center text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p>
              LeadScore IA &copy; {new Date().getFullYear()} — Projeto acadêmico desenvolvido com Google Antigravity, Next.js, Neon e Gemini API.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

