import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

async function main() {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "owner",
      email: "nei.maldaner2014@gmail.com",
      name: "Dr. Nei Maldaner",
      loginMethod: "manus",
      role: "admin",
      oabNumber: "45.890",
      oabUf: "SP",
      phone: "(11) 98765-4321",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: () => {} } as any,
  };

  const caller = appRouter.createCaller(ctx);
  console.log("Populando banco de dados com dados de advocacia...");
  const res = await caller.seedDemoData();
  console.log("Resultado:", res);
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
