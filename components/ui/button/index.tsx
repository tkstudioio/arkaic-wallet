"use client";
import { createButton } from "@gluestack-ui/core/button/creator";
import { PrimitiveIcon, UIIcon } from "@gluestack-ui/core/icon/creator";
import {
  tva,
  useStyleContext,
  withStyleContext,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { VariantProps } from "tailwind-variants";

const SCOPE = "BUTTON";

const Root = withStyleContext(Pressable, SCOPE);

const UIButton = createButton({
  Root: Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: UIIcon,
});

cssInterop(PrimitiveIcon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: "classNameColor",
      stroke: true,
    },
  },
});

const buttonStyle = tva({
  base: "w-full rounded-arkaic-button group/button bg-arkaic-primary rounded-button flex-row items-center justify-center data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 data-[disabled=true]:opacity-40 gap-2",
  variants: {
    action: {
      primary:
        "bg-arkaic-primary data-[hover=true]:bg-arkaic-primary/90 data-[active=true]:bg-arkaic-primary/80 border-arkaic-border data-[focus-visible=true]:web:ring-indicator-info",
      secondary:
        "bg-arkaic-fill border border-arkaic-primary data-[hover=true]:bg-arkaic-fill/90 data-[active=true]:bg-arkaic-fill/80 data-[focus-visible=true]:web:ring-indicator-info",
      positive:
        "bg-arkaic-positive border-arkaic-border data-[hover=true]:bg-arkaic-positive/90 data-[active=true]:bg-arkaic-positive/80 data-[focus-visible=true]:web:ring-indicator-info",
      negative:
        "bg-arkaic-negative border-arkaic-border data-[hover=true]:bg-arkaic-negative/90 data-[active=true]:bg-arkaic-negative/80 data-[focus-visible=true]:web:ring-indicator-info",
      neutral:
        "bg-arkaic-muted border-arkaic-muted data-[hover=true]:bg-arkaic-muted/90 data-[active=true]:bg-arkaic-muted/80 data-[focus-visible=true]:web:ring-indicator-info",
    },
    variant: {
      link: "px-0",
      outline: "border",
      solid: "shadow-arkaic",
    },

    size: {
      sm: "px-4 py-2",
      md: "px-5 py-3",
      lg: "px-6 py-4",
    },
  },
  compoundVariants: [
    {
      action: "primary",
      variant: "link",
      class:
        "px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
    },
    {
      action: "secondary",
      variant: "link",
      class:
        "px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
    },
    {
      action: "positive",
      variant: "link",
      class:
        "px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
    },
    {
      action: "negative",
      variant: "link",
      class:
        "px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
    },
    {
      action: "neutral",
      variant: "link",
      class:
        "px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
    },
    {
      action: "primary",
      variant: "outline",
      class:
        "bg-arkaic-fill border-arkaic-primary data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-arkaic-fill",
    },
    {
      action: "secondary",
      variant: "outline",
      class:
        "bg-arkaic-fill border-arkaic-primary data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-arkaic-fill",
    },
    {
      action: "positive",
      variant: "outline",
      class:
        "bg-arkaic-fill border-arkaic-positive data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-arkaic-fill",
    },
    {
      action: "negative",
      variant: "outline",
      class:
        "bg-arkaic-fill border-arkaic-negative data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-arkaic-fill",
    },
    {
      action: "neutral",
      variant: "outline",
      class:
        "bg-arkaic-fill border-arkaic-muted data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-arkaic-fill",
    },
  ],
});

