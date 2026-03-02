import React from "react";
import { Text as RNText } from "react-native";

const createTypographyComponent = (
  defaultClassName: string,
  displayName: string,
) => {
  const Component = React.forwardRef<
    React.ComponentRef<typeof RNText>,
    React.ComponentProps<typeof RNText>
  >(function ({ className, ...props }, ref) {
    return (
      <RNText
        className={`${defaultClassName}${className ? ` ${className}` : ""}`}
        {...props}
        ref={ref}
      />
    );
  });
  Component.displayName = displayName;
  return Component;
};

export const H1 = createTypographyComponent(
  "font-heading text-[48px] font-bold text-arkaic-foreground",
  "H1",
);

export const P = createTypographyComponent(
  "font-body text-base text-arkaic-foreground leading-relaxed",
  "P",
);

export const Large = createTypographyComponent(
  "font-sans-medium text-[20px] text-arkaic-foreground",
  "Large",
);

export const Small = createTypographyComponent(
  "font-sans-light text-sm text-arkaic-foreground",
  "Small",
);

export const Muted = createTypographyComponent(
  "font-sans-light text-sm text-arkaic-muted",
  "Muted",
);
