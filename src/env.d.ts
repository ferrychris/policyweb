/// <reference types="vite/client" />

/**
 * ImportMetaEnv interface defines the shape of the environment variables.
 * @see https://vitejs.dev/guide/env-and-mode.html
 */
interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PRICE_STARTER: string;
  readonly VITE_STRIPE_PRICE_PROFESSIONAL: string;
  readonly VITE_STRIPE_PRICE_ENTERPRISE: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
