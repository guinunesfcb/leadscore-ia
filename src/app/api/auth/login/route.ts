import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUser = process.env.DASHBOARD_USER || "admin";
    const expectedPassword = process.env.DASHBOARD_PASSWORD || "leadscore2026";

    if (username === expectedUser && password === expectedPassword) {
      const cookieStore = await cookies();
      cookieStore.set("leadscore_auth", "authenticated_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      return NextResponse.json({ success: true, message: "Login realizado com sucesso" });
    }

    return NextResponse.json(
      { error: "Credenciais inválidas. Verifique o usuário e a senha." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao processar solicitação de login" },
      { status: 500 }
    );
  }
}
