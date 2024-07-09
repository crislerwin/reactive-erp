import React from "react";
import { SideBarContext } from "./SideBarProvider";

export const useSideMenu = () => React.useContext(SideBarContext);
