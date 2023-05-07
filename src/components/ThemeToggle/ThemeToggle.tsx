import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "./useTheme";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div
        onClick={() => setTheme("dark")}
        className={`moon ${
          theme === "dark" ? "hidden" : ""
        } cursor-pointer text-slate-700 hover:text-purple-500 dark:text-white dark:hover:text-[#38BDF8]`}
      >
        <IconMoon className="h-4 w-4" />
      </div>
      <div
        onClick={() => setTheme("light")}
        className={`sun ${
          theme === "light" ? "hidden" : ""
        } cursor-pointer hover:text-blue-500 dark:text-white dark:hover:text-[#38BDF8]`}
      >
        <IconSun className="h-4 w-4" />
      </div>
    </div>
  );
};
