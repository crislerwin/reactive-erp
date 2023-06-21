import type { ColorScheme, MantineThemeOverride } from "@mantine/core";

export const makeTheme: Record<ColorScheme, MantineThemeOverride> = {
  light: {
    colorScheme: "light",
    components: {
      Tooltip: {
        classNames: {
          tooltip: "text-gray-100 bg-gray-800",
        },
      },
      Select: {
        classNames: {
          input: "text-gray-800 bg-slate-200",
          select: "text-gray-800",
          dropdown: "text-gray-800 bg-slate-200",
          item: "hover:bg-gray-100",
        },
      },
      TextInput: {
        classNames: {
          input: "text-gray-800 bg-slate-200",
        },
      },
    },
    shadows: {
      md: "1px 1px 3px rgba(0, 0, 0, .25)",
      xl: "5px 5px 3px rgba(0, 0, 0, .25)",
    },

    headings: {
      fontFamily: "Roboto, sans-serif",

      sizes: {
        h1: { fontSize: "2rem" },
      },
    },
  },
  dark: {
    colorScheme: "dark",
    components: {
      Tooltip: {
        classNames: {
          tooltip: "text-gray-200 bg-gray-900",
        },
      },
      Select: {
        classNames: {
          input: "text-gray-200 bg-gray-700",
          select: "text-gray-200",
          dropdown: "text-gray-200 bg-gray-700",
          item: "hover:bg-gray-600",
        },
      },

      Menu: {
        classNames: {
          menu: "bg-gray-900",
          item: "hover:bg-gray-600",
        },
      },

      TextInput: {
        classNames: {
          input: "text-gray-200 bg-gray-700",
        },
      },
    },
    shadows: {
      md: "1px 1px 3px rgba(0, 0, 0, .25)",
      xl: "5px 5px 3px rgba(0, 0, 0, .25)",
    },
    headings: {
      fontFamily: "Roboto, sans-serif",
      sizes: {
        h1: { fontSize: "2rem" },
      },
    },
  },
};
