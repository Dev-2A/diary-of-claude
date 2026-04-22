import { useContext } from "react";
import { ApiKeyContext } from "../contexts/ApiKeyContext";

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) {
    throw new Error("useApiKey는 ApiKeyProvider 내부에서만 사용할 수 있어요.");
  }
  return ctx;
}
