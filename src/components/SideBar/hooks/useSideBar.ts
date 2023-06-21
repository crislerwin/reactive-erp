import React from "react";
import { SideBarContext } from "@/providers/SideBarProvider";

export const useSideBar = () => React.useContext(SideBarContext);
