"use client";

import * as React from "react";
import {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from "./Card.type";
import {
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardContentVariants,
  cardFooterVariants,
} from "./cardVariants";

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cardVariants({ className })} {...props} />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cardHeaderVariants({ className })} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cardTitleVariants({ className })} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cardDescriptionVariants({ className })} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cardContentVariants({ className })} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cardFooterVariants({ className })} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
