import React, { type ReactNode } from "react";

interface ListProps {
  children: ReactNode;
  heading?: string;
}

export default function List({ children, heading }: ListProps) {
  return (
    <div className="space-y-1" tabIndex={-1}>
      {heading && (
        <h4 className="px-3.5 text-sm font-medium text-gray-500">{heading}</h4>
      )}

      <ul tabIndex={-1}>{children}</ul>
    </div>
  );
}
