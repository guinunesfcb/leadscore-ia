"use client";

import { useState, useEffect } from "react";
import { FormularioLead } from "./FormularioLead";
import { PainelLeads } from "./PainelLeads";
import { FormularioLogin } from "./FormularioLogin";
import { UserPlus, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";

export function LeadScoreApp() {
  const [activeTab, setActiveTab] = useState<"formulario" | "painel">("formulario");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Verificar se o usuário já possui sessão ativa
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setActiveTab("formulario");
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  }

  function handleLeadCadastrado() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Qualificação Inteligente de Leads com <span className="text-indigo-600">Gemini AI</span>
        </h1>
        <p className="text-base text-slate-600">
          Capture contatos de clientes, persista no PostgreSQL serverless da Neon e obtenha uma pontuação comercial precisa de 0 a 100 com sugestão de resposta imediata.
        </p>

        {/* Tabs Switcher e Status de Autenticação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab("formulario")}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "formulario"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Lead</span>
            </button>
            <button
              onClick={() => setActiveTab("painel")}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "painel"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel de Leads</span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Autenticado" />
              )}
            </button>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-xl transition shadow-sm"
              title="Encerrar sessão no painel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair (Logout)</span>
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="max-w-4xl mx-auto">
        {activeTab === "formulario" ? (
          <FormularioLead onLeadCadastrado={handleLeadCadastrado} />
        ) : isAuthenticated === true ? (
          <PainelLeads key={refreshKey} onLogout={handleLogout} />
        ) : (
          <FormularioLogin onLoginSuccess={() => setIsAuthenticated(true)} />
        )}
      </div>
    </div>
  );
}
