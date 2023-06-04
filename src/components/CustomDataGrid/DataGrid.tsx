import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import React, { useLayoutEffect, useRef, useState } from "react";
import { type CustomDataGridProps } from "./types";
import {
  CustomRowContext,
  CustomRowRenderer,
} from "./Renderers/CustomRowRenderer";
import { tableClass } from "./styles";
import { createPortal } from "react-dom";
import { Button, List } from "@mantine/core";
import { CustomIcon } from "../Icons";

export const CustomDataGrid: React.FC<CustomDataGridProps> = ({
  onRowFocusCapture,
  contextMenuOptions = [],
  ...props
}) => {
  const { rows } = props;
  const [contextMenuProps, setContextMenuProps] = useState<{
    rowIdx: number;
    top: number;
    left: number;
  } | null>(null);
  const menuRef = useRef<HTMLMenuElement | null>(null);
  const isContextMenuOpen = contextMenuProps !== null;

  useLayoutEffect(() => {
    if (!isContextMenuOpen) return;

    const onClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setContextMenuProps(null);
    };

    addEventListener("click", onClick);

    return () => {
      removeEventListener("click", onClick);
    };
  }, [isContextMenuOpen]);

  return (
    <CustomRowContext.Provider value={{ onRowFocusCapture }}>
      <DataGrid
        enableVirtualization
        onCellContextMenu={({ row }, event) => {
          if (!contextMenuOptions.length) return;
          event.preventGridDefault();
          event.preventDefault();
          setContextMenuProps({
            rowIdx: rows.indexOf(row),
            top: event.clientY,
            left: event.clientX,
          });
        }}
        className={tableClass()}
        renderers={{
          rowRenderer: CustomRowRenderer,
        }}
        {...props}
      />
      {isContextMenuOpen &&
        createPortal(
          <menu
            className="absolute m-2 rounded bg-slate-200 p-2 text-black dark:bg-[#0F172A] dark:text-white"
            ref={menuRef}
            style={{
              top: contextMenuProps.top,
              left: contextMenuProps.left,
            }}
          >
            <List>
              {contextMenuOptions.map((item) => (
                <List.Item
                  onClick={() => {
                    item.onClick();
                    setContextMenuProps(null);
                  }}
                  key={item.label}
                >
                  <Button
                    compact
                    leftIcon={
                      <CustomIcon
                        className="h-4 w-4"
                        iconName={item.iconName}
                      />
                    }
                  >
                    {item.label}
                  </Button>
                </List.Item>
              ))}
            </List>
          </menu>,
          document.body
        )}
    </CustomRowContext.Provider>
  );
};
