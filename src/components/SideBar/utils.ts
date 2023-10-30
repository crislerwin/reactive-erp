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
        heading: "Consultorios",
        id: "offices",
        items: [
          {
            id: "offices",
            children: "Consultorios",
            icon: "IconBuilding",
            href: "/offices",
          },
        ],
      },
      {
        heading: "Pacientes",
        id: "patients",

        items: [
          {
            id: "patients",
            children: "Pacientes",
            icon: "IconUsers",
            href: "/patients",
          },
        ],
      },
    ],
    search
  );
};
