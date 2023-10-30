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
      href: "/",
      selected: pathname === "/",
    },
    {
      icon: <IconBuilding className="h-4 w-4" />,
      label: "Consultorios",
      href: "/offices",
      selected: pathname === "/offices",
    },
    {
      icon: <IconUsersGroup className="h-4 w-4" />,
      label: "Pacientes",
      href: "/patients",
      selected: pathname === "/patients",
    },
  ];
  return menuItems;
};
