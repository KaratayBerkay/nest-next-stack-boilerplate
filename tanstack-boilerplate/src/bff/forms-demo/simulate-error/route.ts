import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-ssr";
import { simulateErrorSchema } from "@/validators/forms/simulate-error";
import { ERROR_SCENARIOS } from "@/lib/forms/error-scenarios";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = simulateErrorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { scenarioId, delayMs, failRate } = parsed.data;

  const scenario = ERROR_SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    return NextResponse.json(
      { error: `Unknown scenario: ${scenarioId}` },
      { status: 400 },
    );
  }

  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  if (Math.random() > failRate) {
    return NextResponse.json(
      { statusCode: 200, exc: "OK", msg: "Simulated success", key: "" },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      statusCode: scenario.status,
      exc: scenario.exc,
      msg: scenario.msg,
      key: scenario.key,
      ...(scenario.field ? { field: scenario.field } : {}),
      ...(scenario.fields ? { fields: scenario.fields } : {}),
    },
    { status: scenario.status },
  );
}
