import Link from "next/link";
import React from "react";

type MenuItemProps = {
  open: boolean;
  items: MenuItemType[];
};

export type MenuItemType = {
  label?: string;
  visible?: boolean;
  selected?: boolean;
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
        const { icon, path, label, visible, selected } = item;
        return (
          <Link
            href={path}
            key={label}
            className={`flex w-full ${
              visible === false ? "hidden" : "visible"
            } transform cursor-pointer flex-row items-center space-x-3 rounded-full bg-slate-100 p-2 pl-8 text-slate-700 duration-300 ease-in-out ${
              selected
                ? "ml-4 text-purple-500 dark:text-blue-500"
                : "hover:ml-4 hover:text-purple-500"
            }   dark:bg-gray-800 dark:text-slate-200  dark:hover:text-blue-500`}
          >
            {icon}
            <div className="text-slate-700 dark:text-slate-200">{label}</div>
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
            className={`flex w-full transform justify-end rounded-full p-3 pr-5 duration-300 ease-in-out ${
              item.selected
                ? "ml-1  text-purple-500 dark:text-blue-500"
                : "hover:ml-1 hover:text-purple-500"
            } bg-slate-100 dark:bg-gray-800 dark:text-white dark:hover:text-blue-500`}
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
