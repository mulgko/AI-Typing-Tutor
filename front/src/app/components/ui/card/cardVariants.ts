import { tv } from "tailwind-variants";

export const cardVariants = tv({
  base: "rounded-lg border border-border bg-card text-card-foreground",
});

export const cardHeaderVariants = tv({
  base: "flex flex-col space-y-1.5 p-6",
});

export const cardTitleVariants = tv({
  base: "text-2xl font-semibold leading-none tracking-tight",
});

export const cardDescriptionVariants = tv({
  base: "text-sm text-muted-foreground",
});

export const cardContentVariants = tv({
  base: "p-6",
});

export const cardFooterVariants = tv({
  base: "flex items-center p-6 pt-0",
});
