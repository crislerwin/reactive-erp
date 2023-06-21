import React from "react";
import { ThemeContext } from "@/providers/ThemeProvider";

export const useTheme = () => React.useContext(ThemeContext);
