import Link from "next/link";
import React from "react";

type MenuItemProps = {
  open: boolean;
  items: MenuItemType[];
};

export type MenuItemType = {
  label?: string;
  visible?: boolean;
  icon: React.ReactNode;
  path: string;
};

export const MenuOpenedItems: React.FC<MenuItemProps> = ({ open, items }) => {
  return (
    <div
      className={`max mt-20 ${
        open ? "flex" : "hidden"
      } h-[calc(100vh)] w-full flex-col space-y-2  dark:text-white`}
    >
      {items.map((item) => {
        const { icon, path, label, visible } = item;
        return (
          <Link
            href={path}
            key={label}
            className={`flex w-full ${
              visible === false ? "hidden" : ""
            } transform cursor-pointer flex-row items-center space-x-3 rounded-full bg-slate-100 p-2 pl-8 duration-300 ease-in-out hover:ml-4 hover:text-purple-500 dark:bg-[#1E293B] dark:text-white dark:hover:text-blue-500`}
          >
            {icon}
            <div>{label}</div>
          </Link>
        );
      })}
    </div>
  );
};

export const MenuClosedItems: React.FC<MenuItemProps> = ({ open, items }) => {
  return (
    <div
      className={`mini mt-20 ${
        open ? "hidden" : "flex"
      } h-[calc(100vh)] w-full flex-col space-y-2`}
    >
      {items.map((item) => {
        return (
          <Link
            href={item.path}
            key={item.label}
            className="flex w-full transform justify-end rounded-full p-3 pr-5 duration-300 ease-in-out hover:ml-4 hover:text-purple-500 dark:bg-[#1E293B] dark:text-white dark:hover:text-blue-500"
          >
            {item.icon}
          </Link>
        );
      })}
    </div>
  );
};

export const MenuItems: React.FC<MenuItemProps> = ({ items, open }) => {
  return (
    <>
      <MenuOpenedItems items={items} open={open} />
      <MenuClosedItems items={items} open={open} />
    </>
  );
};
