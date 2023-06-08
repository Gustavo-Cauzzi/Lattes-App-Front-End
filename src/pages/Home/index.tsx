import { FiFile, FiPackage, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

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

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-10 pt-6">
      {menus.map((menu) => (
        <div
          className="text-primary bg-white border-primary border-2 rounded-3xl p-2 w-full min-h-[10rem] flex items-center justify-center gap-10 text-3xl cursor-pointer hover:brightness-90 transition-all"
          onClick={() => navigate(menu.goTo)}
          key={menu.title}
        >
          <menu.icon className="ml-[-1.5rem]" size={45} />
          <span>{menu.title}</span>
        </div>
      ))}
    </div>
  );
};
