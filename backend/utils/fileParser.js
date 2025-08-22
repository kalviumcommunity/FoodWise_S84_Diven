import { parse } from "csv-parse/sync";

export async function parseCsvOrJson({ fileBuffer, fileOriginalName, inlineData }) {
  if (inlineData) {
    try {
      return JSON.parse(inlineData);
    } catch (e) {
      // ignore and continue
    }
  }
  if (!fileBuffer) return [];

  const isJson = (fileOriginalName || "").toLowerCase().endsWith(".json");
  if (isJson) {
    try {
      return JSON.parse(fileBuffer.toString("utf-8"));
    } catch (e) {
      return [];
    }
  }
  try {
    const records = parse(fileBuffer.toString("utf-8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    return records;
  } catch (e) {
    return [];
  }
}


