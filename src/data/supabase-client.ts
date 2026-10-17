import { createClient } from "@supabase/supabase-js";

export function getConfiguredSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url && !publishableKey) return null;
  if (!url || !publishableKey) {
    throw new Error("Set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to configure Supabase.");
  }

  return createClient(url, publishableKey);
}
