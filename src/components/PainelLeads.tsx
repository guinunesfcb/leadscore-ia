"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Inbox,
  LogOut,
  Filter,
  Search,
  X,
  Flame,
  Sun,
  Snowflake,
  SlidersHorizontal,
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import { GraficoLeads } from "./GraficoLeads";

type LeadComAnalises = Lead & {
  analises: Analise[];
};

interface PainelLeadsProps {
  onLogout?: () => void;
}

export function PainelLeads({ onLogout }: PainelLeadsProps = {}) {
  const [leads, setLeads] = useState<LeadComAnalises[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reanalisandoId, setReanalisandoId] = useState<string | null>(null);
  const [historicoAbertoId, setHistoricoAbertoId] = useState<string | null>(null);

  // Estados dos Filtros
  const [filtroClassificacao, setFiltroClassificacao] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [buscaTexto, setBuscaTexto] = useState<string>("");

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

  async function handleReanalisar(leadId: string) {
    setReanalisandoId(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}/reanalisar`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao reanalisar lead");
      }

      await fetchLeads();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao reanalisar lead");
    } finally {
      setReanalisandoId(null);
    }
  }

  // Atalhos de filtro por data
  function aplicarPresetData(dias: number) {
    const hoje = new Date();
    const dataInicial = new Date();
    dataInicial.setDate(hoje.getDate() - dias);

    const formatar = (d: Date) => d.toISOString().split("T")[0];

    setDataFim(formatar(hoje));
    setDataInicio(formatar(dataInicial));
  }

  function limparFiltros() {
    setFiltroClassificacao("todos");
    setDataInicio("");
    setDataFim("");
    setBuscaTexto("");
  }

  const temFiltroAtivo = 
    filtroClassificacao !== "todos" || 
    dataInicio !== "" || 
    dataFim !== "" || 
    buscaTexto.trim() !== "";

  // Contagens gerais
  const contagens = useMemo(() => {
    let quentes = 0;
    let mornos = 0;
    let frios = 0;

    for (const lead of leads) {
      const classe = lead.analises?.[0]?.classificacao;
      if (classe === "quente") quentes++;
      else if (classe === "morno") mornos++;
      else if (classe === "frio") frios++;
    }

    return { total: leads.length, quentes, mornos, frios };
  }, [leads]);

  // Filtragem dos leads
  const leadsFiltrados = useMemo(() => {
    return leads.filter((lead) => {
      const ultimaAnalise = lead.analises && lead.analises.length > 0 ? lead.analises[0] : null;

      // 1. Filtro de Classificação
      if (filtroClassificacao !== "todos") {
        if (!ultimaAnalise || ultimaAnalise.classificacao !== filtroClassificacao) {
          return false;
        }
      }

      // 2. Filtro de Texto (Nome, E-mail, Empresa, Segmento)
      if (buscaTexto.trim()) {
        const termo = buscaTexto.toLowerCase();
        const nomeMatch = lead.nome.toLowerCase().includes(termo);
        const emailMatch = lead.email.toLowerCase().includes(termo);
        const empresaMatch = lead.empresa ? lead.empresa.toLowerCase().includes(termo) : false;
        const segmentoMatch = lead.segmento ? lead.segmento.toLowerCase().includes(termo) : false;

        if (!nomeMatch && !emailMatch && !empresaMatch && !segmentoMatch) {
          return false;
        }
      }

      // 3. Filtro por Data
      if (lead.created_at) {
        const leadDate = new Date(lead.created_at);

        if (dataInicio) {
          const inicio = new Date(`${dataInicio}T00:00:00`);
          if (leadDate < inicio) return false;
        }

        if (dataFim) {
          const fim = new Date(`${dataFim}T23:59:59.999`);
          if (leadDate > fim) return false;
        }
      }

      return true;
    });
  }, [leads, filtroClassificacao, buscaTexto, dataInicio, dataFim]);

  function exportarCsv() {
    if (leadsFiltrados.length === 0) return;

    function escaparCsv(valor: unknown): string {
      if (valor === null || valor === undefined) return '""';
      const str = String(valor).replace(/"/g, '""');
      return `"${str}"`;
    }

    const cabecalhos = [
      "ID",
      "Nome",
      "Email",
      "Empresa",
      "Segmento",
      "Origem",
      "Data de Cadastro",
      "Score",
      "Classificação",
      "Modelo de IA",
      "Justificativa Comercial",
      "Resposta Sugerida",
      "Data da Análise",
    ];

    const linhas = [cabecalhos.map(escaparCsv).join(";")];

    for (const lead of leadsFiltrados) {
      const ultimaAnalise = lead.analises && lead.analises.length > 0 ? lead.analises[0] : null;
      const linha = [
        lead.id,
        lead.nome,
        lead.email,
        lead.empresa || "",
        lead.segmento || "",
        lead.origem || "site",
        lead.created_at ? new Date(lead.created_at).toLocaleString("pt-BR") : "",
        ultimaAnalise ? ultimaAnalise.score : "",
        ultimaAnalise ? ultimaAnalise.classificacao : "",
        ultimaAnalise ? ultimaAnalise.modelo : "",
        ultimaAnalise ? ultimaAnalise.justificativa : "",
        ultimaAnalise ? ultimaAnalise.resposta_sugerida : "",
        ultimaAnalise?.created_at ? new Date(ultimaAnalise.created_at).toLocaleString("pt-BR") : "",
      ];
      linhas.push(linha.map(escaparCsv).join(";"));
    }

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + linhas.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `leads_leadscore_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function getClassificacaoBadge(classificacao: string | null) {
    if (classificacao === "quente") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <Flame className="w-3 h-3 text-red-600" />
          <span>Quente</span>
        </span>
      );
    }
    if (classificacao === "morno") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Sun className="w-3 h-3 text-amber-600" />
          <span>Morno</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
        <Snowflake className="w-3 h-3 text-blue-600" />
        <span>Frio</span>
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Título e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Painel de Leads & Priorização Comercial</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerenciamento centralizado de contatos gravados no Neon PostgreSQL com avaliação por IA.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportarCsv}
            disabled={leadsFiltrados.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 border border-emerald-200 rounded-xl transition shadow-sm"
            title="Exportar leads exibidos para planilha CSV formatada"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV ({leadsFiltrados.length})</span>
          </button>
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-xl transition shadow-sm"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>

      {/* Gráfico de Distribuição por Classificação */}
      <GraficoLeads leads={leads} />

      {/* Cartões Rápidos de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFiltroClassificacao("todos")}
          className={`p-4 rounded-xl border text-left transition ${
            filtroClassificacao === "todos"
              ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Todos os Leads
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {contagens.total}
          </span>
        </button>

        <button
          onClick={() => setFiltroClassificacao("quente")}
          className={`p-4 rounded-xl border text-left transition ${
            filtroClassificacao === "quente"
              ? "bg-red-50 border-red-200 ring-2 ring-red-500/20"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Quentes
          </span>
          <span className="text-2xl font-bold text-red-900 mt-1 block">
            {contagens.quentes}
          </span>
        </button>

        <button
          onClick={() => setFiltroClassificacao("morno")}
          className={`p-4 rounded-xl border text-left transition ${
            filtroClassificacao === "morno"
              ? "bg-amber-50 border-amber-200 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <Sun className="w-3.5 h-3.5" />
            Mornos
          </span>
          <span className="text-2xl font-bold text-amber-900 mt-1 block">
            {contagens.mornos}
          </span>
        </button>

        <button
          onClick={() => setFiltroClassificacao("frio")}
          className={`p-4 rounded-xl border text-left transition ${
            filtroClassificacao === "frio"
              ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <Snowflake className="w-3.5 h-3.5" />
            Frios
          </span>
          <span className="text-2xl font-bold text-blue-900 mt-1 block">
            {contagens.frios}
          </span>
        </button>
      </div>

      {/* Seção de Filtros por Classificação, Data e Busca */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filtros de Consulta</span>
          </div>

          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Busca Textual */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Buscar Lead
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                placeholder="Filtrar por nome, empresa ou e-mail..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Filtro de Classificação */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Classificação
            </label>
            <select
              value={filtroClassificacao}
              onChange={(e) => setFiltroClassificacao(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
            >
              <option value="todos">Todas as temperaturas</option>
              <option value="quente">🔥 Quentes (71 a 100)</option>
              <option value="morno">☀️ Mornos (41 a 70)</option>
              <option value="frio">❄️ Frios (0 a 40)</option>
            </select>
          </div>

          {/* Data De / Até */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Período de Cadastro
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                title="Data inicial"
              />
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                title="Data final"
              />
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos de Data */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-600 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Atalhos:
          </span>
          <button
            onClick={() => aplicarPresetData(0)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
          >
            Hoje
          </button>
          <button
            onClick={() => aplicarPresetData(7)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => aplicarPresetData(30)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
          >
            Últimos 30 dias
          </button>
        </div>

        {/* Barra de Status da Filtragem */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Exibindo <strong className="text-slate-800">{leadsFiltrados.length}</strong> de{" "}
            <strong className="text-slate-800">{leads.length}</strong> leads cadastrados
          </span>

          {temFiltroAtivo && (
            <span className="text-indigo-600 font-medium">
              Filtros ativos aplicados
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo da Lista de Leads */}
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
      ) : leadsFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Filter className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-base font-semibold text-slate-800">
            Nenhum lead corresponde aos filtros selecionados
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Tente ajustar os parâmetros de classificação, o período de datas ou o termo de busca.
          </p>
          <button
            onClick={limparFiltros}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-xl transition"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {leadsFiltrados.map((lead) => {
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

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleReanalisar(lead.id)}
                      disabled={reanalisandoId === lead.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 border border-indigo-200 rounded-xl transition shadow-sm"
                      title="Reavaliar este lead com a Gemini API e registrar nova análise no Neon"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 text-indigo-600 ${reanalisandoId === lead.id ? "animate-spin" : ""}`} />
                      <span>{reanalisandoId === lead.id ? "Reanalisando..." : "Reanalisar Lead"}</span>
                    </button>

                    {ultimaAnalise && (
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        <span className="text-xs uppercase text-slate-500 font-semibold">Score:</span>
                        <span className="text-xl font-extrabold text-slate-900">
                          {ultimaAnalise.score}
                          <span className="text-xs font-normal text-slate-400">/100</span>
                        </span>
                      </div>
                    )}
                  </div>
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

                {/* Histórico de Análises Anteriores (se houver mais de 1) */}
                {lead.analises && lead.analises.length > 1 && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() =>
                        setHistoricoAbertoId(
                          historicoAbertoId === lead.id ? null : lead.id
                        )
                      }
                      className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Histórico de avaliações ({lead.analises.length} no total)
                      </span>
                      {historicoAbertoId === lead.id ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {historicoAbertoId === lead.id && (
                      <div className="mt-3 space-y-3 pl-3 border-l-2 border-indigo-200">
                        <p className="text-[11px] text-slate-400 font-medium">
                          Avaliações anteriores preservadas no Neon PostgreSQL:
                        </p>
                        {lead.analises.slice(1).map((analiseAnterior, idx) => (
                          <div
                            key={analiseAnterior.id}
                            className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700">
                                  #{lead.analises.length - 1 - idx}
                                </span>
                                {getClassificacaoBadge(analiseAnterior.classificacao)}
                                <span className="font-bold text-slate-800">
                                  Score: {analiseAnterior.score}/100
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {analiseAnterior.created_at
                                  ? new Date(analiseAnterior.created_at).toLocaleString("pt-BR", {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })
                                  : ""}
                              </span>
                            </div>
                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-700">Justificativa: </span>
                              {analiseAnterior.justificativa}
                            </p>
                            {analiseAnterior.modelo && (
                              <div className="text-[10px] font-mono text-slate-400">
                                Modelo: {analiseAnterior.modelo}
                              </div>
                            )}
                          </div>
                        ))}
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
