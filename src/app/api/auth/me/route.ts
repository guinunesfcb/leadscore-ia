import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("leadscore_auth");

  const isAuthenticated = session?.value === "authenticated_session";

  return NextResponse.json({ authenticated: isAuthenticated });
}
