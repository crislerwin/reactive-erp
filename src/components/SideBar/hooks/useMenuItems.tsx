import { AddPeopleIcon, DashBoardIcon, HomeIcon } from "@/components/Icons";
import { type MenuItemType } from "@/components/MenuItems";

export const useMenuItems = () => {
  const menuItems: MenuItemType[] = [
    {
      icon: <HomeIcon />,
      label: "Home",
      path: "/home",
    },
    {
      icon: <DashBoardIcon />,
      label: "Empresas",
      path: "/companies",
    },
    {
      icon: <AddPeopleIcon />,
      label: "Usuários",
      path: "/persons",
    },
  ];
  return menuItems;
};
