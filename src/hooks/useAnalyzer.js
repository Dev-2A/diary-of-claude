import { useCallback, useRef, useState } from "react";
import { analyzeAllUnanalyzed, analyzeBatch } from "../services/analyzer";

export function useAnalyzer() {
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(null);

  const runAll = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    abortRef.current = { aborted: false };

    try {
      const res = await analyzeAllUnanalyzed(setProgress, abortRef.current);
      setResult(res);
    } catch (err) {
      setResult({
        total: 0,
        succeeded: 0,
        failed: 1,
        errors: [{ id: null, message: err.message }],
      });
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  }, []);

  const runBatch = useCallback(async (ids) => {
    setIsRunning(true);
    setResult(null);
    abortRef.current = { aborted: false };

    try {
      const res = await analyzeBatch(ids, setProgress, abortRef.current);
      setResult(res);
    } catch (err) {
      setResult({
        total: ids.length,
        succeeded: 0,
        failed: ids.length,
        errors: [{ id: null, message: err.message }],
      });
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current) abortRef.current.aborted = true;
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setProgress(null);
  }, []);

  return { runAll, runBatch, cancel, clear, progress, result, isRunning };
}
