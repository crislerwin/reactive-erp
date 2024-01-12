import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "./useTheme";
import { ThemeKind } from "./utils";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div
        onClick={() => setTheme(ThemeKind.dark)}
        className={`moon ${
          theme === "dark" ? "hidden" : ""
        } cursor-pointer text-slate-700 hover:text-purple-500 dark:text-white dark:hover:text-[#38BDF8]`}
      >
        <IconMoon className="h-4 w-4" />
      </div>
      <div
        onClick={() => setTheme(ThemeKind.dark)}
        className={`sun ${
          theme === "light" ? "hidden" : ""
        } cursor-pointer hover:text-blue-500 dark:text-white dark:hover:text-[#38BDF8]`}
      >
        <IconSun className="h-4 w-4" />
      </div>
    </div>
  );
};
