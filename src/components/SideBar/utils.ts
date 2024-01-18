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
            href: "/home",
          },
        ],
      },
      {
        heading: "Instituições",
        id: "institutions",
        items: [
          {
            id: "institutions",
            children: "Instituições",
            icon: "IconBuilding",
            href: "/institutions",
          },
        ],
      },
      {
        heading: "Equipe",
        id: "team",

        items: [
          {
            id: "team",
            children: "Equipe",
            icon: "IconUsers",
            href: "/team",
          },
        ],
      },
    ],
    search
  );
};
