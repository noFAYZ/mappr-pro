// MyButton.tsx
import {extendVariants, Button} from "@heroui/react";

export const MyButton = extendVariants(Button, {
  variants: {
    // <- modify/add variants
    color: {
      olive: "text-[#000] bg-[#84cc16]",
      orange: "bg-[#ff8c00] text-[#fff]",
      violet: "bg-[#8b5cf6] text-[#fff]",
    },
    isDisabled: {
      true: "bg-[#eaeaea] text-[#000] opacity-50 cursor-not-allowed",
    },
    size: {
      xs: "px-1  h-4 text-tiny gap-1 rounded-small",
      sm: "px-1  h-5 text-small gap-1 rounded-small",
      md: "px-2  h-6 text-small gap-2 rounded-small",
      lg: "px-2 h-8 text-sm gap-3 rounded-medium",
      xl: "px-3  h-10 text-md gap-4 rounded-medium",
    },
  },
  defaultVariants: { // <- modify/add default variants
    color: "olive",
    size: "xl",
  },
  compoundVariants: [ // <- modify/add compound variants
    {
      isDisabled: true,
      color: "olive",
      class: "bg-[#84cc16]/80 opacity-100",
    },
  ],
});