const buttonTextStyle = tva({
  base: "text-arkaic-primary-foreground font-semibold web:select-none",
  parentVariants: {
    action: {
      primary:
        "text-arkaic-primary data-[hover=true]:text-arkaic-primary data-[active=true]:text-arkaic-primary",
      secondary:
        "text-arkaic-muted data-[hover=true]:text-arkaic-muted data-[active=true]:text-arkaic-muted",
      positive:
        "text-arkaic-positive data-[hover=true]:text-arkaic-positive data-[active=true]:text-arkaic-positive",
      negative:
        "text-arkaic-negative data-[hover=true]:text-arkaic-negative data-[active=true]:text-arkaic-negative",
      neutral:
        "text-arkaic-muted data-[hover=true]:text-arkaic-muted data-[active=true]:text-arkaic-muted",
    },
    variant: {
      link: "data-[hover=true]:underline data-[active=true]:underline",
      outline: "",
      solid:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  parentCompoundVariants: [
    {
      variant: "solid",
      action: "primary",
      class:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    {
      variant: "solid",
      action: "secondary",
      class:
        "text-arkaic-muted data-[hover=true]:text-arkaic-muted data-[active=true]:text-arkaic-muted",
    },
    {
      variant: "solid",
      action: "positive",
      class:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    {
      variant: "solid",
      action: "negative",
      class:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    {
      variant: "solid",
      action: "neutral",
      class:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    {
      variant: "outline",
      action: "primary",
      class:
        "text-arkaic-primary data-[hover=true]:text-arkaic-primary data-[active=true]:text-arkaic-primary",
    },
    {
      variant: "outline",
      action: "secondary",
      class:
        "text-arkaic-muted data-[hover=true]:text-arkaic-primary data-[active=true]:text-arkaic-muted",
    },
    {
      variant: "outline",
      action: "positive",
      class:
        "text-arkaic-positive data-[hover=true]:text-arkaic-positive data-[active=true]:text-arkaic-positive",
    },
    {
      variant: "outline",
      action: "negative",
      class:
        "text-arkaic-negative data-[hover=true]:text-arkaic-negative data-[active=true]:text-arkaic-negative",
    },
    {
      variant: "outline",
      action: "neutral",
      class:
        "text-arkaic-muted data-[hover=true]:text-arkaic-muted data-[active=true]:text-arkaic-muted",
    },
  ],
});

const buttonIconStyle = tva({
  base: "fill-none",
  parentVariants: {
    variant: {
      link: "data-[hover=true]:underline data-[active=true]:underline",
      outline: "",
      solid:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    size: {
      sm: "h-4 w-4",
      md: "h-[18px] w-[18px]",
      lg: "h-[18px] w-[18px]",
    },
    action: {
      primary:
        "text-arkaic-primary data-[hover=true]:text-arkaic-primary data-[active=true]:text-arkaic-primary",
      secondary:
        "text-arkaic-muted data-[hover=true]:text-arkaic-muted data-[active=true]:text-arkaic-muted",
      positive:
        "text-arkaic-positive data-[hover=true]:text-arkaic-positive data-[active=true]:text-arkaic-positive",

      negative:
        "text-arkaic-negative data-[hover=true]:text-arkaic-negative data-[active=true]:text-arkaic-negative",
      neutral:
        "text-arkaic-muted data-[hover=true]:text-arkaic-muted data-[active=true]:text-arkaic-muted",
    },
  },
  parentCompoundVariants: [
    {
      variant: "solid",
      action: "primary",
      class:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    {
      variant: "solid",
      action: "secondary",
      class:
        "text-arkaic-muted data-[hover=true]:text-arkaic-muted data-[active=true]:text-arkaic-muted",
    },
    {
      variant: "solid",
      action: "positive",
      class:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    {
      variant: "solid",
      action: "negative",
      class:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
    {
      variant: "solid",
      action: "neutral",
      class:
        "text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground",
    },
  ],
});

const buttonGroupStyle = tva({
  base: "",
  variants: {
    space: {
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-5",
      "2xl": "gap-6",
      "3xl": "gap-7",
      "4xl": "gap-8",
    },
    isAttached: {
      true: "gap-0",
    },
    flexDirection: {
      row: "flex-row",
      column: "flex-col",
      "row-reverse": "flex-row-reverse",
      "column-reverse": "flex-col-reverse",
    },
  },
});

type IButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIButton>,
  "context"
> &
  VariantProps<typeof buttonStyle> & { className?: string };

const Button = React.forwardRef<
  React.ElementRef<typeof UIButton>,
  IButtonProps
>(
  (
    { className, variant = "solid", size = "md", action = "primary", ...props },
    ref,
  ) => {
    return (
      <UIButton
        ref={ref}
        {...props}
        className={buttonStyle({ variant, size, action, class: className })}
        context={{ variant, size, action }}
      />
    );
  },
);

type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle> & { className?: string };

const ButtonText = React.forwardRef<
  React.ElementRef<typeof UIButton.Text>,
  IButtonTextProps
>(({ className, variant, size, action, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    action: parentAction,
  } = useStyleContext(SCOPE);

  return (
    <UIButton.Text
      ref={ref}
      {...props}
      className={buttonTextStyle({
        parentVariants: {
          variant: parentVariant,
          size: parentSize,
          action: parentAction,
        },
        variant: variant as "link" | "outline" | "solid" | undefined,
        size,
        action: action as
          | "primary"
          | "secondary"
          | "positive"
          | "negative"
          | "neutral"
          | undefined,
        class: className,
      })}
    />
  );
});

const ButtonSpinner = UIButton.Spinner;

type IButtonIcon = React.ComponentPropsWithoutRef<typeof UIButton.Icon> &
  VariantProps<typeof buttonIconStyle> & {
    className?: string | undefined;
    as?: React.ElementType;
    height?: number;
    width?: number;
  };

const ButtonIcon = React.forwardRef<
  React.ElementRef<typeof UIButton.Icon>,
  IButtonIcon
>(({ className, size, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    action: parentAction,
  } = useStyleContext(SCOPE);

  if (typeof size === "number") {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
      />
    );
  }
  return (
    <UIButton.Icon
      {...props}
      className={buttonIconStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
          action: parentAction,
        },
        size,
        class: className,
      })}
      ref={ref}
    />
  );
});

type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof UIButton.Group> &
  VariantProps<typeof buttonGroupStyle>;

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof UIButton.Group>,
  IButtonGroupProps
>(
  (
    {
      className,
      space = "md",
      isAttached = false,
      flexDirection = "column",
      ...props
    },
    ref,
  ) => {
    return (
      <UIButton.Group
        className={buttonGroupStyle({
          class: className,
          space,
          isAttached: isAttached as boolean,
          flexDirection: flexDirection as any,
        })}
        {...props}
        ref={ref}
      />
    );
  },
);

Button.displayName = "Button";
ButtonText.displayName = "ButtonText";
ButtonSpinner.displayName = "ButtonSpinner";
ButtonIcon.displayName = "ButtonIcon";
ButtonGroup.displayName = "ButtonGroup";

export { Button, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText };
