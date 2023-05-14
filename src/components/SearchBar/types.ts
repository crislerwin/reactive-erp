import { type ButtonProps, type SearchLinkProps } from "./ListItem";
import type * as TablerIcons from "@tabler/icons-react";

type $Keys<T> = keyof T;

export type IconName = $Keys<typeof TablerIcons>;

export type JsonStructure = Array<{
  items: Array<JsonStructureItem>;
  heading?: string;
  id: string;
}>;

export type JsonStructureItem = Omit<
  (ButtonProps & SearchLinkProps) & { id: string },
  "index"
>;
