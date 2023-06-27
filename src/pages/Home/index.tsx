import { FiPackage, FiUser } from "react-icons/fi";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { Project } from "../../shared/@types/Project";
import { ListTooltip } from "../../shared/components/ListTooltip";
import { api } from "../../shared/services/api";
import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle } from "@mui/material";

export const Home = () => {
  const [projectToOpen, setProjectToOpen] = useState<Project>();

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
    <>
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-primary text-3xl">Projetos UCS</h1>
        <div className="flex flex-col w-full gap-5 pt-6">
          {projects?.length ? (
            projects.map((project) => (
              <div
                key={project.id}
                className="relative hover:bg-[#f9f9f9] transition-all hover:shadow-md overflow-hidden font-arial flex flex-col gap-2 rounded-md bg-white p-6 shadow-sm"
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

      <ProjectDialogOverview project={projectToOpen} onClose={() => setProjectToOpen(undefined)} />
    </>
  );
};

const ProjectDialogOverview: React.FC<Omit<DialogProps, "open"> & { project?: Project }> = ({ project, ...props }) => {
  return (
    <Dialog maxWidth="lg" fullWidth {...props} open={!!project}>
      <DialogTitle className="text-primary text-xl">{project?.title}</DialogTitle>
      <DialogContent></DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" type="submit">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
