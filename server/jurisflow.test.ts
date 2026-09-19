import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "advogado-teste",
      email: "advogado@jurisflow.com.br",
      name: "Dr. Carlos Silva",
      loginMethod: "manus",
      role: "admin",
      oabNumber: "123.456",
      oabUf: "SP",
      phone: "(11) 98765-4321",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("JurisFlow API Routers", () => {
  it("deve responder a rota de dashboard metrics", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const metrics = await caller.dashboard.metrics();

    expect(metrics).toBeDefined();
    expect(typeof metrics.activeLawsuits).toBe("number");
    expect(typeof metrics.totalClients).toBe("number");
  });

  it("deve cadastrar e listar clientes no sistema", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const client = await caller.clients.create({
      type: "PF",
      name: "Cliente Teste Automatizado",
      cpfCnpj: "111.222.333-44",
      status: "ativo",
    });

    expect(client).toBeDefined();
    expect(client.id).toBeGreaterThan(0);

    const list = await caller.clients.list({ search: "Cliente Teste Automatizado" });
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].name).toBe("Cliente Teste Automatizado");
  });

  it("deve consultar modelos de documentos jurídicos", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const docs = await caller.documents.list({ isTemplate: true });
    expect(Array.isArray(docs)).toBe(true);
  });
});
