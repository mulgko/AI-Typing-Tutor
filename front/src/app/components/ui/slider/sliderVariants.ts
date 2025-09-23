import { cva } from "class-variance-authority";

export const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center"
);

export const sliderTrackVariants = cva(
  "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
);

export const sliderRangeVariants = cva("absolute h-full bg-primary");

export const sliderThumbVariants = cva(
  "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
);
