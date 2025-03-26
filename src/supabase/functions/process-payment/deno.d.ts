// Type declarations for Deno runtime
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

// Type declarations for HTTP server
declare module "https://deno.land/std@0.208.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler?: (request: Request) => Response | Promise<Response>;
  }

  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    init?: ServeInit
  ): void;
}

// Type declarations for Stripe
declare module "https://esm.sh/stripe@13.10.0?target=deno" {
  export * from "stripe";
  export { default } from "stripe";
}
