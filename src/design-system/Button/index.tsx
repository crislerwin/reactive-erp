import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps,
} from "@mantine/core";

export const buttonVariant = tv({
  base: "font-medium  active:opacity-80",
  variants: {
    color: {
      primary:
        "text-gray-100 bg-gradient-to-r  from-indigo-500 via-purple-500 to-purple-500 dark:bg-gray-800 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 border border-gray-800 hover:from-indigo-600 hover:via-purple-600 hover:to-purple-600",
      secondary:
        "bg-purple-500 text-white dark:bg-gray-800 dark:text-white border border-gray-800",
      danger:
        "bg-red-500 text-white dark:bg-red-500 border border-red-500 hover:bg-red-600",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "px-4 py-3 text-lg",
    },
  },
  compoundVariants: [
    {
      size: ["sm", "md"],
      class: "px-3 py-1 text-sm",
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

type ButtonProps = VariantProps<typeof buttonVariant> &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  MantineButtonProps;

export const Button = ({ color, size, children, ...rest }: ButtonProps) => {
  return (
    <MantineButton className={buttonVariant({ color, size })} {...rest}>
      {children}
    </MantineButton>
  );
};
