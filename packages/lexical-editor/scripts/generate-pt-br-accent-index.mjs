import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, "..");
const dictionaryPath = path.resolve(
  packageDir,
  "../../node_modules/.pnpm/dictionary-pt@4.0.0/node_modules/dictionary-pt/index.dic",
);
const outputPath = path.resolve(
  packageDir,
  "./src/plugins/autocorrect/generated/pt-br-accent-index.json",
);
const ONLY_LETTERS_PATTERN = /^\p{L}+$/u;

function stripDiacritics(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ç/gu, "c")
    .replace(/Ç/gu, "C")
    .toLocaleLowerCase("pt-BR");
}

const rawDictionary = await fs.readFile(dictionaryPath, "utf8");
const lines = rawDictionary.split(/\r?\n/u).slice(1);
const index = {};

for (const line of lines) {
  const word = line.split("/")[0]?.trim();
  if (!word || !ONLY_LETTERS_PATTERN.test(word)) {
    continue;
  }

  const lowerWord = word.toLocaleLowerCase("pt-BR");
  const normalizedWord = stripDiacritics(lowerWord);
  if (normalizedWord === lowerWord) {
    continue;
  }

  const existing = index[normalizedWord] ?? [];
  if (!existing.includes(lowerWord)) {
    existing.push(lowerWord);
    existing.sort();
    index[normalizedWord] = existing;
  }
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(index)}\n`, "utf8");
