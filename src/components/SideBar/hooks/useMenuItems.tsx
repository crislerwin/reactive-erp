import { AddPeopleIcon, DashBoardIcon, HomeIcon } from "@/components/Icons";
import { type MenuItemType } from "@/components/MenuItems";
import { useRouter } from "next/router";

export const useMenuItems = () => {
  const router = useRouter();
  const { pathname } = router;
  const menuItems: MenuItemType[] = [
    {
      icon: <HomeIcon />,
      label: "Home",
      path: "/home",
      selected: pathname === "/home",
    },
    {
      icon: <DashBoardIcon />,
      label: "Empresas",
      path: "/companies",
      selected: pathname === "/companies",
    },
    {
      icon: <AddPeopleIcon />,
      label: "Usuários",
      path: "/persons",
      selected: pathname === "/persons",
    },
  ];
  return menuItems;
};
