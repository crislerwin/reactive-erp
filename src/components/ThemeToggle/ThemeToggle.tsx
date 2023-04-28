import { MoonIcon, SunIcon } from "../Icons";
import { useTheme } from "./useTheme";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div
        onClick={() => setTheme("dark")}
        className={`moon ${
          theme === "dark" ? "hidden" : ""
        } cursor-pointer hover:text-purple-500 dark:text-white dark:hover:text-[#38BDF8]`}
      >
        <MoonIcon />
      </div>
      <div
        onClick={() => setTheme("light")}
        className={`sun ${
          theme === "light" ? "hidden" : ""
        } cursor-pointer hover:text-blue-500 dark:text-white dark:hover:text-[#38BDF8]`}
      >
        <SunIcon />
      </div>
    </div>
  );
};
