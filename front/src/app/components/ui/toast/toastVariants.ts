import { tv } from "tailwind-variants";

export const toastVariants = tv({
  base: "fixed top-4 right-4 z-50 flex w-full max-w-sm items-center space-x-4 rounded-md border p-4 shadow-lg transition-all duration-150",
  variants: {
    variant: {
      default: "border-gray-200 bg-white text-gray-900",
      destructive: "border-red-200 bg-red-50 text-red-900",
    },
    visible: {
      true: "translate-x-0 opacity-100",
      false: "translate-x-full opacity-0",
    },
  },
  defaultVariants: {
    variant: "default",
    visible: true,
  },
});

export const toasterVariants = tv({
  base: "fixed top-0 right-0 z-50 p-4",
});

export const toastContentVariants = tv({
  base: "flex-1",
});

export const toastTitleVariants = tv({
  base: "text-sm font-semibold",
});

export const toastDescriptionVariants = tv({
  base: "text-sm opacity-90",
});

export const toastCloseButtonVariants = tv({
  base: "text-gray-400 hover:text-gray-600",
});
