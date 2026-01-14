import * as React from "react";

export interface VirtualKeyboardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Next key highlight feature
  nextChar?: string | null;

  // Key press tracking for animations
  pressedKey?: string | null;

  // Error visualization
  errorKey?: string | null;

  // Feature toggles
  showNextKeyHighlight?: boolean;
  showFingerGuide?: boolean;
  showKeyPressAnimation?: boolean;
  showErrorVisualization?: boolean;

  // Styling
  variant?: "default" | "compact";

  // Callbacks (optional for sound effects, haptic feedback, etc.)
  onKeyVisualized?: (key: string) => void;
}

export interface VirtualKeyboardRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  rowIndex: number;
}

export interface VirtualKeyboardKeyProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Key data
  korean: string;
  english: string;
  finger: number; // 0-9 for finger position

  // State
  isNextKey?: boolean;
  isPressed?: boolean;
  isError?: boolean;

  // Feature flags
  showFingerGuide?: boolean;

  // Special keys
  isSpecial?: boolean; // Shift, Space, Backspace, Enter
  keyWidth?: "normal" | "wide" | "extra-wide"; // For special keys
}

export interface KeyData {
  korean: string;
  english: string;
  finger: number; // 0-9 (left pinky to right pinky)
  isSpecial?: boolean;
  keyWidth?: "normal" | "wide" | "extra-wide";
}

export interface KeyboardRow {
  keys: KeyData[];
}

export interface KeyboardLayout {
  name: string;
  rows: KeyboardRow[];
}
