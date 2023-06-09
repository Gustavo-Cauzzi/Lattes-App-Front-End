import { Button } from "@mui/material";
import { DataGrid, GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Person } from "../../shared/@types/Person";
import { Result } from "../../shared/@types/Result";
import { LightTooltip } from "../../shared/components/MuiUtils/LightTooltip";
import { BaseResultToSave } from "../../shared/store/modules/cruds/resultSlice";
import { ResultDialogForm } from "../Results/ResultDialogForm";
import { AppDispatch, RootState } from "../../shared/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addResultToSave } from "../../shared/store/modules/cruds/projectsSlice";
import { api } from "../../shared/services/api";

interface ProjectResultsTabProps {
  project: {
    results: Result[];
    title?: string;
    people: Person[];
  };
}

type SimpleResult = Omit<Result, "project">;

let negativeIncremental = -1;

export const ProjectResultsTab: React.FC<ProjectResultsTabProps> = ({ project }) => {
  const dispatch: AppDispatch = useDispatch();
  const [results, setResults] = useState<SimpleResult[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [resultsDialogFormOpen, setResultsDialogFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resultsToSave = useSelector<RootState, BaseResultToSave[]>((state) => state.projects.pendingResultsToSave);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      // Project.resutls vem sem a FK de pessoas
      const fullResultsInfo = (
        await Promise.all(
          project.results.map((partialResultInfo) => api.get<Result>(`/results/${partialResultInfo.id}`))
        )
      ).map((response) => response.data);

      setResults([...fullResultsInfo, ...resultsToSave.map((r) => ({ ...r, id: negativeIncremental-- }))]);
      setIsLoading(false);
    };

    getData();
  }, []);

  const handleNewResultsSave = async (resultToSave: BaseResultToSave) => {
    setResults((state) => [
      ...state,
      { description: resultToSave.description, id: incrementalId, persons: resultToSave.persons },
    ]);
    dispatch(addResultToSave(resultToSave));
  };

  const incrementalId = -(resultsToSave.length + 1);

  return (
    <>
      <ResultDialogForm
        open={resultsDialogFormOpen}
        onClose={() => setResultsDialogFormOpen(false)}
        fixedProject={{
          id: incrementalId,
          title: project.title || "Novo projeto",
          persons: project.people,
        }}
        onSave={handleNewResultsSave}
      />

      <div className="flex w-full gap-4 justify-between items-center">
        <h2 className="text-primary text-xl whitespace-nowrap">Resultados do projeto</h2>

        <div className="pt-2 flex gap-2 w-full max-w-sm justify-end overflow-hidden">
          <Button onClick={() => setResultsDialogFormOpen(true)} startIcon={<FiPlus />} variant="text">
            Adicionar
          </Button>
        </div>
      </div>

      <DataGrid
        loading={isLoading}
        rows={results}
        columns={[
          { field: "id", headerName: "ID", flex: 0.3 },
          { field: "description", headerName: "Descrição", flex: 1 },
          {
            field: "persons",
            headerName: "Pessoas",
            flex: 1,
            renderCell: (p: GridRenderCellParams<SimpleResult, Person[]>) => (
              <LightTooltip
                title={
                  <div className="flex flex-col gap-2 p-2">
                    {!p.row.persons || p.row.persons.length === 0 ? (
                      <span className="text-lg">Nenhuma pessoa no projeto</span>
                    ) : (
                      p.row.persons.map((person) => (
                        <span className="text-lg" key={person.id}>
                          {person.name}
                        </span>
                      ))
                    )}
                  </div>
                }
              >
                <span>{p.row.persons?.length ?? 0}</span>
              </LightTooltip>
            ),
          },
        ]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </>
  );
};
