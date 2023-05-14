import React from "react";
import { type IconName } from "../SearchBar/types";
import * as TablerIcon from "@tabler/icons-react";

export interface IconProps extends TablerIcon.TablerIconsProps {
  iconName: IconName;
}

export const CustomIcon: React.FC<IconProps> = ({
  iconName,
  ...rest
}): JSX.Element => {
  const Icon = TablerIcon[iconName] as React.FC<TablerIcon.TablerIconsProps>;
  return <Icon {...rest} />;
};
