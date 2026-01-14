import { useMemo } from "react";
import { getKeyForChar } from "@/app/lib/hangul";

/**
 * Hook to determine the next key that should be pressed
 * based on the current text and user input
 *
 * @param currentText - The text to type
 * @param userInput - The text typed so far
 * @returns The keyboard key identifier for the next character, or null if complete
 *
 * @example
 * const nextKey = useNextKey("안녕하세요", "안녕");
 * // Returns the key for '하' (e.g., 'g' for ㅎ)
 */
export function useNextKey(
  currentText: string,
  userInput: string
): string | null {
  return useMemo(() => {
    if (userInput.length >= currentText.length) {
      return null; // Test complete
    }

    const nextChar = currentText[userInput.length];

    // Handle space
    if (nextChar === " ") {
      return "Space";
    }

    // Handle English characters and numbers
    if (/[a-zA-Z0-9]/.test(nextChar)) {
      return nextChar.toLowerCase();
    }

    // Handle punctuation that appears directly on keys
    const punctuationMap: Record<string, string> = {
      ".": ".",
      ",": ",",
      "!": "!",
      "?": "?",
      ";": ";",
      ":": ":",
      "'": "'",
      '"': '"',
      "-": "-",
      _: "_",
      "(": "(",
      ")": ")",
      "[": "[",
      "]": "]",
      "{": "{",
      "}": "}",
      "/": "/",
      "\\": "\\",
      "`": "`",
      "~": "~",
      "@": "@",
      "#": "#",
      $: "$",
      "%": "%",
      "^": "^",
      "&": "&",
      "*": "*",
      "+": "+",
      "=": "=",
      "<": "<",
      ">": ">",
      "|": "|",
    };

    if (punctuationMap[nextChar]) {
      return punctuationMap[nextChar];
    }

    // Handle Korean characters
    const key = getKeyForChar(nextChar);
    if (key) {
      // For complex vowels that return multiple keys (like 'hk' for ㅘ),
      // we take the first key as a simplified approach
      return key.length > 1 ? key[0] : key;
    }

    // If we can't determine the key, return null
    return null;
  }, [currentText, userInput]);
}
