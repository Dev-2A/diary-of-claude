import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeAllSimilarities,
  buildGraphData,
} from "../services/similarityEngine";

export function useSimilarityEngine() {
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(null);

  const run = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    abortRef.current = { aborted: false };

    try {
      const res = await computeAllSimilarities(setProgress, abortRef.current);
      setResult(res);
    } catch (err) {
      setResult({
        total: 0,
        pairs: 0,
        saved: 0,
        skipped: 0,
        error: err.message,
      });
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current) abortRef.current.aborted = true;
  }, []);

  return { run, cancel, progress, result, isRunning };
}

/**
 * 그래프 데이터 로드 훅
 */
export function useGraphData(threshold, refreshKey) {
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    buildGraphData(threshold).then((data) => {
      if (!mounted) return;
      setGraph(data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [threshold, refreshKey]);

  return { graph, loading };
}
