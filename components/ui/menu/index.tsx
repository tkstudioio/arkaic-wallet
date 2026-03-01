'use client';
import React from 'react';
import { createMenu } from '@gluestack-ui/core/menu/creator';
import {
  tva,
  useStyleContext,
  withStyleContext,
} from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import {
  Motion,
  AnimatePresence,
  MotionComponentProps,
} from '@legendapp/motion';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

const SCOPE = 'MENU';

const menuStyle = tva({
  base: 'rounded-md bg-arkaic-fill border border-arkaic-border p-2 shadow-hard-5 gap-1',
});

const menuItemStyle = tva({
  base: 'min-w-[200px] flex-row items-center rounded gap-2 data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 data-[disabled=true]:opacity-40 data-[disabled=true]:web:cursor-not-allowed data-[focus-visible=true]:web:cursor-pointer data-[disabled=true]:data-[focus=true]:bg-transparent',
  variants: {
    action: {
      primary:
        'bg-arkaic-primary data-[hover=true]:bg-arkaic-primary/90 data-[active=true]:bg-arkaic-primary/80 border-arkaic-border',
      secondary:
        'bg-arkaic-fill border-arkaic-border data-[hover=true]:bg-arkaic-fill/90 data-[active=true]:bg-arkaic-fill/80',
      positive:
        'bg-arkaic-positive border-arkaic-border data-[hover=true]:bg-arkaic-positive/90 data-[active=true]:bg-arkaic-positive/80',
      negative:
        'bg-arkaic-negative border-arkaic-border data-[hover=true]:bg-arkaic-negative/90 data-[active=true]:bg-arkaic-negative/80',
      default:
        'bg-transparent data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-transparent',
    },
    variant: {
      link: '',
      outline:
        'bg-transparent border data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-transparent',
      solid: '',
    },
    size: {
      xs: 'px-3.5 py-1.5',
      sm: 'px-4 py-2',
      md: 'px-5 py-3',
      lg: 'px-6 py-4',
    },
  },
  compoundVariants: [
    { action: 'primary', variant: 'link', class: 'bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent' },
    { action: 'secondary', variant: 'link', class: 'bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent' },
    { action: 'positive', variant: 'link', class: 'bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent' },
    { action: 'negative', variant: 'link', class: 'bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent' },
    { action: 'primary', variant: 'outline', class: 'bg-transparent data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-transparent' },
    { action: 'secondary', variant: 'outline', class: 'bg-transparent data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-transparent' },
    { action: 'positive', variant: 'outline', class: 'bg-transparent data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-transparent' },
    { action: 'negative', variant: 'outline', class: 'bg-transparent data-[hover=true]:bg-arkaic-fill/50 data-[active=true]:bg-transparent' },
  ],
});

const menuBackdropStyle = tva({
  base: 'absolute top-0 bottom-0 left-0 right-0 web:cursor-default',
});

const menuSeparatorStyle = tva({
  base: 'bg-arkaic-border h-px w-full',
});

