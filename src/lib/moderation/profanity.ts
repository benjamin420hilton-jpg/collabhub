// Lightweight inline profanity filter for campaign copy.
// Not comprehensive — goal is to block the low-hanging abuse so brands can't
// publish obviously offensive briefs without a human in the loop. Users can
// still report borderline cases via the existing flag flow.

const BLOCKED_TERMS: string[] = [
  // Slurs — strong
  "n1gger", "nigger", "nigga", "ni99er", "fag", "faggot", "f4ggot", "tranny",
  "retard", "retarded", "kike", "spic", "chink", "gook", "wetback", "coon",
  // Sexual / violent content unfit for a B2B brief
  "rape", "molest", "pedo", "pedophile", "child porn", "cp video",
  // Scam / clearly non-campaign content
  "pyramid scheme", "ponzi", "get rich quick", "forex signals",
  "adult content", "onlyfans promo", "escort", "sugar daddy", "sugar baby",
];

const WORD_BOUNDARY_RE = /[\s\W_]+/g;

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[0@]/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(WORD_BOUNDARY_RE, " ");
}

export interface ModerationResult {
  ok: boolean;
  matched?: string;
}

export function checkProfanity(...inputs: string[]): ModerationResult {
  const haystack = ` ${normalize(inputs.join(" "))} `;
  for (const term of BLOCKED_TERMS) {
    const needle = ` ${normalize(term)} `;
    if (haystack.includes(needle)) {
      return { ok: false, matched: term };
    }
  }
  return { ok: true };
}
