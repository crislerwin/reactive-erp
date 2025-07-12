import React, { type PropsWithChildren } from "react";
import { SideMenu } from "../SideMenu";

type LayoutProps = PropsWithChildren & {
  role?: string;
  branch?: string;
};

export function Layout({ children, role, branch }: LayoutProps) {
  return (
    <SideMenu role={role} branch={branch}>
      {children}
    </SideMenu>
  );
}
