import { FiPackage, FiUser } from "react-icons/fi";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { Project } from "../../shared/@types/Project";
import { ListTooltip } from "../../shared/components/ListTooltip";
import { api } from "../../shared/services/api";

export const Home = () => {
  const { data: projects } = useQuery("projects", async () => {
    const response = await api.get<Project[]>("/projects");
    return response.data;
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-primary text-3xl">Projetos UCS</h1>
      <div className="flex flex-col w-full gap-5 pt-6">
        {projects?.length ? (
          projects.map((project) => (
            <div key={project.id} className="font-arial flex flex-col gap-2 rounded-md bg-white p-6 shadow-sm">
              <div className="items-center flex justify-between">
                <div className="flex gap-1 w-full items-center">
                  <h2 className="text-2xl font-semibold">{project.title}</h2>
                  <ListTooltip list={project.persons?.map((p) => p.name ?? "") ?? []} feminine subject="pessoa">
                    <div className="pl-3 flex gap-1 items-center">
                      <FiUser />
                      {project.persons?.length ?? 0}
                    </div>
                  </ListTooltip>
                </div>

                <ListTooltip list={project.results?.map((p) => p.description ?? "") ?? []} subject="resultado">
                  <div className="pl-3 flex gap-1 items-center">
                    <FiPackage />
                    {project.results.length ?? 0}
                  </div>
                </ListTooltip>
              </div>

              <p className="text-justify break-all text-sm text-gray-600">{project.description}</p>
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
