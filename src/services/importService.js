import { parseClaudeExport } from "./claudeParser";
import { createConversation, findByUuid } from "../db/conversations";

/**
 * 여러 파일을 받아서 파싱 + DB 저장
 * @param {FileList|File[]} files
 * @param {(progress: ImportProgress) => void} onProgress
 * @returns {Promise<ImportResult>}
 */
export async function importFiles(files, onProgress) {
  const fileArr = Array.from(files);
  const result = {
    total: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < fileArr.length; i++) {
    const file = fileArr[i];
    onProgress?.({
      phase: "reading",
      currentFile: file.name,
      fileIndex: i + 1,
      fileTotal: fileArr.length,
    });

    try {
      const content = await file.text();
      const conversations = parseClaudeExport(file.name, content);
      result.total += conversations.length;

      for (const conv of conversations) {
        onProgress?.({
          phase: "importing",
          currentFile: file.name,
          currentTitle: conv.title,
          fileIndex: i + 1,
          fileTotal: fileArr.length,
        });

        // 이미 있는 대화면 skip
        const existing = await findByUuid(conv.uuid);
        if (existing) {
          result.skipped += 1;
          continue;
        }

        await createConversation(conv);
        result.imported += 1;
      }
    } catch (err) {
      result.failed += 1;
      result.errors.push({ file: file.name, message: err.message });
    }
  }

  onProgress?.({ phase: "done" });
  return result;
}
