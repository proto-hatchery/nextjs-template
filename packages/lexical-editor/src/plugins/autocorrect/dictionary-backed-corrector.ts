import type { AutoCorrectOverrideStore } from "./override-store";

const MIN_TOKEN_LENGTH = 3;
const MAX_TOKEN_LENGTH = 18;
const ONLY_LETTERS_PATTERN = /^\p{L}+$/u;

export type AccentCandidateIndex = Record<string, string[]>;
export type AutoCorrectPositionContext = "paragraph-start" | "sentence-start" | "mid-sentence";

const SUFFIX_TRANSFORMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/coes$/u, "ções"],
  [/cao$/u, "ção"],
  [/aes$/u, "ães"],
  [/oes$/u, "ões"],
  [/ao$/u, "ão"],
  [/em$/u, "ém"],
  [/ancia$/u, "ância"],
  [/encia$/u, "ência"],
  [/ncia$/u, "ência"],
];

let accentCandidateIndexPromise: Promise<AccentCandidateIndex> | null = null;

function stripDiacritics(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ç/gu, "c")
    .replace(/Ç/gu, "C");
}

function normalizeToken(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function isTitleCaseToken(rawToken: string): boolean {
  if (rawToken.length === 0) {
    return false;
  }

  return (
    rawToken[0] === rawToken[0]?.toLocaleUpperCase("pt-BR") &&
    rawToken.slice(1) === rawToken.slice(1).toLocaleLowerCase("pt-BR")
  );
}

function applySentenceCase(candidate: string): string {
  if (candidate.length === 0) {
    return candidate;
  }

  return `${candidate[0]?.toLocaleUpperCase("pt-BR")}${candidate.slice(1)}`;
}

function isUnsafeTokenShape(
  rawToken: string,
  positionContext: AutoCorrectPositionContext,
): boolean {
  if (rawToken.length < MIN_TOKEN_LENGTH || rawToken.length > MAX_TOKEN_LENGTH) {
    return true;
  }

  if (/\d/u.test(rawToken)) {
    return true;
  }

  if (!ONLY_LETTERS_PATTERN.test(rawToken)) {
    return true;
  }

  if (rawToken === rawToken.toLocaleUpperCase("pt-BR")) {
    return true;
  }

  const isLowerCase = rawToken === rawToken.toLocaleLowerCase("pt-BR");
  const isTitleCase = isTitleCaseToken(rawToken);
  const allowTitleCase =
    positionContext === "paragraph-start" || positionContext === "sentence-start";

  if (isLowerCase) {
    return false;
  }

  if (allowTitleCase && isTitleCase) {
    return false;
  }

  if (isTitleCase) {
    return true;
  }

  return true;
}

function isSubtleOrthographicVariant(rawToken: string, candidate: string): boolean {
  if (!candidate || candidate === rawToken) {
    return false;
  }

  if (candidate !== candidate.toLocaleLowerCase("pt-BR")) {
    return false;
  }

  return stripDiacritics(candidate) === stripDiacritics(rawToken);
}

function buildGeneratedCandidates(rawToken: string): string[] {
  const lowerToken = normalizeToken(rawToken);
  const generated = new Set<string>();

  for (const [pattern, replacement] of SUFFIX_TRANSFORMS) {
    if (!pattern.test(lowerToken)) {
      continue;
    }

    generated.add(lowerToken.replace(pattern, replacement));
  }

  return Array.from(generated);
}

export function loadPtBrAccentCandidateIndex(): Promise<AccentCandidateIndex> {
  if (accentCandidateIndexPromise === null) {
    accentCandidateIndexPromise = import("./generated/pt-br-accent-index.json").then(
      (module) => module.default as AccentCandidateIndex,
    );
  }

  return accentCandidateIndexPromise;
}

function buildValidatedCandidates(
  rawToken: string,
  accentCandidateIndex: AccentCandidateIndex,
): { generatedCandidates: string[]; indexedCandidates: string[] } {
  const normalizedToken = normalizeToken(rawToken);
  const generatedCandidates = new Set<string>();
  const indexedCandidates = new Set<string>();

  for (const candidate of buildGeneratedCandidates(normalizedToken)) {
    if (!isSubtleOrthographicVariant(normalizedToken, candidate)) {
      continue;
    }

    generatedCandidates.add(candidate);
  }

  for (const candidate of accentCandidateIndex[stripDiacritics(normalizedToken)] ?? []) {
    const normalizedCandidate = normalizeToken(candidate);
    if (!isSubtleOrthographicVariant(normalizedToken, normalizedCandidate)) {
      continue;
    }

    indexedCandidates.add(normalizedCandidate);
  }

  return {
    generatedCandidates: Array.from(generatedCandidates),
    indexedCandidates: Array.from(indexedCandidates),
  };
}

export interface AutoCorrectMatch {
  correctedToken: string;
  rawToken: string;
}

export interface DictionaryBackedCorrector {
  findCorrection(input: {
    positionContext: AutoCorrectPositionContext;
    rawToken: string;
  }): AutoCorrectMatch | null;
  ignoreToken(rawToken: string): void;
}

const TRANSFORM_PRIORITY_PATTERNS: ReadonlyArray<readonly [RegExp, number]> = [
  [/ções$/u, 6],
  [/ção$/u, 5],
  [/ães$/u, 4],
  [/ões$/u, 4],
  [/ão$/u, 4],
  [/ém$/u, 3],
  [/ância$/u, 2],
  [/ência$/u, 2],
];

function getTransformPriority(rawToken: string, candidate: string): number {
  const normalizedToken = normalizeToken(rawToken);
  const normalizedCandidate = normalizeToken(candidate);

  for (const [pattern, score] of TRANSFORM_PRIORITY_PATTERNS) {
    if (!pattern.test(normalizedCandidate)) {
      continue;
    }

    const candidateBase = stripDiacritics(normalizedCandidate);
    if (candidateBase !== normalizedToken) {
      continue;
    }

    return score;
  }

  return 0;
}

function selectRankedCandidate(rawToken: string, candidates: string[]): string | null {
  if (candidates.length === 0) {
    return null;
  }

  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: getTransformPriority(rawToken, candidate),
    }))
    .toSorted(
      (left, right) => right.score - left.score || left.candidate.localeCompare(right.candidate),
    );

  const best = ranked[0];
  if (!best) {
    return null;
  }

  const tiedBest = ranked.filter((entry) => entry.score === best.score);
  if (tiedBest.length !== 1) {
    return null;
  }

  return best.score > 0 ? best.candidate : null;
}

