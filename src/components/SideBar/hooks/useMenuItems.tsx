import { type MenuItemType } from "@/components/MenuItems";
import { IconBuilding, IconHome, IconUsersGroup } from "@tabler/icons-react";
import { useRouter } from "next/router";

export const useMenuItems = () => {
  const router = useRouter();
  const { pathname } = router;
  const menuItems: MenuItemType[] = [
    {
      icon: <IconHome className="h-4 w-4" />,
      label: "Home",
      href: "/home",
      selected: pathname === "/home",
    },
    {
      icon: <IconBuilding className="h-4 w-4" />,
      label: "Empresas",
      href: "/companies",
      selected: pathname === "/companies",
    },
    {
      icon: <IconUsersGroup className="h-4 w-4" />,
      label: "Equipe",
      href: "/persons",
      selected: pathname === "/persons",
    },
  ];
  return menuItems;
};
