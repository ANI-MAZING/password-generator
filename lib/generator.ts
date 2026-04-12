export type Mode = "random" | "pronounceable" | "passphrase"; // 3 modes random, pronouncable, passphrase

export interface RandomOptions {   //Password options for Random
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  mustContain: boolean;
}

export interface PassphraseOptions {  // Password options to passphrase
  wordCount: number;
}

export type PasswordOptions =   //passing options to modes
  | ({ mode: "random" } & RandomOptions)
  | ({ mode: "pronounceable" } & Pick<RandomOptions, "length">)   // only pick length from random options
  | ({ mode: "passphrase" } & PassphraseOptions);

export type StrengthLevel = "weak" | "fair" | "strong" | "very strong";  //password strength level

export interface StrengthResult {
  level: StrengthLevel;
  score: 1 | 2 | 3 | 4;
  entropy: number;
}

const CHARSET = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  upperFull: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijkmnpqrstuvwxyz",
  lowerFull: "abcdefghijklmnopqrstuvwxyz",
  nums: "23456789",
  numsFull: "0123456789",
  symbols: "!@#$%^&*-+=?",
} as const;  //library of characters

//for pronouncable to make sense to words
const VOWELS = "aeiou";
const CONSONANTS = "bcdfghjklmnprstv";


//for passphrase to generate crypto keys
const WORDLIST = [
  "apple","brave","cedar","delta","eagle","frost","globe","haven","ivory","jazzy",
  "karma","lemon","maple","noble","ocean","piano","quest","ridge","solar","tiger",
  "ultra","vivid","waltz","xenon","yacht","zebra","amber","blaze","coral","dunes",
  "ember","flint","grail","hyper","inlet","jumbo","kiwi","lunar","magic","nexus",
  "orbit","prism","quirk","rebel","swift","tidal","umbra","vapor","woven","yield",
  "azure","birch","crisp","disco","equip","fjord","glyph","husky","irony","joust",
  "knack","light","marsh","ninja","onyx","plume","quota","raven","savor","trove",
];

function secureRandom(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function pickFrom(str: string): string {
  return str[secureRandom(str.length)];
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildPool(opts: RandomOptions): string {
  const { uppercase, lowercase, numbers, symbols, excludeSimilar } = opts;
  let pool = "";
  if (uppercase) pool += excludeSimilar ? CHARSET.upper : CHARSET.upperFull;
  if (lowercase) pool += excludeSimilar ? CHARSET.lower : CHARSET.lowerFull;
  if (numbers) pool += excludeSimilar ? CHARSET.nums : CHARSET.numsFull;
  if (symbols) pool += CHARSET.symbols;
  return pool || CHARSET.lowerFull;
}

export function generateRandom(opts: RandomOptions): string {
  const { length, uppercase, lowercase, numbers, symbols, excludeSimilar, mustContain } = opts;
  const pool = buildPool(opts);

  if (mustContain) {
    const categories: string[] = [];
    if (uppercase) categories.push(excludeSimilar ? CHARSET.upper : CHARSET.upperFull);
    if (lowercase) categories.push(excludeSimilar ? CHARSET.lower : CHARSET.lowerFull);
    if (numbers) categories.push(excludeSimilar ? CHARSET.nums : CHARSET.numsFull);
    if (symbols) categories.push(CHARSET.symbols);

    const guaranteed = categories.map((c) => pickFrom(c));
    const remaining = Array.from({ length: Math.max(0, length - guaranteed.length) }, () =>
      pickFrom(pool)
    );
    return fisherYatesShuffle([...guaranteed, ...remaining]).join("");
  }

  return Array.from({ length }, () => pickFrom(pool)).join("");
}

export function generatePronounceable(length: number): string {
  let result = "";
  let isVowel = secureRandom(2) === 0;
  for (let i = 0; i < length; i++) {
    result += isVowel ? pickFrom(VOWELS) : pickFrom(CONSONANTS);
    isVowel = !isVowel;
  }
  return result;
}

export function generatePassphrase(wordCount: number): string {
  const separators = ["-", "_", ".", "+"];
  const sep = separators[secureRandom(separators.length)];
  const words = Array.from({ length: wordCount }, () => WORDLIST[secureRandom(WORDLIST.length)]);
  const capitalIdx = secureRandom(wordCount);
  words[capitalIdx] = words[capitalIdx].charAt(0).toUpperCase() + words[capitalIdx].slice(1);
  const num = secureRandom(90) + 10;
  return words.join(sep) + sep + num;
}

export function generatePassword(opts: PasswordOptions): string {
  switch (opts.mode) {
    case "random":
      return generateRandom(opts);
    case "pronounceable":
      return generatePronounceable(opts.length);
    case "passphrase":
      return generatePassphrase(opts.wordCount);
  }
}

export function calcEntropy(password: string): number {
  let pool = 0;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 12;
  return pool > 0 ? Math.log2(pool) * password.length : 0;
}

export function getStrength(password: string): StrengthResult {
  const entropy = calcEntropy(password);
  if (entropy < 40) return { level: "weak", score: 1, entropy };
  if (entropy < 60) return { level: "fair", score: 2, entropy };
  if (entropy < 80) return { level: "strong", score: 3, entropy };
  return { level: "very strong", score: 4, entropy };
}