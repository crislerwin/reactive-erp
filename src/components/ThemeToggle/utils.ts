import type { ColorScheme, MantineThemeOverride } from "@mantine/core";

export enum ThemeKind {
  light = "light",
  dark = "dark",
}

export const mantineTheme: Record<ColorScheme, MantineThemeOverride> = {
  light: {
    colorScheme: ThemeKind.light,
  },
  dark: {
    colorScheme: ThemeKind.dark,
  },
};
