import { Button, Drawer, DrawerProps } from "@mui/material";
import { Logo } from "./Logo";
import { FiUser, FiFile, FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";

const menus = [
  {
    title: "Pessoas",
    icon: FiUser,
    goTo: "/person",
  },
  {
    title: "Projetos",
    icon: FiFile,
    goTo: "/projects",
  },
  {
    title: "Resultados",
    icon: FiPackage,
    goTo: "/results",
  },
];

export const Sidebar: React.FC<DrawerProps> = (props) => {
  return (
    <Drawer {...props} PaperProps={{ style: { borderTopRightRadius: 25, borderBottomRightRadius: 25 } }}>
      <div className="min-w-[17.5rem] p-6 pt-8">
        <Logo className="text-primary font-normal" />

        <hr className="mt-4 mb-3 border-gray-300" />

        <div className="flex flex-col gap-2">
          {menus.map((menu) => (
            <Link
              className="flex gap-4 items-center px-3 py-2 text-primary hover:bg-gray-200 rounded-xl text-lg transition-colors"
              to={menu.goTo}
              key={menu.goTo}
              onClick={(e) => props.onClose && props.onClose(e, "backdropClick")}
            >
              <menu.icon size={25} />
              <span>{menu.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </Drawer>
  );
};
