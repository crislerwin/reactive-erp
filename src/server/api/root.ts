import { createTRPCRouter } from "@/server/api/trpc";
import * as routers from "./routers";

export const appRouter = createTRPCRouter({
  staff: routers.staffRouter,
  branch: routers.branchRouter,
  product: routers.productRouter,
});

export type AppRouter = typeof appRouter;
