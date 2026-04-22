import { useEffect, useState } from "react";
import { getDatabaseStats } from "../db";
import { db } from "../db/database";

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

export function useAnalyzedCount(version = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    db.conversations
      .filter((c) => c.is_analyzed)
      .count()
      .then((n) => {
        if (mounted) setCount(n);
      });
    return () => {
      mounted = false;
    };
  }, [version]);

  return count;
}
