import {
  type ColorScheme,
  MantineProvider,
  type MantineTheme,
  MantineThemeOverride,
  MantineThemeColors,
} from "@mantine/core";
import { parseCookies, setCookie } from "nookies";
import React from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeContextProps = {
  theme?: ColorScheme;
  setTheme: (theme: ColorScheme) => void;
};

const makeTheme: Record<ColorScheme, MantineThemeOverride> = {
  light: {
    colorScheme: "light",
    colors: {
      gray: ["#f1f5f9"],
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
    primaryColor: "gray",
  },
  dark: {
    components: {
      Select: {
        styles: {
          input: {
            backgroundColor: "#111827",
          },
          dropdown: {
            backgroundColor: "#111827",
          },
        },
      },

      Menu: {
        styles: {
          dropdown: {
            backgroundColor: "#111827",
          },
        },
      },

      TextInput: {
        styles: {
          input: {
            backgroundColor: "#374151",
            borderRadius: 4,
          },
        },
      },
    },
    colorScheme: "dark",
    colors: {
      gray: ["#1f2937"],
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
    primaryColor: "gray",
  },
};

export const ThemeContext = React.createContext<ThemeContextProps>({
  theme: "light",
  setTheme(_theme: "light" | "dark") {
    console.warn(
      "if you see this, likely you forgot to add the ThemeProvider on top of your app"
    );
  },
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setUserTheme] = React.useState<ColorScheme>("light");
  React.useEffect(() => {
    const { themePrefs } = parseCookies();
    if (themePrefs) {
      document.documentElement.classList.add(themePrefs);
      setUserTheme(themePrefs as ColorScheme);
    }
  }, []);

  const setTheme = (theme: ColorScheme) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    setUserTheme(theme);
    setCookie(null, "themePrefs", theme, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={makeTheme[theme]}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
};
