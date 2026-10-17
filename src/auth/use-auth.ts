import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  supabase,
  supabaseConfigurationError,
  type AppSupabaseClient,
} from "../data/supabase-client";

type AuthState = {
  client: AppSupabaseClient | null;
  configured: boolean;
  error: string | null;
  loading: boolean;
  session: Session | null;
  user: User | null;
};

export function useAuth(): AuthState {
  const client = supabase;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(client));
  const [error, setError] = useState<string | null>(supabaseConfigurationError);

  useEffect(() => {
    if (!client) return;

    let active = true;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    queueMicrotask(() => {
      void client.auth
        .getSession()
        .then(({ data, error: sessionError }) => {
          if (!active) return;
          if (sessionError) {
            setError(sessionError.message);
          } else {
            setSession(data.session);
          }
          setLoading(false);
        })
        .catch((cause: unknown) => {
          if (!active) return;
          setError(cause instanceof Error ? cause.message : "Could not restore your sign-in.");
          setLoading(false);
        });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  return {
    client,
    configured: Boolean(client) && !supabaseConfigurationError,
    error,
    loading,
    session,
    user: session?.user ?? null,
  };
}
