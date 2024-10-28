import { parseCookies, setCookie } from "nookies";
import React, { type PropsWithChildren, useEffect } from "react";

type SideBarContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};
export const SideBarContext = React.createContext<SideBarContextProps>({
  open: false,
  setOpen(_open: boolean) {
    console.warn(
      "if you see this, likely you forgot to add the SideBarProvider on top of your app"
    );
  },
});

export const SideBarProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = React.useState<boolean>(false);

  useEffect(() => {
    const { sideBarPrefs } = parseCookies();
    if (sideBarPrefs) {
      setOpen(sideBarPrefs === "true");
    }
  }, []);

  const setSideBar = (open: boolean) => {
    setOpen(open);
    setCookie(null, "sideBarPrefs", open.toString(), {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  };

  return (
    <SideBarContext.Provider value={{ open, setOpen: setSideBar }}>
      {children}
    </SideBarContext.Provider>
  );
};
