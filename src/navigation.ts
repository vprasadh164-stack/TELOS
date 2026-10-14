import { useCallback, useEffect, useState } from "react";

export type Navigate = (to: string) => void;

export function useNavigation() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", updatePathname);

    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) return;

    window.history.pushState({}, "", to);
    setPathname(window.location.pathname);
    window.scrollTo(0, 0);
  }, []);

  return { pathname, navigate };
}
