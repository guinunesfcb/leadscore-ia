import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { leads, analises } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function escaparCsv(valor: unknown): string {
  if (valor === null || valor === undefined) return '""';
  const str = String(valor).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get("leadscore_auth");

    if (!authSession || authSession.value !== "authenticated_session") {
      return NextResponse.json(
        { error: "Acesso não autorizado. Faça login para exportar os leads." },
        { status: 401 }
      );
    }

    // Buscar leads ordenados pelo mais recente
    const todosLeads = await db.select().from(leads).orderBy(desc(leads.created_at));

    // Buscar todas as análises ordenadas pelo mais recente
    const todasAnalises = await db.select().from(analises).orderBy(desc(analises.created_at));

    // Mapear cada lead para a sua última análise
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

    const linhas: string[] = [cabecalhos.map(escaparCsv).join(";")];

    for (const lead of todosLeads) {
      const ultimaAnalise = todasAnalises.find((a) => a.lead_id === lead.id);

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
    const csvContent = BOM + linhas.join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads_leadscore_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar leads em CSV:", error);
    return NextResponse.json(
      { error: "Erro ao gerar arquivo CSV de exportação" },
      { status: 500 }
    );
  }
}

