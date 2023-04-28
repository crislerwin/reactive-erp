import { AddPeopleIcon, DashBoardIcon, HomeIcon } from "@/components/Icons";
import { LogoutIcon } from "@/components/Icons/LogoutIcon";
import { type MenuItemType } from "@/components/MenuItems";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/router";

export const useMenuItems = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const handleLogout = () => {
    signOut().catch((err) => console.log(err));
  };

  const handleRedirect = (path: string) => {
    router.push(`/${path}`).catch((err) => console.log(err));
  };

  const menuItems: MenuItemType[] = [
    {
      icon: <HomeIcon />,
      label: "Home",
      onRedirect: () => handleRedirect("home"),
    },
    {
      icon: <DashBoardIcon />,
      label: "Meus Pacientes",
      onRedirect: () => handleRedirect("home"),
    },
    {
      icon: <AddPeopleIcon />,
      label: "Adicionar Pessoas",
      onRedirect: () => handleRedirect("home"),
    },
    {
      icon: <LogoutIcon />,
      label: "Sair",
      onRedirect: handleLogout,
    },
  ];
  return menuItems;
};
