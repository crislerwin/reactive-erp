import { CustomIcon } from "./Icon";
import React, {
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type FC,
  type ReactNode,
  useContext,
} from "react";
import { type IconName } from "./types";
import { OpenContext, SelectContext } from "./lib/context";
import { classNames } from "./lib/utils";
import { type TablerIconsProps } from "@tabler/icons-react";
import Link, { type LinkProps } from "next/link";

export type ListItemType = "Link" | "Ação";

function getListItemWrapperStyles(selected: boolean, disabled?: boolean) {
  return classNames(
    "command-palette-list-item block w-full text-left px-3.5 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-1 focus:ring-gray-300 focus:outline-none flex items-center space-x-2.5 justify-between",
    selected && !disabled
      ? "bg-gray-200/50 dark:bg-gray-800"
      : "bg-transparent",
    disabled
      ? "cursor-default pointer-events-none opacity-50"
      : "cursor-pointer"
  );
}

interface ListItemBaseProps {
  closeOnSelect?: boolean;
  icon?: FC | IconName;
  showType?: boolean;
  disabled?: boolean;
  keywords?: string[];
  index: number;
}

export interface SearchLinkProps extends ListItemBaseProps, LinkProps {
  className?: string;
  children: ReactNode;
}

export const SearchLink: React.FC<SearchLinkProps> = ({
  closeOnSelect = true,
  disabled = false,
  showType = true,
  className,
  children,
  onClick,
  index,
  icon,
  ...rest
}) => {
  const { onChangeOpen } = useContext(OpenContext);
  const { selected } = useContext(SelectContext);

  function renderLinkContent() {
    return (
      <ListItemContent type={showType ? "Link" : undefined} icon={icon}>
        {children}
      </ListItemContent>
    );
  }

  const styles = classNames(
    getListItemWrapperStyles(selected === index, disabled),
    className
  );

  const clickAndClose = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (rest.href && !disabled) {
      if (onClick) {
        onClick(e);
      }
      if (closeOnSelect) {
        onChangeOpen(false);
      }
    }
  };

  return (
    <Link
      {...rest}
      data-close-on-select={closeOnSelect}
      aria-disabled={disabled}
      onClick={clickAndClose}
      className={styles}
    >
      {renderLinkContent()}
    </Link>
  );
};

export interface ButtonProps
  extends ListItemBaseProps,
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > {}

export function Button({
  closeOnSelect = true,
  showType = true,
  className,
  children,
  onClick,
  index,
  icon,
  ...rest
}: ButtonProps) {
  const { selected } = useContext(SelectContext);
  const { onChangeOpen } = useContext(OpenContext);

  function clickAndClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (onClick) {
      onClick(e);
      if (closeOnSelect) {
        onChangeOpen(false);
      }
    }
  }

  return (
    <button
      {...rest}
      aria-disabled={rest.disabled ?? false}
      data-close-on-select={closeOnSelect}
      onClick={clickAndClose}
      className={classNames(
        getListItemWrapperStyles(selected === index, rest.disabled),
        className
      )}
    >
      <ListItemContent type={showType ? "Ação" : undefined} icon={icon}>
        {children}
      </ListItemContent>
    </button>
  );
}

interface ListItemContentProps {
  icon?: FC<TablerIconsProps> | IconName;
  children: ReactNode;
  type?: ListItemType;
}

function ListItemContent({
  icon: ListItemIcon,
  children,
  type,
}: ListItemContentProps) {
  return (
    <>
      <div className="flex w-full items-center space-x-2.5">
        {ListItemIcon &&
          (typeof ListItemIcon === "string" ? (
            <CustomIcon
              className="h-4 w-4  text-gray-500"
              iconName={ListItemIcon}
            />
          ) : (
            <ListItemIcon className="h-4 w-4 text-gray-500" />
          ))}

        {typeof children === "string" ? (
          <span className="max-w-md truncate dark:text-white">{children}</span>
        ) : (
          children
        )}
      </div>

      {type && <span className="text-sm text-gray-500">{type}</span>}
    </>
  );
}

export default function ListItem(props: ButtonProps & SearchLinkProps) {
  const Wrapper = props.href ? SearchLink : Button;

  return <Wrapper {...props} />;
}
