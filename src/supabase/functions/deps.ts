export { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
export { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
export { default as Stripe } from 'https://esm.sh/stripe@12.4.0?target=deno';

// Re-export Request type
export type { Request } from 'https://deno.land/std@0.168.0/http/server.ts';

export interface RequestEvent {
  request: Request;
  url: URL;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
