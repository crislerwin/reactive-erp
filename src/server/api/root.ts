import { createTRPCRouter } from "@/server/api/trpc";
import * as routers from "./routers";

export const appRouter = createTRPCRouter({
  staff: routers.staffRouter,
  branch: routers.branchRouter,
  product: routers.productRouter,
  productCategory: routers.productCategory,
  customer: routers.customerRouter,
  invoice: routers.invoicesRouter,
  report: routers.reportRouter,
});

export type AppRouter = typeof appRouter;
