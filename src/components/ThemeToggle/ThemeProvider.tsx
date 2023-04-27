import { parseCookies, setCookie } from "nookies";
import React from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeContextProps = {
  theme?: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
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
  const [theme, setUserTheme] = React.useState<"light" | "dark">("light");
  React.useEffect(() => {
    const { themePrefs } = parseCookies();
    if (themePrefs) {
      document.documentElement.classList.add(themePrefs);
      setUserTheme(themePrefs as "light" | "dark");
    }
  }, []);

  const setTheme = (theme: "light" | "dark") => {
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
      {children}
    </ThemeContext.Provider>
  );
};
