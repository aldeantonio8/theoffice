import { NextResponse } from "next/server";

type AccessPayload = {
  email?: string;
  password?: string;
  departmentId?: string;
};

const protectedDepartments = new Set(["operations", "director", "projects"]);

export async function POST(request: Request) {
  let body: AccessPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Pedido inválido." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const departmentId = body.departmentId ?? "";

  if (!protectedDepartments.has(departmentId)) {
    return NextResponse.json(
      { ok: false, message: "Esta porta não requer credenciais." },
      { status: 400 },
    );
  }

  const allowedEmail = process.env.OFFICE_ACCESS_EMAIL?.trim().toLowerCase();
  const allowedPassword = process.env.OFFICE_ACCESS_PASSWORD;

  if (!allowedEmail || !allowedPassword) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "As credenciais de acesso ainda não foram configuradas no servidor.",
      },
      { status: 503 },
    );
  }

  if (email !== allowedEmail || password !== allowedPassword) {
    return NextResponse.json(
      { ok: false, message: "Email ou password incorretos." },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true });
}
