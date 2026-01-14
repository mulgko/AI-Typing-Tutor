/**
 * Hangul character decomposition and keyboard mapping utilities
 * for Korean typing tutor application
 */

// Unicode ranges for Hangul
const HANGUL_START = 0xac00; // '가'
const HANGUL_END = 0xd7a3; // '힣'

// Hangul jamo components
const CHOSEONG_BASE = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

const JUNGSEONG_BASE = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
];

const JONGSEONG_BASE = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

export interface DecomposedChar {
  choseong: string;
  jungseong: string;
  jongseong: string;
}

/**
 * Decomposes a complete Hangul character into its components
 * @param char - A single Hangul syllable character
 * @returns Decomposed components or null if not a complete Hangul syllable
 *
 * @example
 * decomposeHangul('한') // { choseong: 'ㅎ', jungseong: 'ㅏ', jongseong: 'ㄴ' }
 * decomposeHangul('가') // { choseong: 'ㄱ', jungseong: 'ㅏ', jongseong: '' }
 */
export function decomposeHangul(char: string): DecomposedChar | null {
  const code = char.charCodeAt(0);

  if (code < HANGUL_START || code > HANGUL_END) {
    return null; // Not a complete Hangul syllable
  }

  const offset = code - HANGUL_START;
  const choseongIndex = Math.floor(offset / 588);
  const jungseongIndex = Math.floor((offset % 588) / 28);
  const jongseongIndex = offset % 28;

  return {
    choseong: CHOSEONG_BASE[choseongIndex],
    jungseong: JUNGSEONG_BASE[jungseongIndex],
    jongseong: JONGSEONG_BASE[jongseongIndex],
  };
}

/**
 * Maps Korean characters (jamo or complete syllables) to keyboard keys
 * Based on Korean 2-beolsik keyboard layout
 *
 * @param char - Korean character to map
 * @returns Keyboard key identifier (lowercase English letter) or null
 *
 * @example
 * getKeyForChar('ㄱ') // 'r'
 * getKeyForChar('ㅏ') // 'k'
 * getKeyForChar('한') // 'g' (first component: ㅎ)
 */
export function getKeyForChar(char: string): string | null {
  // Check if it's a complete syllable
  const decomposed = decomposeHangul(char);
  if (decomposed) {
    // Return the key for the first component (choseong)
    // This is simplified - in reality, we'd need more complex logic
    // to track composition state
    return jamoToKey[decomposed.choseong] || null;
  }

  // Check if it's a jamo (ㄱ, ㅏ, etc.) or direct character
  return jamoToKey[char] || null;
}

/**
 * Maps Korean jamo characters to keyboard keys on 2-beolsik layout
 * Keys are lowercase to match KeyboardEvent.key values
 */
const jamoToKey: Record<string, string> = {
  // Consonants (자음)
  ㄱ: "r",
  ㄲ: "R",
  ㄴ: "s",
  ㄷ: "e",
  ㄸ: "E",
  ㄹ: "f",
  ㅁ: "a",
  ㅂ: "q",
  ㅃ: "Q",
  ㅅ: "t",
  ㅆ: "T",
  ㅇ: "d",
  ㅈ: "w",
  ㅉ: "W",
  ㅊ: "c",
  ㅋ: "z",
  ㅌ: "x",
  ㅍ: "v",
  ㅎ: "g",

  // Vowels (모음)
  ㅏ: "k",
  ㅐ: "o",
  ㅑ: "i",
  ㅒ: "O",
  ㅓ: "j",
  ㅔ: "p",
  ㅕ: "u",
  ㅖ: "P",
  ㅗ: "h",
  ㅘ: "hk", // Complex vowel (ㅗ + ㅏ)
  ㅙ: "ho", // Complex vowel (ㅗ + ㅐ)
  ㅚ: "hl", // Complex vowel (ㅗ + ㅣ)
  ㅛ: "y",
  ㅜ: "n",
  ㅝ: "nj", // Complex vowel (ㅜ + ㅓ)
  ㅞ: "np", // Complex vowel (ㅜ + ㅔ)
  ㅟ: "nl", // Complex vowel (ㅜ + ㅣ)
  ㅠ: "b",
  ㅡ: "m",
  ㅢ: "ml", // Complex vowel (ㅡ + ㅣ)
  ㅣ: "l",
};

/**
 * Check if a character is a Hangul jamo (single component)
 * @param char - Character to check
 * @returns True if the character is a single jamo
 */
export function isComposingHangul(char: string): boolean {
  // Single jamo characters (ㄱ-ㅎ for consonants, ㅏ-ㅣ for vowels)
  const jamoPattern = /[ㄱ-ㅎㅏ-ㅣ]/;
  return jamoPattern.test(char);
}

/**
 * Normalize keyboard key for comparison
 * Handles special keys and normalizes case
 *
 * @param key - Key from KeyboardEvent
 * @returns Normalized key identifier
 */
export function normalizeKey(key: string): string {
  // Handle special keys
  if (key === " ") return "Space";
  if (key === "Backspace") return "Backspace";
  if (key === "Enter") return "Enter";
  if (key === "Tab") return "Tab";
  if (key === "Shift") return "Shift";

  // Normalize to lowercase for regular keys
  return key.toLowerCase();
}
