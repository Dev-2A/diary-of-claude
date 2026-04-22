import { createContext, useCallback, useEffect, useState } from "react";
import {
  getSetting,
  setSetting,
  deleteSetting,
  SETTING_KEYS,
} from "../db/settings";
import { DEFAULT_MODEL_ID } from "../constants/models";

export const ApiKeyContext = createContext(null);

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKeyState] = useState("");
  const [model, setModelState] = useState(DEFAULT_MODEL_ID);
  const [loading, setLoading] = useState(true);

  // 첫 마운트 시 DB에서 로드
  useEffect(() => {
    let mounted = true;
    Promise.all([
      getSetting(SETTING_KEYS.ANTHROPIC_API_KEY, ""),
      getSetting(SETTING_KEYS.ANTHROPIC_MODEL, DEFAULT_MODEL_ID),
    ]).then(([key, mdl]) => {
      if (!mounted) return;
      setApiKeyState(key || "");
      setModelState(mdl || DEFAULT_MODEL_ID);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const saveApiKey = useCallback(async (newKey) => {
    await setSetting(SETTING_KEYS.ANTHROPIC_API_KEY, newKey);
    setApiKeyState(newKey);
  }, []);

  const saveModel = useCallback(async (newModel) => {
    await setSetting(SETTING_KEYS.ANTHROPIC_MODEL, newModel);
    setModelState(newModel);
  }, []);

  const clearApiKey = useCallback(async () => {
    await deleteSetting(SETTING_KEYS.ANTHROPIC_API_KEY);
    setApiKeyState("");
  }, []);

  const value = {
    apiKey,
    model,
    loading,
    saveApiKey,
    saveModel,
    clearApiKey,
    hasKey: !!apiKey,
  };

  return (
    <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
  );
}