export function createDictionaryBackedCorrector(
  overrides: AutoCorrectOverrideStore,
  accentCandidateIndex: AccentCandidateIndex,
): DictionaryBackedCorrector {
  return {
    findCorrection(input) {
      const rawToken = input.rawToken;
      const normalizedToken = normalizeToken(rawToken);

      if (
        !normalizedToken ||
        isUnsafeTokenShape(rawToken, input.positionContext) ||
        overrides.has(normalizedToken)
      ) {
        return null;
      }

      const { generatedCandidates, indexedCandidates } = buildValidatedCandidates(
        normalizedToken,
        accentCandidateIndex,
      );

      let correctedToken: string | null;
      if (indexedCandidates.length > 0) {
        correctedToken = selectRankedCandidate(normalizedToken, indexedCandidates);
      } else if (generatedCandidates.length > 0) {
        correctedToken = selectRankedCandidate(normalizedToken, generatedCandidates);
      } else {
        correctedToken = null;
      }

      if (!correctedToken || correctedToken === normalizedToken) {
        return null;
      }

      return {
        correctedToken:
          (input.positionContext === "paragraph-start" ||
            input.positionContext === "sentence-start") &&
          isTitleCaseToken(rawToken)
            ? applySentenceCase(correctedToken)
            : correctedToken,
        rawToken: normalizedToken,
      };
    },
    ignoreToken(rawToken: string) {
      overrides.add(rawToken);
    },
  };
}
