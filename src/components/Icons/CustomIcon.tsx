import React from "react";
import * as TablerIcon from "@tabler/icons-react";

type $Keys<T> = keyof T;

export type IconName = $Keys<typeof TablerIcon>;

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
