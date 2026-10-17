import { useCallback, useEffect, useState } from "react";
import { demoWorkspaceService, type WorkspaceData } from "./workspace-data";

export function useWorkspaceData(enabled = true, scope = "local-preview") {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setData(demoWorkspaceService.load(scope));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not load your workspace.");
      }
    });
    return () => {
      active = false;
    };
  }, [enabled, scope]);

  const updateData = useCallback(
    (update: (current: WorkspaceData) => WorkspaceData) => {
      if (!data) return false;
      const next = update(data);
      try {
        demoWorkspaceService.save(next, scope);
        setData(next);
        setError(null);
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not save your workspace.");
        return false;
      }
    },
    [data, scope],
  );

  return { data, error, updateData };
}
