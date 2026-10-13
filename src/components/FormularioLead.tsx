"use client";

import { useState } from "react";
import { type Lead, type Analise } from "@/db/schema";
import { CheckCircle2, Sparkles, AlertCircle, Loader2 } from "lucide-react";

interface FormularioLeadProps {
  onLeadCadastrado?: (lead: Lead, analise: Analise) => void;
}

export function FormularioLead({ onLeadCadastrado }: FormularioLeadProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [segmento, setSegmento] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ lead: Lead; analise: Analise } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setResultado(null);
    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          empresa: empresa || null,
          segmento: segmento || null,
          mensagem,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao enviar formulário");
      }

      setResultado(data);
      if (onLeadCadastrado) {
        onLeadCadastrado(data.lead, data.analise);
      }

      // Limpar formulário
      setNome("");
      setEmail("");
      setEmpresa("");
      setSegmento("");
      setMensagem("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar lead");
    } finally {
      setLoading(false);
    }
  }

  function getClassificacaoBadge(classificacao: string | null) {
    if (classificacao === "quente") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
          🔥 Quente
        </span>
      );
    }
    if (classificacao === "morno") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          ☀️ Morno
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        ❄️ Frio
      </span>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Captação de Novo Lead</span>
          <span className="text-xs font-normal bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-150">
            Análise Instantânea
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Preencha os dados do contato comercial para salvar no Neon PostgreSQL e receber o score de IA via Gemini 3.8 Flash.
        </p>
      </div>

      {erro && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Erro ao processar</p>
            <p>{erro}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Contato *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Carlos Oliveira"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              E-mail Comercial *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@empresa.com.br"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nome da Empresa (opcional)
            </label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Ex: Soluções Logísticas Ltda"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Segmento de Atuação (opcional)
            </label>
            <input
              type="text"
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              placeholder="Ex: Varejo, Tecnologia, Saúde"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Mensagem / Necessidade do Lead *
          </label>
          <textarea
            required
            rows={4}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Descreva a solicitação ou mensagem deixada pelo cliente no site..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
            disabled={loading}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando com Gemini AI & Gravando no Neon...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enviar Lead e Analisar com IA</span>
              </>
            )}
          </button>
        </div>
      </form>

      {resultado && (
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Lead cadastrado e analisado com sucesso!</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">
                  Avaliação Comercial
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {resultado.analise.score}
                    <span className="text-base text-slate-400 font-normal">/100</span>
                  </span>
                  {getClassificacaoBadge(resultado.analise.classificacao)}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                Modelo: <span className="font-mono text-slate-700">{resultado.analise.modelo}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Justificativa da IA:
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {resultado.analise.justificativa}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Sugestão de Resposta para o Vendedor:
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {resultado.analise.resposta_sugerida}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

