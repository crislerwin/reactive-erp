import { createTRPCRouter } from "@/server/api/trpc";
import { personRoutes } from "./routes/person";
import { companyRoutes } from "./routes/company";

export const appRouter = createTRPCRouter({
  person: personRoutes,
  company: companyRoutes,
});

export type AppRouter = typeof appRouter;
