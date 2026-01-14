import { KeyboardLayout } from "./VirtualKeyboard.type";

/**
 * Korean 2-beolsik (두벌식) keyboard layout
 *
 * Finger mapping (0-9):
 * - Left hand: 0 (pinky), 1 (ring), 2 (middle), 3 (index), 4 (thumb)
 * - Right hand: 5 (thumb), 6 (index), 7 (middle), 8 (ring), 9 (pinky)
 */
export const KOREAN_2_BEOLSIK: KeyboardLayout = {
  name: "Korean 2-beolsik (두벌식)",
  rows: [
    // Number row
    {
      keys: [
        { korean: "`", english: "`", finger: 0 },
        { korean: "1", english: "1", finger: 0 },
        { korean: "2", english: "2", finger: 1 },
        { korean: "3", english: "3", finger: 2 },
        { korean: "4", english: "4", finger: 3 },
        { korean: "5", english: "5", finger: 3 },
        { korean: "6", english: "6", finger: 6 },
        { korean: "7", english: "7", finger: 6 },
        { korean: "8", english: "8", finger: 7 },
        { korean: "9", english: "9", finger: 8 },
        { korean: "0", english: "0", finger: 9 },
        { korean: "-", english: "-", finger: 9 },
        { korean: "=", english: "=", finger: 9 },
        {
          korean: "←",
          english: "Backspace",
          finger: 9,
          isSpecial: true,
          keyWidth: "wide",
        },
      ],
    },
    // Top row (QWERTY)
    {
      keys: [
        {
          korean: "Tab",
          english: "Tab",
          finger: 0,
          isSpecial: true,
          keyWidth: "wide",
        },
        { korean: "ㅂ", english: "q", finger: 0 },
        { korean: "ㅈ", english: "w", finger: 1 },
        { korean: "ㄷ", english: "e", finger: 2 },
        { korean: "ㄱ", english: "r", finger: 3 },
        { korean: "ㅅ", english: "t", finger: 3 },
        { korean: "ㅛ", english: "y", finger: 6 },
        { korean: "ㅕ", english: "u", finger: 6 },
        { korean: "ㅑ", english: "i", finger: 7 },
        { korean: "ㅐ", english: "o", finger: 8 },
        { korean: "ㅔ", english: "p", finger: 9 },
        { korean: "[", english: "[", finger: 9 },
        { korean: "]", english: "]", finger: 9 },
        { korean: "\\", english: "\\", finger: 9 },
      ],
    },
    // Home row (ASDF)
    {
      keys: [
        {
          korean: "Caps",
          english: "Caps",
          finger: 0,
          isSpecial: true,
          keyWidth: "wide",
        },
        { korean: "ㅁ", english: "a", finger: 0 },
        { korean: "ㄴ", english: "s", finger: 1 },
        { korean: "ㅇ", english: "d", finger: 2 },
        { korean: "ㄹ", english: "f", finger: 3 },
        { korean: "ㅎ", english: "g", finger: 3 },
        { korean: "ㅗ", english: "h", finger: 6 },
        { korean: "ㅓ", english: "j", finger: 6 },
        { korean: "ㅏ", english: "k", finger: 7 },
        { korean: "ㅣ", english: "l", finger: 8 },
        { korean: ";", english: ";", finger: 9 },
        { korean: "'", english: "'", finger: 9 },
        {
          korean: "Enter",
          english: "Enter",
          finger: 9,
          isSpecial: true,
          keyWidth: "extra-wide",
        },
      ],
    },
    // Bottom row (ZXCV)
    {
      keys: [
        {
          korean: "Shift",
          english: "Shift",
          finger: 0,
          isSpecial: true,
          keyWidth: "extra-wide",
        },
        { korean: "ㅋ", english: "z", finger: 0 },
        { korean: "ㅌ", english: "x", finger: 1 },
        { korean: "ㅊ", english: "c", finger: 2 },
        { korean: "ㅍ", english: "v", finger: 3 },
        { korean: "ㅠ", english: "b", finger: 3 },
        { korean: "ㅜ", english: "n", finger: 6 },
        { korean: "ㅡ", english: "m", finger: 6 },
        { korean: ",", english: ",", finger: 7 },
        { korean: ".", english: ".", finger: 8 },
        { korean: "/", english: "/", finger: 9 },
        {
          korean: "Shift",
          english: "Shift",
          finger: 9,
          isSpecial: true,
          keyWidth: "extra-wide",
        },
      ],
    },
    // Space row
    {
      keys: [
        {
          korean: "Ctrl",
          english: "Ctrl",
          finger: 0,
          isSpecial: true,
          keyWidth: "normal",
        },
        {
          korean: "Win",
          english: "Win",
          finger: 0,
          isSpecial: true,
          keyWidth: "normal",
        },
        {
          korean: "Alt",
          english: "Alt",
          finger: 4,
          isSpecial: true,
          keyWidth: "normal",
        },
        {
          korean: "Space",
          english: " ",
          finger: 4,
          isSpecial: true,
          keyWidth: "extra-wide",
        },
        {
          korean: "한/영",
          english: "한/영",
          finger: 5,
          isSpecial: true,
          keyWidth: "normal",
        },
        {
          korean: "Alt",
          english: "Alt",
          finger: 9,
          isSpecial: true,
          keyWidth: "normal",
        },
        {
          korean: "Fn",
          english: "Fn",
          finger: 9,
          isSpecial: true,
          keyWidth: "normal",
        },
        {
          korean: "Ctrl",
          english: "Ctrl",
          finger: 9,
          isSpecial: true,
          keyWidth: "normal",
        },
      ],
    },
  ],
};
