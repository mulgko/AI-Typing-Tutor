"use client";

import * as React from "react";
import {
  VirtualKeyboardProps,
  VirtualKeyboardRowProps,
  VirtualKeyboardKeyProps,
} from "./VirtualKeyboard.type";
import {
  virtualKeyboardVariants,
  virtualKeyboardRowVariants,
  virtualKeyboardKeyVariants,
  getFingerColorClasses,
} from "./virtualKeyboardVariants";
import { KOREAN_2_BEOLSIK } from "./keyboardLayouts";
import { cn } from "@/app/lib/utils";

/**
 * Individual key component with all visual feedback features
 */
export const VirtualKeyboardKey = React.forwardRef<
  HTMLButtonElement,
  VirtualKeyboardKeyProps
>(
  (
    {
      korean,
      english,
      finger,
      isNextKey = false,
      isPressed = false,
      isError = false,
      showFingerGuide = false,
      isSpecial = false,
      keyWidth = "normal",
      className,
      ...props
    },
    ref
  ) => {
    const fingerColorClasses = getFingerColorClasses(finger, showFingerGuide);

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          virtualKeyboardKeyVariants({
            keyWidth,
            isSpecial,
            isNextKey,
            isPressed,
            isError,
          }),
          fingerColorClasses,
          className
        )}
        aria-label={`Key: ${korean} (${english})`}
        disabled
        {...props}
      >
        {/* Korean character (top) */}
        <span className="text-sm font-semibold">{korean}</span>
        {/* English character (bottom) - only show if different */}
        {korean !== english && !isSpecial && (
          <span className="text-xs opacity-60 mt-0.5">{english}</span>
        )}
      </button>
    );
  }
);

VirtualKeyboardKey.displayName = "VirtualKeyboardKey";

/**
 * Row of keys component
 */
export const VirtualKeyboardRow = React.forwardRef<
  HTMLDivElement,
  VirtualKeyboardRowProps
>(({ rowIndex, className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(virtualKeyboardRowVariants(), className)}
      role="row"
      {...props}
    >
      {children}
    </div>
  );
});

VirtualKeyboardRow.displayName = "VirtualKeyboardRow";

/**
 * Virtual keyboard component with Korean 2-beolsik layout
 * and visual feedback features
 */
export const VirtualKeyboard = React.forwardRef<
  HTMLDivElement,
  VirtualKeyboardProps
>(
  (
    {
      nextChar = null,
      pressedKey = null,
      errorKey = null,
      showNextKeyHighlight = true,
      showFingerGuide = true,
      showKeyPressAnimation = true,
      showErrorVisualization = true,
      variant = "default",
      className,
      onKeyVisualized,
      ...props
    },
    ref
  ) => {
    // Normalize keys for comparison
    const normalizedNextChar = nextChar?.toLowerCase() || null;
    const normalizedPressedKey = pressedKey?.toLowerCase() || null;
    const normalizedErrorKey = errorKey?.toLowerCase() || null;

    return (
      <div
        ref={ref}
        className={cn(virtualKeyboardVariants({ variant }), className)}
        role="presentation"
        aria-label="Virtual keyboard for typing guidance"
        {...props}
      >
        {KOREAN_2_BEOLSIK.rows.map((row, rowIndex) => (
          <VirtualKeyboardRow key={rowIndex} rowIndex={rowIndex}>
            {row.keys.map((key, keyIndex) => {
              const keyIdentifier = key.english.toLowerCase();

              // Determine key states
              const isNextKey =
                showNextKeyHighlight &&
                normalizedNextChar !== null &&
                (keyIdentifier === normalizedNextChar ||
                  // Handle special keys
                  (normalizedNextChar === "space" && key.korean === "Space") ||
                  (normalizedNextChar === "backspace" &&
                    key.korean === "←") ||
                  (normalizedNextChar === "enter" && key.korean === "Enter") ||
                  (normalizedNextChar === "tab" && key.korean === "Tab") ||
                  (normalizedNextChar === "shift" && key.korean === "Shift"));

              const isPressed =
                showKeyPressAnimation &&
                normalizedPressedKey !== null &&
                (keyIdentifier === normalizedPressedKey ||
                  // Handle special keys
                  (normalizedPressedKey === " " && key.korean === "Space") ||
                  (normalizedPressedKey === "backspace" &&
                    key.korean === "←") ||
                  (normalizedPressedKey === "enter" && key.korean === "Enter") ||
                  (normalizedPressedKey === "tab" && key.korean === "Tab") ||
                  (normalizedPressedKey === "shift" && key.korean === "Shift"));

              const isError =
                showErrorVisualization &&
                normalizedErrorKey !== null &&
                (keyIdentifier === normalizedErrorKey ||
                  // Handle special keys
                  (normalizedErrorKey === "space" && key.korean === "Space") ||
                  (normalizedErrorKey === "backspace" && key.korean === "←") ||
                  (normalizedErrorKey === "enter" && key.korean === "Enter") ||
                  (normalizedErrorKey === "tab" && key.korean === "Tab") ||
                  (normalizedErrorKey === "shift" && key.korean === "Shift"));

              // Trigger callback when key state changes
              React.useEffect(() => {
                if ((isNextKey || isPressed || isError) && onKeyVisualized) {
                  onKeyVisualized(key.english);
                }
              }, [isNextKey, isPressed, isError]);

              return (
                <VirtualKeyboardKey
                  key={`${rowIndex}-${keyIndex}`}
                  korean={key.korean}
                  english={key.english}
                  finger={key.finger}
                  isSpecial={key.isSpecial}
                  keyWidth={key.keyWidth}
                  isNextKey={isNextKey}
                  isPressed={isPressed}
                  isError={isError}
                  showFingerGuide={showFingerGuide}
                />
              );
            })}
          </VirtualKeyboardRow>
        ))}
      </div>
    );
  }
);

VirtualKeyboard.displayName = "VirtualKeyboard";
