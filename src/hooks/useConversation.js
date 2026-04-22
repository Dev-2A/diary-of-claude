import { useCallback, useEffect, useState } from "react";
import { getConversationWithMessages } from "../db/conversations";

/**
 * 대화 하나를 메시지 포함해서 로드하는 훅
 */
export function useConversation(id) {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (id == null) {
      setConversation(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getConversationWithMessages(id)
      .then((data) => {
        if (!mounted) return;
        setConversation(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "로드 실패");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return { conversation, loading, error, refresh };
}
