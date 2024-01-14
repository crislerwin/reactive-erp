import { createTRPCRouter } from "@/server/api/trpc";
import { providerRoute, institutionRouter } from "./routers";

export const appRouter = createTRPCRouter({
  provider: providerRoute,
  institution: institutionRouter,
});

export type AppRouter = typeof appRouter;
