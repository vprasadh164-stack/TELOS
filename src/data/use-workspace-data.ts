import { useCallback, useEffect, useState } from "react";
import { demoWorkspaceService, type WorkspaceData } from "./workspace-data";

export function useWorkspaceData() {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setData(demoWorkspaceService.load());
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not load your workspace.");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const updateData = useCallback(
    (update: (current: WorkspaceData) => WorkspaceData) => {
      if (!data) return false;
      const next = update(data);
      try {
        demoWorkspaceService.save(next);
        setData(next);
        setError(null);
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not save your workspace.");
        return false;
      }
    },
    [data],
  );

  return { data, error, updateData };
}
