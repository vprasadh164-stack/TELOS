import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigurationError =
  (url && !publishableKey) || (!url && publishableKey)
    ? "Set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to configure Supabase."
    : null;

export type AppSupabaseClient = ReturnType<typeof createClient<Database>>;

export const supabase: AppSupabaseClient | null =
  url && publishableKey
    ? createClient<Database>(url, publishableKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
      })
    : null;
