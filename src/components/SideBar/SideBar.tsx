import React from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSideBar } from "./useSideBar";
import { ThemeToggle } from "../ThemeToggle";
import { type MenuItemType, MenuItems } from "../MenuItems";
import { AddPeopleIcon, DashBoardIcon, HomeIcon, NotifyIcon } from "../Icons";
import { LogoutIcon } from "../Icons/LogoutIcon";

const makePrettyPathNames: Record<string, string> = {
  home: "Home",
  account: "Conta",
};

const useMenuItems = () => {
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
      onClick: () => handleRedirect("home"),
    },
    {
      icon: <DashBoardIcon />,
      label: "Meus Pacientes",
      onClick: () => handleRedirect("home"),
    },
    {
      icon: <AddPeopleIcon />,
      label: "Adicionar Pessoas",
      onClick: () => handleRedirect("home"),
    },
    {
      icon: <LogoutIcon />,
      label: "Sair",
      onClick: handleLogout,
    },
  ];
  return menuItems;
};

export const SideBar: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const { open, setOpen } = useSideBar();
  const router = useRouter();
  const { route } = router;
  const [primaryPath, secondaryPath] = route
    .split("/")
    .filter((item) => item !== "");

  const menuItems = useMenuItems();
  if (!user) return <></>;
  return (
    <>
      <div className="fixed z-30 flex h-16 w-full items-center justify-center bg-white p-2 px-10 dark:bg-[#0F172A] dark:text-white">
        <div
          className={`logo ${
            open ? "" : "ml-12"
          } flex  h-full flex-none transform items-center justify-center duration-500 ease-in-out dark:text-white`}
        >
          Health Ops
        </div>
        <div className="flex h-full grow items-center justify-center"></div>
        <div className="flex h-full flex-none items-center justify-center text-center">
          <div className="flex items-center space-x-3 px-3">
            <div className="flex flex-none justify-center">
              <div className="flex h-8 w-8 "></div>
            </div>

            <div className="md:text-md hidden text-sm text-black dark:text-white md:block">
              {user.fullName}
            </div>
            <div
              onClick={() => {
                router
                  .push({
                    pathname: "/home/account/[userId]",
                    query: { userId: user.id },
                  })
                  .catch((err) => console.error(err));
              }}
              className="flex flex-none cursor-pointer justify-center"
            >
              <Image
                className="rounded-full"
                alt={`${user.fullName ?? "user"}'s profile picture`}
                src={user.profileImageUrl}
                width={30}
                height={30}
              />
            </div>
          </div>
        </div>
      </div>
      <aside
        className={`fixed z-50 flex h-screen w-60  ${
          open ? "translate-x-none" : "-translate-x-48"
        } transform bg-slate-100 transition duration-1000 ease-in-out dark:bg-[#1E293B] dark:text-white`}
      >
        <div
          className={`max-toolbar  absolute -right-6 top-2 flex h-12 w-full ${
            open ? "translate-x-0" : "translate-x-24 scale-x-0"
          } transform items-center justify-between rounded-full border-4 border-white transition  duration-300 ease-in dark:border-[#0F172A] dark:bg-[#1E293B]`}
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
          className="absolute -right-6 top-2 flex transform rounded-full border-4 border-white bg-slate-200 p-3 transition duration-500 ease-in-out hover:rotate-45 hover:bg-purple-500 dark:border-[#0F172A] dark:bg-[#1E293B] dark:text-white dark:hover:bg-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        </div>
        <MenuItems items={menuItems} open={open} />
      </aside>
      <div
        className={`content ${
          open ? "ml-12 md:ml-60" : "ml-12"
        } transform px-2 pb-4 pt-20 duration-500 ease-in-out md:px-5`}
      >
        <nav
          className="flex rounded-lg bg-slate-100 px-5  py-3 text-gray-700 dark:bg-[#1E293B]"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/home"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                {primaryPath && makePrettyPathNames[primaryPath]}
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <Link
                  href="/home"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white md:ml-2"
                >
                  {secondaryPath && makePrettyPathNames[secondaryPath]}
                </Link>
              </div>
            </li>
          </ol>
        </nav>
        <div className="mt-4 flex bg-white shadow-lg dark:bg-[#1E293B]">
          {children}
        </div>
      </div>
    </>
  );
};
