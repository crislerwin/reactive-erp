import { filterItems } from "../SearchBar";

export const makeFilterItems = (search: string) => {
  return filterItems(
    [
      {
        heading: "Home",
        id: "",
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
        id: "providers",

        items: [
          {
            id: "providers",
            children: "Equipe",
            icon: "IconUsers",
            href: "/providers",
          },
        ],
      },
    ],
    search
  );
};
