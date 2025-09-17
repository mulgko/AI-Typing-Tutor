"use client";

import * as React from "react";
import { BadgeProps } from "./Badge.type";
import { badgeVariants } from "./badgeVariants";

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}
