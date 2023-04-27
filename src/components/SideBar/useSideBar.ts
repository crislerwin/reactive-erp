import React from "react";
import { SideBarContext } from "./SideBarProvider";

export const useSideBar = () => React.useContext(SideBarContext);