const menuItemLabelStyle = tva({
  base: 'font-semibold web:select-none',
  parentVariants: {
    action: {
      primary:
        'text-arkaic-primary data-[hover=true]:text-arkaic-primary data-[active=true]:text-arkaic-primary',
      secondary:
        'text-arkaic-muted data-[hover=true]:text-arkaic-foreground data-[active=true]:text-arkaic-foreground',
      positive:
        'text-arkaic-positive data-[hover=true]:text-arkaic-positive data-[active=true]:text-arkaic-positive',
      negative:
        'text-arkaic-negative data-[hover=true]:text-arkaic-negative data-[active=true]:text-arkaic-negative',
      default: 'text-arkaic-foreground',
    },
    variant: {
      link: 'data-[hover=true]:underline data-[active=true]:underline',
      outline: '',
      solid:
        'text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  parentCompoundVariants: [
    { variant: 'solid', action: 'primary', class: 'text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground' },
    { variant: 'solid', action: 'secondary', class: 'text-arkaic-foreground data-[hover=true]:text-arkaic-foreground data-[active=true]:text-arkaic-foreground' },
    { variant: 'solid', action: 'positive', class: 'text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground' },
    { variant: 'solid', action: 'negative', class: 'text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground' },
    { variant: 'outline', action: 'primary', class: 'text-arkaic-primary data-[hover=true]:text-arkaic-primary data-[active=true]:text-arkaic-primary' },
    { variant: 'outline', action: 'secondary', class: 'text-arkaic-muted data-[hover=true]:text-arkaic-primary data-[active=true]:text-arkaic-foreground' },
    { variant: 'outline', action: 'positive', class: 'text-arkaic-positive data-[hover=true]:text-arkaic-positive data-[active=true]:text-arkaic-positive' },
    { variant: 'outline', action: 'negative', class: 'text-arkaic-negative data-[hover=true]:text-arkaic-negative data-[active=true]:text-arkaic-negative' },
  ],
});

const menuItemIconStyle = tva({
  base: 'fill-none',
  parentVariants: {
    variant: {
      link: 'data-[hover=true]:underline data-[active=true]:underline',
      outline: '',
      solid:
        'text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground',
    },
    size: {
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-[18px] w-[18px]',
    },
    action: {
      primary:
        'text-arkaic-primary data-[hover=true]:text-arkaic-primary data-[active=true]:text-arkaic-primary',
      secondary:
        'text-arkaic-muted data-[hover=true]:text-arkaic-foreground data-[active=true]:text-arkaic-foreground',
      positive:
        'text-arkaic-positive data-[hover=true]:text-arkaic-positive data-[active=true]:text-arkaic-positive',
      negative:
        'text-arkaic-negative data-[hover=true]:text-arkaic-negative data-[active=true]:text-arkaic-negative',
      default: 'text-arkaic-foreground',
    },
  },
  parentCompoundVariants: [
    { variant: 'solid', action: 'primary', class: 'text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground' },
    { variant: 'solid', action: 'secondary', class: 'text-arkaic-foreground data-[hover=true]:text-arkaic-foreground data-[active=true]:text-arkaic-foreground' },
    { variant: 'solid', action: 'positive', class: 'text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground' },
    { variant: 'solid', action: 'negative', class: 'text-arkaic-primary-foreground data-[hover=true]:text-arkaic-primary-foreground data-[active=true]:text-arkaic-primary-foreground' },
  ],
});

const ItemBase = withStyleContext(Pressable, SCOPE);

type IMenuItemProps = VariantProps<typeof menuItemStyle> & {
  className?: string;
} & React.ComponentPropsWithoutRef<typeof Pressable>;

const Item = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  IMenuItemProps
>(function Item(
  { className, variant = 'solid', size = 'md', action = 'default', ...props },
  ref
) {
  return (
    <ItemBase
      ref={ref}
      {...props}
      className={menuItemStyle({ variant, size, action, class: className })}
      context={{ variant, size, action }}
    />
  );
});

const BackdropPressable = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  React.ComponentPropsWithoutRef<typeof Pressable> &
    VariantProps<typeof menuBackdropStyle>
>(function BackdropPressable({ className, ...props }, ref) {
  return (
    <Pressable
      ref={ref}
      className={menuBackdropStyle({ class: className })}
      {...props}
    />
  );
});

const Separator = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View> &
    VariantProps<typeof menuSeparatorStyle>
>(function Separator({ className, ...props }, ref) {
  return (
    <View
      ref={ref}
      className={menuSeparatorStyle({ class: className })}
      {...props}
    />
  );
});

export const UIMenu = createMenu({
  Root: MotionView,
  Item: Item,
  Label: Text,
  Backdrop: BackdropPressable,
  AnimatePresence: AnimatePresence,
  Separator: Separator,
});

cssInterop(MotionView, { className: 'style' });
cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
});

type IMenuProps = React.ComponentProps<typeof UIMenu> &
  VariantProps<typeof menuStyle> & { className?: string };

type IMenuItemLabelProps = React.ComponentProps<typeof UIMenu.ItemLabel> &
  VariantProps<typeof menuItemLabelStyle> & { className?: string };

type IMenuItemIconProps = React.ComponentPropsWithoutRef<typeof UIIcon> &
  VariantProps<typeof menuItemIconStyle> & {
    className?: string | undefined;
    as?: React.ElementType;
    height?: number;
    width?: number;
  };

const Menu = React.forwardRef<React.ComponentRef<typeof UIMenu>, IMenuProps>(
  function Menu({ className, ...props }, ref) {
    return (
      <UIMenu
        ref={ref}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'timing', duration: 100 }}
        className={menuStyle({ class: className })}
        {...props}
      />
    );
  }
);

const MenuItem = UIMenu.Item;

const MenuItemLabel = React.forwardRef<
  React.ComponentRef<typeof UIMenu.ItemLabel>,
  IMenuItemLabelProps
>(function MenuItemLabel({ className, ...props }, ref) {
  const {
    variant: parentVariant,
    size: parentSize,
    action: parentAction,
  } = useStyleContext(SCOPE);

  return (
    <UIMenu.ItemLabel
      ref={ref}
      className={menuItemLabelStyle({
        parentVariants: {
          variant: parentVariant,
          size: parentSize,
          action: parentAction,
        },
        class: className,
      })}
      {...props}
    />
  );
});

const MenuItemIcon = React.forwardRef<
  React.ElementRef<typeof UIIcon>,
  IMenuItemIconProps
>(({ className, size, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    action: parentAction,
  } = useStyleContext(SCOPE);

  if (typeof size === 'number') {
    return (
      <UIIcon
        ref={ref}
        {...props}
        className={menuItemIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIIcon
        ref={ref}
        {...props}
        className={menuItemIconStyle({ class: className })}
      />
    );
  }
  return (
    <UIIcon
      {...props}
      className={menuItemIconStyle({
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

const MenuSeparator = UIMenu.Separator;

Menu.displayName = 'Menu';
MenuItem.displayName = 'MenuItem';
MenuItemLabel.displayName = 'MenuItemLabel';
MenuItemIcon.displayName = 'MenuItemIcon';
MenuSeparator.displayName = 'MenuSeparator';
export { Menu, MenuItem, MenuItemLabel, MenuItemIcon, MenuSeparator };
