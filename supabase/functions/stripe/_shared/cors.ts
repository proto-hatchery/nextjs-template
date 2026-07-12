/**
 * CORS Headers
 * 
 * Shared CORS configuration for all Edge Functions.
 * 
 * @module supabase/functions/_shared/cors
 */

/**
 * Standard CORS headers for Edge Functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

/**
 * Apply CORS headers to response
 * 
 * @param headers - Existing headers
 * @returns Headers with CORS applied
 */
export function applyCorsHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    ...corsHeaders,
  }
}
