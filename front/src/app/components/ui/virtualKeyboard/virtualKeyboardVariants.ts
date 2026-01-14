import { tv } from "tailwind-variants";

/**
 * Finger color mapping for visual guidance
 * Each finger (0-9) has light and dark mode colors
 */
export const FINGER_COLORS = {
  0: {
    light: "bg-red-100 border-red-300",
    dark: "dark:bg-red-950/30 dark:border-red-800",
  }, // Left pinky
  1: {
    light: "bg-orange-100 border-orange-300",
    dark: "dark:bg-orange-950/30 dark:border-orange-800",
  }, // Left ring
  2: {
    light: "bg-yellow-100 border-yellow-300",
    dark: "dark:bg-yellow-950/30 dark:border-yellow-800",
  }, // Left middle
  3: {
    light: "bg-green-100 border-green-300",
    dark: "dark:bg-green-950/30 dark:border-green-800",
  }, // Left index
  4: {
    light: "bg-blue-100 border-blue-300",
    dark: "dark:bg-blue-950/30 dark:border-blue-800",
  }, // Left thumb
  5: {
    light: "bg-blue-100 border-blue-300",
    dark: "dark:bg-blue-950/30 dark:border-blue-800",
  }, // Right thumb (same as left)
  6: {
    light: "bg-green-100 border-green-300",
    dark: "dark:bg-green-950/30 dark:border-green-800",
  }, // Right index
  7: {
    light: "bg-yellow-100 border-yellow-300",
    dark: "dark:bg-yellow-950/30 dark:border-yellow-800",
  }, // Right middle
  8: {
    light: "bg-orange-100 border-orange-300",
    dark: "dark:bg-orange-950/30 dark:border-orange-800",
  }, // Right ring
  9: {
    light: "bg-red-100 border-red-300",
    dark: "dark:bg-red-950/30 dark:border-red-800",
  }, // Right pinky
};

/**
 * Get finger color classes for a specific finger
 */
export function getFingerColorClasses(
  finger: number,
  showFingerGuide: boolean
): string {
  if (!showFingerGuide) return "";
  const colors = FINGER_COLORS[finger as keyof typeof FINGER_COLORS];
  if (!colors) return "";
  return `${colors.light} ${colors.dark}`;
}

/**
 * Virtual keyboard container variants
 */
export const virtualKeyboardVariants = tv({
  base: "w-full max-w-5xl mx-auto p-4 bg-card rounded-lg border border-border shadow-sm",
  variants: {
    variant: {
      default: "",
      compact: "p-2 max-w-4xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Keyboard row variants
 */
export const virtualKeyboardRowVariants = tv({
  base: "flex gap-1 mb-1 justify-center",
});

/**
 * Individual key variants with all visual states
 */
export const virtualKeyboardKeyVariants = tv({
  base: [
    "relative flex flex-col items-center justify-center",
    "rounded border-2 border-border",
    "bg-muted/50 hover:bg-muted",
    "transition-all duration-150",
    "select-none cursor-default",
    "font-mono text-sm",
  ],
  variants: {
    keyWidth: {
      normal: "min-w-[3.5rem] h-14",
      wide: "min-w-[5rem] h-14",
      "extra-wide": "min-w-[7rem] h-14",
    },
    isSpecial: {
      true: "text-xs text-muted-foreground",
      false: "",
    },
    isNextKey: {
      true: [
        "ring-4 ring-blue-500 ring-offset-2 ring-offset-background",
        "bg-blue-100 dark:bg-blue-900/30",
        "border-blue-500",
        "shadow-lg shadow-blue-500/50",
        "animate-pulse",
        "z-10",
      ],
      false: "",
    },
    isPressed: {
      true: ["scale-95 bg-primary/20", "shadow-inner", "border-primary"],
      false: "",
    },
    isError: {
      true: [
        "bg-red-100 dark:bg-red-900/30",
        "border-red-500",
        "animate-shake",
      ],
      false: "",
    },
  },
  compoundVariants: [
    {
      isNextKey: true,
      isError: true,
      class:
        "ring-red-500 border-red-500 bg-red-100 dark:bg-red-900/30 shadow-red-500/50",
    },
  ],
  defaultVariants: {
    keyWidth: "normal",
    isSpecial: false,
    isNextKey: false,
    isPressed: false,
    isError: false,
  },
});
