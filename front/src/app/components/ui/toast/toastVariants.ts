import { tv } from "tailwind-variants";

// 🔧 일단 사용하지 않지만 혹시 모르니 남겨둠
export const toastVariants = tv({
  base: "w-full max-w-sm flex items-center space-x-4 rounded-md border p-4 shadow-lg transition-all duration-300 ease-in-out pointer-events-auto",
  variants: {
    variant: {
      default: "border-border bg-background text-foreground",
      destructive:
        "border-destructive/50 bg-destructive text-destructive-foreground",
    },
    visible: {
      true: "translate-x-0 opacity-100 scale-100",
      false: "translate-x-full opacity-0 scale-95",
    },
  },
  defaultVariants: {
    variant: "default",
    visible: true,
  },
});

export const toasterVariants = tv({
  base: "fixed top-4 right-4 z-[100] pointer-events-none",
});

export const toastContentVariants = tv({
  base: "flex-1 min-w-0",
});

export const toastTitleVariants = tv({
  base: "text-sm font-semibold leading-none tracking-tight",
});

export const toastDescriptionVariants = tv({
  base: "text-sm opacity-90 mt-1 leading-relaxed",
});

export const toastCloseButtonVariants = tv({
  base: "text-muted-foreground hover:text-foreground transition-colors shrink-0 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
});
