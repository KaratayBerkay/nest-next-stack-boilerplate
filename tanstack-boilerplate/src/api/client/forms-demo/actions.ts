export function useFormsDemoActions() {
  const simulateError = async (
    scenarioId: string,
    opts?: { delayMs?: number; failRate?: number },
  ) => {
    const { simulateErrorServer } =
      await import("@/api/server/forms-demo/simulate");
    return simulateErrorServer(scenarioId, opts);
  };

  return { simulateError };
}
