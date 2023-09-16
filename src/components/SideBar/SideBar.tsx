import React, { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useMenuItems, useSideBar } from "./hooks";
import { ThemeToggle } from "../ThemeToggle";
import { MenuItems } from "../MenuItems";
import { LotusIcon } from "../Icons";
import { Avatar, Button, Menu } from "@mantine/core";
import { IconSettings, IconLogout, IconSearch } from "@tabler/icons-react";

import CommandPalette, {
  getItemIndex,
  useHandleOpenCommandPalette,
} from "../SearchBar";
import { makeFilterItems } from "./utils";

export type SideBarProps = {
  children?: React.ReactNode;
};

export const SideBar: React.FC<SideBarProps> = ({ children }) => {
  const { user } = useUser();
  const { open, setOpen } = useSideBar();
  const { signOut } = useClerk();
  const [openSearch, setOpenSearch] = useState<boolean>(false);
  const router = useRouter();
  const { route } = router;
  const menuItems = useMenuItems();
  const [search, setSearch] = useState("");

  useHandleOpenCommandPalette(setOpenSearch);

  const filterItems = makeFilterItems(search);

  if (!user) return <></>;

  return (
    <>
      <CommandPalette
        onChangeSearch={setSearch}
        onChangeOpen={setOpenSearch}
        search={search}
        isOpen={openSearch}
        page={route}
        placeholder="Procurar..."
      >
        {filterItems.map((list) => (
          <CommandPalette.List key={list.id} heading={list.heading}>
            {list.items.map(({ id, ...rest }) => (
              <CommandPalette.ListItem
                key={id}
                index={getItemIndex(filterItems, id)}
                {...rest}
              />
            ))}
          </CommandPalette.List>
        ))}
      </CommandPalette>
      <div className="fixed z-30 flex h-16 w-full items-center justify-center bg-white p-2 px-10 dark:bg-[#0F172A] dark:text-slate-300">
        <div
          className={`logo ${
            open ? "" : "ml-12"
          } flex  h-full flex-none transform items-center justify-center duration-500 ease-in-out dark:text-slate-300`}
        >
          {user.fullName}
        </div>
        <div className="flex h-full grow items-center justify-center"></div>
        <div className="flex h-full flex-none items-center justify-center text-center">
          <div className="flex items-center space-x-3 px-3">
            <div className="flex flex-none justify-center">
              <div className="flex h-8 w-8 "></div>
            </div>
            <Button
              leftIcon={<IconSearch className="h-4 w-4" />}
              className="border border-slate-100 bg-slate-100 hover:bg-slate-200 dark:border-gray-600 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:bg-gray-800"
              onClick={() => setOpenSearch(true)}
            >
              Procurar (Ctrl + K)
            </Button>
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
              <Menu.Dropdown className="dark:bg-[#0F172A]  dark:hover:text-orange-400">
                <Menu.Label className="text-md  dark:text-slate-300">
                  {user.primaryEmailAddress?.emailAddress}
                </Menu.Label>
                <Menu.Item
                  onClick={() => {
                    router
                      .push({
                        pathname: "/account",
                        query: { userId: user.id },
                      })
                      .catch((err) => console.error(err));
                  }}
                  className={`bg-slate-100  hover:bg-slate-200  ${
                    route.includes("account")
                      ? "bg-slate-200 dark:bg-gray-800"
                      : "bg-slate-100 dark:bg-[#0F172A]"
                  } dark:text-slate-300 dark:hover:bg-[#1E293B]`}
                  icon={<IconSettings className="text-amber-700" size={14} />}
                >
                  Configurações da conta
                </Menu.Item>
                <Menu.Item
                  onClick={() => signOut()}
                  className="mt-2  bg-slate-100 hover:bg-slate-200  dark:bg-[#0F172A] dark:text-slate-300 dark:hover:bg-gray-800"
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
        } transform bg-slate-100 transition duration-1000 ease-in-out dark:bg-gray-800 dark:text-slate-300`}
      >
        <div
          className={`max-toolbar  absolute -right-6 top-2 flex h-12 w-full ${
            open ? "translate-x-0" : "translate-x-24 scale-x-0"
          } transform items-center justify-between rounded-full border-4 border-white transition  duration-300 ease-in dark:border-[#0F172A] dark:bg-slate-800`}
        >
          <div className="flex items-center space-x-2 pl-4 ">
            <ThemeToggle />
          </div>
          <div className="group flex items-center space-x-3 rounded-full bg-gradient-to-r  from-indigo-500 via-purple-500 to-purple-500 py-1  pl-10 pr-2 dark:from-cyan-500 dark:to-blue-500 dark:text-slate-300">
            <div className="mr-12 transform duration-300 ease-in-out">
              HEALTH
            </div>
          </div>
        </div>
        <div
          onClick={() => setOpen(!open)}
          className="absolute -right-6 top-2 flex transform rounded-full  border-4 border-white bg-slate-200 p-3 text-slate-700 transition duration-500 ease-in-out hover:rotate-45 hover:bg-purple-500 dark:border-[#0F172A] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-500"
        >
          <LotusIcon />
        </div>
        <MenuItems items={menuItems} open={open} />
      </aside>
      <div
        className={`content ${
          open ? "ml-12 md:ml-60" : "ml-12"
        } bg- bg transform px-2 pb-4 pt-20 duration-500 ease-in-out md:px-5`}
      >
        {children}
      </div>
    </>
  );
};
