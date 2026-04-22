import Dexie from "dexie";
import { DB_NAME, DB_VERSION, SCHEMA } from "./schema";

export const db = new Dexie(DB_NAME);

db.version(DB_VERSION).stores(SCHEMA);

// 디버깅용 - window.__db 로 접근 가능
if (typeof window !== "undefined") {
  window.__db = db;
}
