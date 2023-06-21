import { Button } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Person } from "../../shared/@types/Person";
import { Result } from "../../shared/@types/Result";
import { ListTooltip } from "../../shared/components/ListTooltip";
import { api } from "../../shared/services/api";
import { addResultToSave } from "../../shared/store/modules/cruds/projectsSlice";
import { BaseResultToSave } from "../../shared/store/modules/cruds/resultSlice";
import { AppDispatch, RootState } from "../../shared/store/store";
import { ResultDialogForm } from "../Results/ResultDialogForm";

interface ProjectResultsTabProps {
  project: {
    results: Result[];
    title?: string;
    people: Person[];
  };
  disabledAdd?: boolean;
}

type SimpleResult = Omit<Result, "project">;

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", flex: 0.3 },
  { field: "description", headerName: "Descrição", flex: 1 },
  {
    field: "persons",
    headerName: "Pessoas",
    flex: 1,
    renderCell: (p: GridRenderCellParams<SimpleResult, Person[]>) => (
      <div>
        <ListTooltip feminine list={p.row.persons?.map((p) => p.name ?? "Não reconhecido") ?? []} subject="pessoa" />
      </div>
    ),
  },
];

let negativeIncremental = -1;

export const ProjectResultsTab: React.FC<ProjectResultsTabProps> = ({ project, disabledAdd }) => {
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

      console.log("project: ", project);
      console.log("resultsToSave, fullResultsInfo: ", resultsToSave, fullResultsInfo);

      setResults([...fullResultsInfo, ...resultsToSave.map((r) => ({ ...r, id: negativeIncremental-- }))]);
      setIsLoading(false);
    };

    getData();
  }, [project]);

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
          <Button
            onClick={() => setResultsDialogFormOpen(true)}
            startIcon={<FiPlus />}
            variant="text"
            disabled={disabledAdd}
          >
            Adicionar
          </Button>
        </div>
      </div>

      <DataGrid
        loading={isLoading}
        rows={results}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </>
  );
};
