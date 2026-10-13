"use client";

import { useState } from "react";
import { FormularioLead } from "./FormularioLead";
import { PainelLeads } from "./PainelLeads";
import { UserPlus, LayoutDashboard } from "lucide-react";

export function LeadScoreApp() {
  const [activeTab, setActiveTab] = useState<"formulario" | "painel">("formulario");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleLeadCadastrado() {
    // Incrementa a key para forçar atualização do painel
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

        {/* Tabs Switcher */}
        <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl shadow-inner mt-4">
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
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="max-w-4xl mx-auto">
        {activeTab === "formulario" ? (
          <FormularioLead onLeadCadastrado={handleLeadCadastrado} />
        ) : (
          <PainelLeads key={refreshKey} />
        )}
      </div>
    </div>
  );
}

