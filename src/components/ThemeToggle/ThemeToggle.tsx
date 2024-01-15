import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "./useTheme";
import { ThemeKind } from "./utils";
import { type ColorScheme } from "@mantine/core";

const themeClassMap: Record<ColorScheme, string> = {
  [ThemeKind.light]: "moon cursor-pointer text-slate-700 hover:text-purple-500",
  [ThemeKind.dark]:
    "sun cursor-pointer dark:text-white dark:hover:text-[#38BDF8]",
};
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <button
        onClick={() => {
          if (theme === "dark") {
            setTheme(ThemeKind.light);
            return;
          }
          setTheme(ThemeKind.dark);
        }}
        className={themeClassMap[theme ?? ThemeKind.light]}
      >
        {theme === "light" ? (
          <IconMoon className="h-4 w-4" />
        ) : (
          <IconSun className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};
