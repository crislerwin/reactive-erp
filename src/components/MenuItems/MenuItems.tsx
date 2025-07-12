import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { CustomIcon, type IconName } from "../Icons";

type MenuItemProps = {
  open: boolean;
  items: MenuItemType[];
};

export type MenuItemType = {
  label?: string;
  visible?: boolean;
  icon: IconName;
  href: string;
};

export const MenuOpenedItems = ({ open, items }: MenuItemProps) => {
  const { pathname } = useRouter();
  return (
    <div
      className={`max mt-20 ${
        open ? "flex" : "hidden"
      } h-[calc(100vh)] w-full flex-col space-y-2  dark:text-white`}
    >
      {items.map((item) => {
        const { icon, href: path, label, visible } = item;
        return (
          <Link
            key={label}
            href={path}
            className={`flex w-full ${
              visible === false ? "hidden" : "visible"
            } transform cursor-pointer flex-row items-center space-x-3 rounded-full bg-slate-100 p-2 pl-8 text-slate-700 duration-300 ease-in-out ${
              pathname === path
                ? "ml-2 text-purple-600 dark:text-blue-500"
                : "hover:ml-2 hover:text-purple-600"
            }   dark:bg-gray-800 dark:text-slate-200  dark:hover:text-blue-500`}
          >
            <CustomIcon className="h-4 w-4" iconName={icon} />
            <div className="text-slate-700 dark:text-slate-200">{label}</div>
          </Link>
        );
      })}
    </div>
  );
};

export const MenuClosedItems = ({ open, items }: MenuItemProps) => {
  const { pathname } = useRouter();

  return (
    <div
      className={`mini mt-20 ${
        open ? "hidden" : "flex"
      } h-[calc(100vh)] w-full flex-col space-y-2`}
    >
      {items.map((item) => {
        const { icon, href: path, label, visible } = item;
        return (
          <Link
            href={path}
            key={label}
            className={`flex w-full ${
              visible === false ? "hidden" : "visible"
            } transform justify-center rounded-full p-3 duration-300 ease-in-out ${
              pathname === path
                ? "ml-1  text-purple-500 dark:text-blue-500"
                : "hover:ml-1 hover:text-purple-500"
            } bg-slate-100 dark:bg-gray-800 dark:text-white dark:hover:text-blue-500`}
          >
            <CustomIcon className="h-4 w-4" iconName={icon} />
          </Link>
        );
      })}
    </div>
  );
};

export const MenuItems = ({ items, open }: MenuItemProps) => {
  return (
    <>
      <MenuOpenedItems items={items} open={open} />
      <MenuClosedItems items={items} open={open} />
    </>
  );
};
