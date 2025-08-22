import fs from "fs";
import path from "path";

// Simple local RAG store using JSONL file with {id, text} objects.
const storePath = path.join(process.cwd(), "backend", "services", "rag_store.jsonl");

function loadStore() {
  try {
    if (!fs.existsSync(storePath)) return [];
    const lines = fs.readFileSync(storePath, "utf-8").split(/\r?\n/).filter(Boolean);
    return lines.map((l) => JSON.parse(l));
  } catch (e) {
    return [];
  }
}

function tokenize(text) {
  return (text || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function score(queryTokens, docTokens) {
  const docSet = new Set(docTokens);
  let s = 0;
  for (const t of queryTokens) {
    if (docSet.has(t)) s += 1;
  }
  return s;
}

export async function getRelevantContext(query, k = 3) {
  const data = loadStore();
  const q = tokenize(query);
  const ranked = data
    .map((d) => ({ id: d.id, text: d.text, score: score(q, tokenize(d.text)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .filter((d) => d.score > 0);
  return ranked;
}


