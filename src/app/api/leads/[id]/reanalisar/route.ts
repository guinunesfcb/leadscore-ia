import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leads, analises } from "@/db/schema";
import { analisarLead } from "@/lib/analisarLead";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("leadscore_auth");

    if (session?.value !== "authenticated_session") {
      return NextResponse.json(
        { error: "Acesso restrito. Faça login para reanalisar leads." },
        { status: 401 }
      );
    }

    const { id: leadId } = await params;

    // 1. Buscar o lead no Neon
    const leadExistente = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
    });

    if (!leadExistente) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    // 2. Executar nova análise com a Gemini API
    const { analise, modelo } = await analisarLead(leadExistente);

    // 3. Salvar nova análise preservando o histórico existente
    const [novaAnalise] = await db
      .insert(analises)
      .values({
        lead_id: leadExistente.id,
        score: analise.score,
        classificacao: analise.classificacao,
        justificativa: analise.justificativa,
        resposta_sugerida: analise.resposta_sugerida,
        modelo: modelo,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Lead reanalisado com sucesso",
      analise: novaAnalise,
    });
  } catch (error) {
    console.error("Erro ao reanalisar lead:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json(
      { error: "Erro ao processar nova análise do lead com IA" },
      { status: 500 }
    );
  }
}

