import { createTRPCRouter } from "@/server/api/trpc";
import * as routers from "./routers";

export const appRouter = createTRPCRouter({
  provider: routers.providerRoute,
  institution: routers.institutionRouter,
});

export type AppRouter = typeof appRouter;
