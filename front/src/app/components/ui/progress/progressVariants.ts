import { tv } from "tailwind-variants";

export const progressVariants = tv({
  base: "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
});

export const progressIndicatorVariants = tv({
  base: "h-full w-full flex-1 bg-primary transition-all",
});
