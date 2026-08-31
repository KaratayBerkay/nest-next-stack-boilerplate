import { describe, it, expect, vi } from "vitest";

const fetchAuditLogsServerMock = vi.fn();

vi.mock("@/api/server/admin/audit-logs", () => ({
  fetchAuditLogsServer: fetchAuditLogsServerMock,
}));

// fetchAuditLogs ignores the queryFn context entirely (params are closed
// over), so the call below doesn't need a real one — `never` satisfies
// whatever specific QueryFunctionContext<TQueryKey> this queryOptions call
// happened to infer.
const dummyContext = undefined as never;

describe("auditLogsQueryOptions", () => {
  it("maps the server response's items through unchanged, not a differently-named field", async () => {
    const { auditLogsQueryOptions } = await import("../query");
    fetchAuditLogsServerMock.mockResolvedValue({
      items: [{ id: "log-1", action: "LOGIN", level: "INFO" }],
      total: 1,
      take: 50,
      skip: 0,
    });

    const options = auditLogsQueryOptions({ take: 50, skip: 0 });
    const result = await options.queryFn!(dummyContext);

    expect(result).toEqual({
      items: [{ id: "log-1", action: "LOGIN", level: "INFO" }],
      total: 1,
    });
  });

  it("returns an empty list when the server has no entries, not undefined", async () => {
    const { auditLogsQueryOptions } = await import("../query");
    fetchAuditLogsServerMock.mockResolvedValue({
      items: [],
      total: 0,
      take: 50,
      skip: 0,
    });

    const options = auditLogsQueryOptions({ take: 50, skip: 0 });
    const result = await options.queryFn!(dummyContext);

    expect(result.items).toEqual([]);
  });
});
