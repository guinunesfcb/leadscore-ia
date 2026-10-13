"use client";

import { useEffect, useState, useCallback } from "react";
import { type Lead, type Analise } from "@/db/schema";
import { 
  RefreshCw, 
  Building2, 
  Mail, 
  Calendar, 
  Copy, 
  Check, 
  MessageSquareQuote,
  Sparkles,
  Inbox
} from "lucide-react";

type LeadComAnalises = Lead & {
  analises: Analise[];
};

export function PainelLeads() {
  const [leads, setLeads] = useState<LeadComAnalises[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leads");
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Erro ao carregar leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  function handleCopiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getClassificacaoBadge(classificacao: string | null) {
    if (classificacao === "quente") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          🔥 Quente
        </span>
      );
    }
    if (classificacao === "morno") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          ☀️ Morno
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
        ❄️ Frio
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Painel de Leads & Priorização Comercial</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerenciamento centralizado de contatos gravados no Neon PostgreSQL com avaliação por IA.
          </p>
        </div>
        <button
          onClick={fetchLeads}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {loading && leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
          <p className="font-medium">Carregando leads do Neon PostgreSQL...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Inbox className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">Nenhum lead cadastrado ainda</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Utilize o formulário de captação para registrar o primeiro contato comercial e gerar a análise automática com IA.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {leads.map((lead) => {
            const ultimaAnalise = lead.analises && lead.analises.length > 0 ? lead.analises[0] : null;

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 space-y-5"
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{lead.nome}</h3>
                      {ultimaAnalise && getClassificacaoBadge(ultimaAnalise.classificacao)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {lead.email}
                      </span>
                      {lead.empresa && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {lead.empresa} {lead.segmento ? `(${lead.segmento})` : ""}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "Data não registrada"}
                      </span>
                    </div>
                  </div>

                  {ultimaAnalise && (
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-xs uppercase text-slate-500 font-semibold">Score:</span>
                      <span className="text-xl font-extrabold text-slate-900">
                        {ultimaAnalise.score}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Mensagem Original do Lead */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400" />
                    Mensagem enviada pelo cliente
                  </h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-150 leading-relaxed whitespace-pre-wrap">
                    {lead.mensagem}
                  </p>
                </div>

                {/* Avaliação da IA */}
                {ultimaAnalise && (
                  <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-semibold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Justificativa Comercial da IA
                        </h4>
                        <span className="text-[10px] text-indigo-500 font-mono">
                          {ultimaAnalise.modelo}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed bg-white/80 p-3 rounded-lg border border-indigo-100">
                        {ultimaAnalise.justificativa}
                      </p>
                    </div>

                    {ultimaAnalise.resposta_sugerida && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                            Resposta Sugerida para Vendedor
                          </h4>
                          <button
                            onClick={() => handleCopiar(ultimaAnalise.resposta_sugerida!, ultimaAnalise.id)}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                          >
                            {copiedId === ultimaAnalise.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Resposta</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed bg-white/80 p-3 rounded-lg border border-indigo-100 whitespace-pre-wrap">
                          {ultimaAnalise.resposta_sugerida}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

