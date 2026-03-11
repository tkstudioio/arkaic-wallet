import { isWeb, tva } from "@gluestack-ui/utils/nativewind-utils";

let base = "rounded-arkaic-card p-arkaic-md gap-arkaic-md";
base = isWeb ? base + " flex flex-col relative z-0" : base;

export const cardStyle = tva({
  base: base,
  variants: {
    variant: {
      elevated: "bg-arkaic-fill",
      outline: "border border-arkaic-border",
      ghost: "rounded-none",
      filled: "bg-arkaic-fill",
    },
  },
});
