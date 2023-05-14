import { IconGlass, IconX } from "@tabler/icons-react";
import React, { forwardRef, Fragment, type Ref } from "react";

interface SearchProps {
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string[];
  value: string;
}

const Search = (
  { onChange, placeholder, prefix, value }: SearchProps,
  ref: Ref<HTMLInputElement>
) => {
  return (
    <div className="flex items-center space-x-1.5 pl-3">
      <IconGlass className="pointer-events-none w-4 text-gray-400 dark:text-gray-600" />

      {prefix?.length
        ? prefix.map((p) => {
            return (
              <Fragment key={p}>
                <span className="dark:text-white">{p}</span>
                <span className="text-gray-500">/</span>
              </Fragment>
            );
          })
        : null}

      <div className="relative flex-1">
        <input
          ref={ref}
          spellCheck={false}
          className="w-full border-none bg-transparent px-0 py-4 placeholder-gray-500 focus:border-none focus:outline-none focus:ring-0 dark:text-white"
          onChange={(e) => {
            onChange(e.currentTarget.value);
          }}
          onFocus={(e) => {
            e.currentTarget.select();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              e.preventDefault();
              e.stopPropagation();
              onChange("");
            }
          }}
          id="command-palette-search-input"
          placeholder={placeholder}
          value={value}
          type="text"
          autoFocus
        />

        {value && (
          <button
            tabIndex={-1}
            type="button"
            onClick={() => {
              onChange("");
              const inputElement = document.getElementById(
                "command-palette-search-input"
              );
              if (inputElement) {
                inputElement.focus();
              }
            }}
          >
            <IconX className="absolute right-3 top-1/2 w-5 -translate-y-1/2 transform text-gray-300 transition hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
};

export default forwardRef(Search);
