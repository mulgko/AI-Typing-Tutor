import * as React from "react";
import { VariantProps } from "class-variance-authority";
import { labelVariants } from "./labelVariants";

export interface LabelProps
  extends React.ComponentPropsWithoutRef<"label">,
    VariantProps<typeof labelVariants> {}
