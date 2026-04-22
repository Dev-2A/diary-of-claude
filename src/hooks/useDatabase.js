import { useEffect, useState } from "react";
import { getDatabaseStats } from "../db";

/**
 * DB 통계를 읽어오는 훅 (첫 마운트 시 1회)
 */
export function useDatabaseStats() {
  const [stats, setStats] = useState({
    conversationCount: 0,
    messageCount: 0,
    tagCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    getDatabaseStats().then((s) => {
      if (mounted) {
        setStats(s);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [version]);

  const refresh = () => setVersion((v) => v + 1);
  return { stats, loading, refresh };
}
