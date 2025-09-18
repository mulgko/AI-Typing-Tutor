"use client";

import * as React from "react";
import { ProgressProps } from "./Progress.type";
import {
  progressVariants,
  progressIndicatorVariants,
} from "./progressVariants";

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => (
    <div ref={ref} className={progressVariants({ className })} {...props}>
      <div
        className={progressIndicatorVariants()}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";
