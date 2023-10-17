import { type ColorScheme, MantineProvider } from "@mantine/core";
import { parseCookies, setCookie } from "nookies";
import React from "react";
import { makeTheme } from "./utils";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeContextProps = {
  theme?: ColorScheme;
  setTheme: (theme: ColorScheme) => void;
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
      path: "/home",
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
