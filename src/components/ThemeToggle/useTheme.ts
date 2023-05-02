import React from "react";
import { ThemeContext } from "@/Providers/ThemeProvider";

export const useTheme = () => React.useContext(ThemeContext);
