import { useState } from "react";
import { importFiles } from "../services/importService";

export function useFileImport() {
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const run = async (files) => {
    setIsImporting(true);
    setResult(null);
    setProgress({ phase: "reading" });

    try {
      const res = await importFiles(files, setProgress);
      setResult(res);
    } catch (err) {
      setResult({
        total: 0,
        imported: 0,
        skipped: 0,
        failed: 1,
        errors: [{ file: "(전체)", message: err.message }],
      });
    } finally {
      setIsImporting(false);
      setProgress(null);
    }
  };

  const clear = () => {
    setResult(null);
    setProgress(null);
  };

  return { run, clear, progress, result, isImporting };
}
