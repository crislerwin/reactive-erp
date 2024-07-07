import { createNextApiHandler } from "@trpc/server/adapters/next";
import { generateOpenApiDocument } from "trpc-openapi";
import http from "http";
import { createOpenApiHttpHandler } from "trpc-openapi";
import { env } from "@/env.mjs";
import { createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { AnyRouter } from "@trpc/server";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "tRPC OpenAPI",
  version: "1.0.0",
  baseUrl: "http://localhost:3000",
});

const server = http.createServer(
  createOpenApiHttpHandler({ router: appRouter as AnyRouter })
);

server.listen(3000);
