import React from "react";
import { SideBarContext } from "@/Providers/SideBarProvider";

export const useSideBar = () => React.useContext(SideBarContext);
