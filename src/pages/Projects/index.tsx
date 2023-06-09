import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridExpandMoreIcon,
  GridPaginationModel,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import { isAfter, isBefore } from "date-fns";
import { SyntheticEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Project } from "../../shared/@types/Project";
import { LightTooltip } from "../../shared/components/MuiUtils/LightTooltip";
import { changeProjectStatus, findAllProjects } from "../../shared/store/modules/cruds/projectsSlice";
import { AppDispatch, RootState } from "../../shared/store/store";
import { ProjectDialogForm } from "./ProjectDialog";

const statusFilter = {
  all: "2",
  onGoing: "1",
  finished: "0",
} as const;

export const Projetos: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isProjectFormDialogOpen, setIsProjectFormDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project>();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  const projects = useSelector<RootState, Project[]>((state) => state.projects.projects);

  const [filters, setFilters] = useState({
    description: "",
    sponsor: "",
    startDateStart: null,
    startDateEnd: null,
    finishDateStart: null,
    finishDateEnd: null,
    isFinished: "2",
  });

  useEffect(() => {
    const toastId = toast.loading("Buscando projetos...");
    dispatch(findAllProjects())
      .unwrap()
      .catch(() => toast.error("Não foi possível buscar os dados"))
      .finally(() => toast.dismiss(toastId));
  }, []);

  const updateFilter = (field: keyof typeof filters, value: (typeof filters)[typeof field]) => {
    setFilters((state) => ({ ...state, [field]: value }));
  };

  const handleUpdateStatus = (event: SyntheticEvent, id: Project["id"]) => {
    event.stopPropagation();
    dispatch(changeProjectStatus(id));
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
              <div className="flex items-center justify-center gap-1">
                <FormControl>
                  <FormLabel>Status: </FormLabel>
                  <RadioGroup
                    row
                    value={filters.isFinished}
                    onChange={(_e, value) => updateFilter("isFinished", value)}
                  >
                    <FormControlLabel value={statusFilter.all} control={<Radio />} label="Todos" />
                    <FormControlLabel value={statusFilter.onGoing} control={<Radio />} label="Em andamento" />
                    <FormControlLabel value={statusFilter.finished} control={<Radio />} label="Terminados" />
                  </RadioGroup>
                </FormControl>
              </div>
              <div className="grid gap-4 w-full grid-cols-2 my-4">
                <TextField
                  label="Descrição"
                  value={filters.description}
                  onChange={(e) => updateFilter("description", e.target.value)}
                />
                <TextField
                  label="Patrocinador"
                  value={filters.sponsor}
                  onChange={(e) => updateFilter("sponsor", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-[repeat(4,auto)] items-center gap-2">
                <span className="text-gray-600">Início:</span>
                <DatePicker
                  value={filters.startDateStart}
                  onChange={(newValue) => updateFilter("startDateStart", newValue)}
                />
                <span className="text-center">até</span>
                <DatePicker
                  value={filters.startDateEnd}
                  onChange={(newValue) => updateFilter("startDateEnd", newValue)}
                />
                <span className="text-gray-600">Término:</span>
                <DatePicker
                  value={filters.finishDateStart}
                  onChange={(newValue) => updateFilter("finishDateStart", newValue)}
                />
                <span className="text-center">até</span>
                <DatePicker
                  value={filters.finishDateEnd}
                  onChange={(newValue) => updateFilter("finishDateEnd", newValue)}
                />
              </div>
            </AccordionDetails>
          </Accordion>

          <DataGrid
            rows={projects.filter(
              (row) =>
                (!filters.description ||
                  row.description?.toLocaleLowerCase().includes(filters.description.toLocaleLowerCase())) &&
                (!filters.startDateStart || (row.startDate && isAfter(row.startDate, filters.startDateStart))) &&
                (!filters.startDateEnd || (row.startDate && isBefore(row.startDate, filters.startDateEnd))) &&
                (!filters.finishDateStart || (row.finishDate && isAfter(row.finishDate, filters.finishDateStart))) &&
                (!filters.finishDateEnd || (row.finishDate && isBefore(row.finishDate, filters.finishDateEnd))) &&
                (filters.isFinished === statusFilter.all ||
                  (filters.isFinished === statusFilter.onGoing && !row.isFinished) ||
                  (filters.isFinished === statusFilter.finished && row.isFinished)) &&
                (!filters.sponsor || row.sponsor?.toLocaleLowerCase().includes(filters.sponsor.toLocaleLowerCase()))
            )}
            onRowClick={(p) => setProjectToEdit(p.row)}
            disableRowSelectionOnClick
            columns={[
              {
                field: "title",
                headerName: "Título",
                flex: 1,
              },
              {
                field: "description",
                headerName: "Descrição",
                flex: 1,
              },
              {
                field: "sponsor",
                headerName: "Patrocinador",
                flex: 1,
              },
              {
                field: "startDate",
                headerName: "Início",
                flex: 0.5,
                valueGetter: (p: GridValueGetterParams<Project, Date>) => p.value?.toLocaleDateString("pt-BR") ?? "-",
              },
              {
                field: "finishDate",
                headerName: "Término",
                flex: 0.5,
                valueGetter: (p: GridValueGetterParams<Project, Date>) => p.value?.toLocaleDateString("pt-BR") ?? "-",
              },
              {
                field: "peopleQuantity",
                headerName: "Pessoas",
                flex: 0.5,
                renderCell: (p: GridRenderCellParams<Project, null>) => (
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
              {
                field: "isFinished",
                headerName: "Finalizado",
                width: 100,
                renderCell: (p: GridRenderCellParams<Project, boolean>) => (
                  <Checkbox checked={p.value ?? false} onClick={(event) => handleUpdateStatus(event, p.row.id)} />
                ),
              },
            ]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />

          <div className="flex justify-end mt-4">
            <Button startIcon={<FiPlus />} variant="contained" onClick={() => setIsProjectFormDialogOpen(true)}>
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      <ProjectDialogForm
        open={isProjectFormDialogOpen || !!projectToEdit}
        onClose={() => {
          setIsProjectFormDialogOpen(false);
          setProjectToEdit(undefined);
        }}
        project={projectToEdit}
      />
    </>
  );
};
