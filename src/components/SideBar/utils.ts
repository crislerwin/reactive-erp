import { filterItems } from "../SearchBar";

export const makeFilterItems = (search: string) => {
  return filterItems(
    [
      {
        heading: "Home",
        id: "home",
        items: [
          {
            id: "home",
            children: "Home",
            icon: "IconHome",
            href: "/",
          },
        ],
      },
      {
        heading: "Empresas",
        id: "companies",
        items: [
          {
            id: "companies",
            children: "Empresas",
            icon: "IconBuilding",
            href: "/companies",
          },
        ],
      },
      {
        heading: "Equipe",
        id: "persons",

        items: [
          {
            id: "persons",
            children: "Equipe",
            icon: "IconUsers",
            href: "/persons",
          },
        ],
      },
    ],
    search
  );
};
