import { useCallback, useEffect, useRef, useState } from "react";
import type { AppSupabaseClient } from "./supabase-client";
import { demoWorkspaceService, type WorkspaceData } from "./workspace-data";
import { loadSupabaseWorkspaceData } from "./supabase-workspace-data";

type RemoteOperation = (client: AppSupabaseClient, workspaceId: string) => Promise<void>;

export function useWorkspaceData(
  enabled = true,
  scope = "local-preview",
  client: AppSupabaseClient | null = null,
  userId = "",
  ownerName = "",
  demoMode = false,
) {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadSequence = useRef(0);

  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    if (!enabled) return;
    try {
      if (demoMode) {
        const demoData = demoWorkspaceService.load(scope);
        if (sequence !== loadSequence.current) return;
        setData(demoData);
        setWorkspaceId(null);
        setError(null);
        return;
      }
      if (!client || !userId) {
        throw new Error("Sign in to a verified business account to load workspace data.");
      }
      const result = await loadSupabaseWorkspaceData(client, userId, ownerName);
      if (sequence !== loadSequence.current) return;
      setData(result.data);
      setWorkspaceId(result.workspaceId);
      setError(null);
    } catch (cause) {
      if (sequence !== loadSequence.current) return;
      setError(cause instanceof Error ? cause.message : "Could not load your workspace.");
    }
  }, [client, demoMode, enabled, ownerName, scope, userId]);

  useEffect(() => {
    queueMicrotask(() => void load());
    return () => {
      loadSequence.current += 1;
    };
  }, [load]);

  const updateData = useCallback(
    (update: (current: WorkspaceData) => WorkspaceData) => {
      if (!demoMode) {
        setError("Local demo updates are disabled for authenticated workspaces.");
        return false;
      }
      if (!data) return false;
      const next = update(data);
      try {
        demoWorkspaceService.save(next, scope);
        setData(next);
        setError(null);
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not save demo data.");
        return false;
      }
    },
    [data, demoMode, scope],
  );

  const runRemote = useCallback(
    async (operation: RemoteOperation) => {
      if (!client || !workspaceId) {
        setError("Your verified workspace is not available. Reload and try again.");
        return;
      }
      try {
        await operation(client, workspaceId);
        await load();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not save your workspace changes.");
      }
    },
    [client, load, workspaceId],
  );

  return { data, error, updateData, runRemote, reload: load };
}
