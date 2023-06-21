import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Button, TextField } from "@mui/material";
import { DataGrid, GridExpandMoreIcon, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { Project } from "../../shared/@types/Project";
import { Result } from "../../shared/@types/Result";
import { api } from "../../shared/services/api";
import { findAllResults } from "../../shared/store/modules/cruds/resultSlice";
import { AppDispatch, RootState } from "../../shared/store/store";
import { ResultDialogForm } from "./ResultDialogForm";

export const Results: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isResultFormDialogOpen, setIsResultFormDialogOpen] = useState(false);
  const [resultToEdit, setResultToEdit] = useState<Result>();
  const { data: projectsData } = useQuery("project", async () => {
    const { data } = await api.get<Project[]>("/projects");
    return data;
  });
  const [selectionModel, setSelectionModel] = useState<Result["id"][]>([]);

  const results = useSelector<RootState, Result[]>((state) => state.results.results);

  const [filters, setFilters] = useState({
    description: "",
    project: [] as Project[],
  });

  useEffect(() => {
    const toastId = toast.loading("Buscando resultados...");
    dispatch(findAllResults())
      .unwrap()
      .catch(() => toast.error("Não foi possível buscar os dados"))
      .finally(() => toast.dismiss(toastId));
  }, []);

  const updateFilter = (field: keyof typeof filters, value: (typeof filters)[typeof field]) => {
    setFilters((state) => ({ ...state, [field]: value }));
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="max-w-5xl gap-10 w-full">
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
              <div className="flex items-center justify-between gap-4 w-full">
                <span className="text-xl text-primary">Filtros</span>
              </div>
            </AccordionSummary>
            <AccordionDetails className="flex flex-col gap-4">
              <div className="grid gap-4 w-full grid-cols-2 my-4">
                <TextField
                  label="Descrição"
                  value={filters.description}
                  onChange={(e) => updateFilter("description", e.target.value)}
                />
                <Autocomplete
                  multiple
                  options={projectsData ?? []}
                  value={filters.project}
                  onChange={(_e, newValue) => updateFilter("project", newValue)}
                  renderInput={(params) => <TextField {...params} label="Projeto" />}
                  getOptionLabel={(project) => project.title ?? "Não identificado"}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </div>
            </AccordionDetails>
          </Accordion>

          <DataGrid
            rows={results.filter(
              (row) =>
                (!filters.description || row.description.toLowerCase().includes(filters.description.toLowerCase())) &&
                (!filters.project ||
                  !filters.project.length ||
                  !row.project ||
                  filters.project.find((p) => p.id === row.project?.id))
            )}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={(newSelectionModel) => setSelectionModel(newSelectionModel as Result["id"][])}
            onRowClick={(p) => setResultToEdit(p.row)}
            disableRowSelectionOnClick
            columns={[
              {
                field: "description",
                headerName: "Descrição",
                flex: 1,
              },
              {
                field: "project",
                headerName: "Projeto",
                flex: 0.7,
                valueGetter: (p: GridRenderCellParams<Result, Project | undefined>) =>
                  p.value?.title ?? "Não reconhecido",
              },
            ]}
          />

          <div className="flex justify-end mt-4 gap-4">
            <Button startIcon={<FiPlus />} variant="contained" onClick={() => setIsResultFormDialogOpen(true)}>
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      <ResultDialogForm
        open={isResultFormDialogOpen || !!resultToEdit}
        onClose={() => {
          setIsResultFormDialogOpen(false);
          setResultToEdit(undefined);
        }}
        result={resultToEdit}
      />
    </>
  );
};
