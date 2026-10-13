"use client";

import { useMemo } from "react";
import { type Lead, type Analise } from "@/db/schema";
import { PieChart, Flame, Sun, Snowflake, TrendingUp, Award } from "lucide-react";

type LeadComAnalises = Lead & {
  analises: Analise[];
};

interface GraficoLeadsProps {
  leads: LeadComAnalises[];
}

export function GraficoLeads({ leads }: GraficoLeadsProps) {
  const dados = useMemo(() => {
    let quentes = 0;
    let mornos = 0;
    let frios = 0;
    let somaScore = 0;
    let totalComScore = 0;

    for (const lead of leads) {
      const analise = lead.analises?.[0];
      if (analise) {
        if (analise.classificacao === "quente") quentes++;
        else if (analise.classificacao === "morno") mornos++;
        else if (analise.classificacao === "frio") frios++;

        if (typeof analise.score === "number") {
          somaScore += analise.score;
          totalComScore++;
        }
      }
    }

    const total = leads.length;
    const pctQuentes = total > 0 ? Math.round((quentes / total) * 100) : 0;
    const pctMornos = total > 0 ? Math.round((mornos / total) * 100) : 0;
    const pctFrios = total > 0 ? Math.round((frios / total) * 100) : 0;
    const mediaScore = totalComScore > 0 ? Math.round(somaScore / totalComScore) : 0;

    return {
      total,
      quentes,
      mornos,
      frios,
      pctQuentes,
      pctMornos,
      pctFrios,
      mediaScore,
    };
  }, [leads]);

  if (dados.total === 0) {
    return null;
  }

  // Cálculo dos arcos do Donut SVG
  // Circunferência de um círculo com raio r = 40: 2 * PI * 40 = ~251.32
  const circumference = 251.32;
  const strokeQuentes = (dados.pctQuentes / 100) * circumference;
  const strokeMornos = (dados.pctMornos / 100) * circumference;
  const strokeFrios = (dados.pctFrios / 100) * circumference;

  const offsetQuentes = 0;
  const offsetMornos = -strokeQuentes;
  const offsetFrios = -(strokeQuentes + strokeMornos);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <span>Distribuição de Leads por Classificação</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão consolidada da temperatura comercial e média de score dos contatos captados.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-indigo-50/60 px-3 py-1.5 rounded-xl border border-indigo-150">
          <Award className="w-4 h-4 text-indigo-600" />
          <span className="text-xs text-indigo-900 font-semibold">Média Geral de Score:</span>
          <span className="text-sm font-extrabold text-indigo-700">{dados.mediaScore}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Gráfico Donut SVG */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Círculo de fundo */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="12"
              />

              {/* Segmento Quentes (Vermelho) */}
              {dados.quentes > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray={`${strokeQuentes} ${circumference - strokeQuentes}`}
                  strokeDashoffset={offsetQuentes}
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Segmento Mornos (Âmbar) */}
              {dados.mornos > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={`${strokeMornos} ${circumference - strokeMornos}`}
                  strokeDashoffset={offsetMornos}
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Segmento Frios (Azul) */}
              {dados.frios > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray={`${strokeFrios} ${circumference - strokeFrios}`}
                  strokeDashoffset={offsetFrios}
                  className="transition-all duration-700 ease-out"
                />
              )}
            </svg>

            {/* Texto Central do Donut */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {dados.total}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Leads
              </span>
            </div>
          </div>
        </div>

        {/* Detalhamento e Legendas */}
        <div className="md:col-span-7 space-y-4">
          {/* Barra de Distribuição Horizontal Contínua */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Distribuição Proporcional</span>
              <span>100% da Base</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {dados.quentes > 0 && (
                <div
                  style={{ width: `${dados.pctQuentes}%` }}
                  className="bg-red-500 transition-all duration-500"
                  title={`Quentes: ${dados.quentes} (${dados.pctQuentes}%)`}
                />
              )}
              {dados.mornos > 0 && (
                <div
                  style={{ width: `${dados.pctMornos}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Mornos: ${dados.mornos} (${dados.pctMornos}%)`}
                />
              )}
              {dados.frios > 0 && (
                <div
                  style={{ width: `${dados.pctFrios}%` }}
                  className="bg-blue-500 transition-all duration-500"
                  title={`Frios: ${dados.frios} (${dados.pctFrios}%)`}
                />
              )}
            </div>
          </div>

          {/* Cards de Legenda Detalhada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Card Quentes */}
            <div className="bg-red-50/50 border border-red-150 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-red-950 block">Quentes</span>
                  <span className="text-[11px] text-red-700">{dados.pctQuentes}% do total</span>
                </div>
              </div>
              <span className="text-lg font-extrabold text-red-900">{dados.quentes}</span>
            </div>

            {/* Card Mornos */}
            <div className="bg-amber-50/50 border border-amber-150 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-950 block">Mornos</span>
                  <span className="text-[11px] text-amber-700">{dados.pctMornos}% do total</span>
                </div>
              </div>
              <span className="text-lg font-extrabold text-amber-900">{dados.mornos}</span>
            </div>

            {/* Card Frios */}
            <div className="bg-blue-50/50 border border-blue-150 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Snowflake className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-950 block">Frios</span>
                  <span className="text-[11px] text-blue-700">{dados.pctFrios}% do total</span>
                </div>
              </div>
              <span className="text-lg font-extrabold text-blue-900">{dados.frios}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
