import { FiPackage, FiUser } from "react-icons/fi";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { Project } from "../../shared/@types/Project";
import { ListTooltip } from "../../shared/components/ListTooltip";
import { api } from "../../shared/services/api";
import { useEffect } from "react";

export const Home = () => {
  const navigate = useNavigate();

  const { data: projects } = useQuery("projects", async () => {
    const response = await api.get<Project[]>("/projects");
    return response.data;
  });

  useEffect(() => {
    document.body.style.background = "#f2f2f2";

    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-primary text-3xl">Projetos UCS</h1>
      <div className="flex flex-col w-full gap-5 pt-6">
        {projects?.length ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="relative cursor-pointer hover:bg-[#f9f9f9] transition-all hover:shadow-md overflow-hidden font-arial flex flex-col gap-2 rounded-md bg-white p-6 shadow-sm"
              onClick={() => navigate(`/overview/${project.id}`)}
            >
              <div className="grid grid-cols-[1fr_125px]">
                <div className="flex flex-col gap-2">
                  <div className="items-center flex justify-between">
                    <div className="flex gap-1 w-full items-center">
                      <h2 className="text-2xl font-semibold">{project.title}</h2>
                    </div>
                  </div>

                  <p className="text-justify break-all text-sm text-gray-600">{project.description}</p>
                </div>

                <div className="flex flex-col items-start text-gray-600 justify-center gap-2 shadow-xl border-l-[1px] border-gray-200 absolute right-0 top-0 bottom-0 w-[125px] ">
                  <ListTooltip list={project.persons?.map((p) => p.name ?? "") ?? []} feminine subject="pessoa">
                    <div className="pl-3 flex gap-1 text-sm items-center">
                      <FiUser />
                      {project.persons?.length ?? 0} Pessoas
                    </div>
                  </ListTooltip>
                  <ListTooltip list={project.results?.map((p) => p.description ?? "") ?? []} subject="resultado">
                    <div className="pl-3 flex gap-1 text-sm items-center">
                      <FiPackage />
                      {project.results.length ?? 0} Resultados
                    </div>
                  </ListTooltip>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex w-full gap-1 justify-center text-gray-600">
            <span>Nenhum projeto criado.</span>
            <Link to="/projects" className="hover:underline font-bold">
              Crie seu primeiro aqui!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
