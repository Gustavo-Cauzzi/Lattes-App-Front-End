import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { PropsWithChildren } from "react";

export const BaseLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />

      <main className="p-4">{children ?? <Outlet />}</main>
    </>
  );
};
