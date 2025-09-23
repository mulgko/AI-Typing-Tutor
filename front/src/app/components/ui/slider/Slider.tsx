"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/app/lib/utils";
import { SliderProps } from "./Slider.type";
import {
  sliderVariants,
  sliderTrackVariants,
  sliderRangeVariants,
  sliderThumbVariants,
} from "./sliderVariants";

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(sliderVariants(), className)}
    {...props}
  >
    <SliderPrimitive.Track className={sliderTrackVariants()}>
      <SliderPrimitive.Range className={sliderRangeVariants()} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={sliderThumbVariants()} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;
