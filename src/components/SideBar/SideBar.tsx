import React from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMenuItems, useSideBar } from "./hooks";
import { ThemeToggle } from "../ThemeToggle";
import { MenuItems } from "../MenuItems";
import { ChevronRightIcon, HomeRoundedIcon, LotusIcon } from "../Icons";
import { Avatar, Menu } from "@mantine/core";
import { IconSettings, IconLogout } from "@tabler/icons-react";

const makePrettyPathNames: Record<string, string> = {
  home: "Home",
  account: "Conta",
  companies: "Empresas",
  persons: "Usuários",
};

export const SideBar: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const { open, setOpen } = useSideBar();
  const { signOut } = useClerk();

  const router = useRouter();
  const { route } = router;
  const menuItems = useMenuItems();
  const [primaryPath, secondaryPath] = route
    .split("/")
    .filter((item) => item !== "");

  const handleLogout = () => {
    signOut().catch((err) => console.log(err));
  };

  if (!user) return <></>;
  return (
    <>
      <div className="fixed z-30 flex h-16 w-full items-center justify-center bg-white p-2 px-10 dark:bg-[#0F172A] dark:text-white">
        <div
          className={`logo ${
            open ? "" : "ml-12"
          } flex  h-full flex-none transform items-center justify-center duration-500 ease-in-out dark:text-white`}
        >
          {user.fullName}
        </div>
        <div className="flex h-full grow items-center justify-center"></div>
        <div className="flex h-full flex-none items-center justify-center text-center">
          <div className="flex items-center space-x-3 px-3">
            <div className="flex flex-none justify-center">
              <div className="flex h-8 w-8 "></div>
            </div>
            <Menu width={240} position="bottom-end" shadow="md">
              <Menu.Target>
                <div className="flex flex-none cursor-pointer justify-center">
                  <Avatar
                    className="rounded-full"
                    alt={`${user.fullName ?? "user"}'s profile picture`}
                    src={user.profileImageUrl}
                  />
                </div>
              </Menu.Target>
              <Menu.Dropdown className="bg-slate-100  dark:bg-[#0F172A]">
                <Menu.Label className="text-md  dark:text-slate-300">
                  {user.primaryEmailAddress?.emailAddress}
                </Menu.Label>
                <Menu.Item
                  onClick={() => {
                    router
                      .push({
                        pathname: "/home/account/[userId]",
                        query: { userId: user.id },
                      })
                      .catch((err) => console.error(err));
                  }}
                  className={`bg-slate-100  hover:bg-slate-200  ${
                    route.includes("account")
                      ? "bg-slate-200 dark:bg-gray-800"
                      : "bg-slate-100 dark:bg-[#0F172A]"
                  } dark:text-white dark:hover:bg-[#1E293B]`}
                  icon={<IconSettings className="text-amber-700" size={14} />}
                >
                  Configurações da conta
                </Menu.Item>
                <Menu.Item
                  onClick={handleLogout}
                  className="mt-2  bg-slate-100 hover:bg-slate-200  dark:bg-[#0F172A] dark:text-white dark:hover:bg-gray-800"
                  icon={<IconLogout className="text-white" size={14} />}
                >
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>
      <aside
        className={`fixed z-50 flex h-screen w-60  ${
          open ? "translate-x-none" : "-translate-x-48"
        } transform bg-slate-100 transition duration-1000 ease-in-out dark:bg-gray-800 dark:text-white`}
      >
        <div
          className={`max-toolbar  absolute -right-6 top-2 flex h-12 w-full ${
            open ? "translate-x-0" : "translate-x-24 scale-x-0"
          } transform items-center justify-between rounded-full border-4 border-white transition  duration-300 ease-in dark:border-[#0F172A] dark:bg-slate-800`}
        >
          <div className="flex items-center space-x-2 pl-4 ">
            <ThemeToggle />
          </div>
          <div className="group flex items-center space-x-3 rounded-full bg-gradient-to-r  from-indigo-500 via-purple-500 to-purple-500 py-1  pl-10 pr-2 dark:from-cyan-500 dark:to-blue-500 dark:text-white">
            <div className="mr-12 transform duration-300 ease-in-out">
              HEALTH
            </div>
          </div>
        </div>
        <div
          onClick={() => setOpen(!open)}
          className="absolute -right-6 top-2 flex transform rounded-full border-4 border-white bg-slate-200 p-3 transition duration-500 ease-in-out hover:rotate-45 hover:bg-purple-500 dark:border-[#0F172A] dark:bg-slate-800 dark:text-white dark:hover:bg-blue-500"
        >
          <LotusIcon />
        </div>
        <MenuItems items={menuItems} open={open} />
      </aside>
      <div
        className={`content ${
          open ? "ml-12 md:ml-60" : "ml-12"
        } transform px-2 pb-4 pt-20 duration-500 ease-in-out md:px-5`}
      >
        <nav
          className="flex rounded-lg bg-slate-100 px-5  py-3  dark:bg-gray-800"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href={primaryPath ? `/${primaryPath}` : "/home"}
                className="inline-flex items-center text-sm font-medium   hover:text-purple-500 dark:text-white dark:hover:text-blue-500"
              >
                <HomeRoundedIcon className="mr-2 h-4 w-4" />
                {primaryPath && makePrettyPathNames[primaryPath]}
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                <Link
                  href="/"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white md:ml-2"
                >
                  {secondaryPath && makePrettyPathNames[secondaryPath]}
                </Link>
              </div>
            </li>
          </ol>
        </nav>

        {children}
      </div>
    </>
  );
};
