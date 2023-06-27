import React from "react";
import { FiBook } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

export const Logo: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <strong
      className={twMerge(`flex gap-2 items-center text-2xl text-white cursor-pointer ${className ?? ""}`)}
      {...props}
    >
      <FiBook size={29} /> UCS Paper
    </strong>
  );
};
