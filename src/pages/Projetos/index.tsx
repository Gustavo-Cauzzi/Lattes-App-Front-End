import { yupResolver } from "@hookform/resolvers/yup";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
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
import { SyntheticEvent, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiCheck, FiPlus, FiSave, FiX } from "react-icons/fi";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { object, string } from "yup";
import { Person } from "../../shared/@types/Person";
import { Project, Roles } from "../../shared/@types/Project";
import { LightTooltip } from "../../shared/components/MuiUtils/LightTooltip";
import { api } from "../../shared/services/api";
import { changeProjectStatus, findAllProjects, saveProject } from "../../shared/store/modules/cruds/projectsSlice";
import { AppDispatch, RootState } from "../../shared/store/store";
import { IfPresent, isTruthy } from "../../shared/utils/Utils";
import { isAfter, isBefore } from "date-fns";

const statusFilter = {
  all: "2",
  onGoing: "1",
  finished: "0",
};

export const Projetos: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isProjectFormDialogOpen, setIsProjectFormDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project>();

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
                    onChange={(_e, value) => {
                      console.log("value: ", value);
                      updateFilter("isFinished", value);
                    }}
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

interface DefaultValues {
  description: string;
  sponsor: string;
  isFinished: boolean;
  startDate: Date | null;
  finishDate: Date | null;
}

interface ProjectDialogFormProps extends DialogProps {
  project?: Project;
}
const defaultValues: DefaultValues = {
  description: "",
  isFinished: false,
  sponsor: "",
  finishDate: null,
  startDate: null,
};
const schema = object({
  description: string().required("Campo obrigatório"),
  sponsor: string().required("Campo obrigatório"),
});

type RoleOption = { id: number; role: Roles; label: string };
const roleOptions: RoleOption[] = [
  { id: 1, role: "member", label: "Membro" },
  { id: 2, role: "coordinator", label: "Coordenador" },
];

const ProjectDialogForm: React.FC<ProjectDialogFormProps> = ({ project, ...props }) => {
  const dispatch: AppDispatch = useDispatch();
  const [people, setPeople] = useState<Project["persons"]>([]);
  const [personToAdd, setPersonToAdd] = useState<Person | null>(null);
  const [isAddPersonMode, setIsAddPersonMode] = useState(false);
  // Seleção pendente da implementação de deleção de registros no backend
  const [_selectedPeopleIds, setSelectedPeopleIds] = useState<Person["id"][]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 10, page: 0 });

  const [unsavedPeopleIds, setUnsavedPeopleIds] = useState<Person["id"][]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DefaultValues>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { data: peopleAutocompleteData } = useQuery("people", async () => {
    const { data } = await api.get<Person[]>("/persons");
    return data ?? [];
  });

  const handleSavePessoa = async (data: DefaultValues) => {
    const toastId = toast.loading("Carregando dados ");
    const result = await dispatch(
      saveProject({
        ...data,
        id: project?.id,
        startDate: data.startDate ?? undefined,
        finishDate: data.finishDate ?? undefined,
        persons: unsavedPeopleIds
          .map((unsId) => {
            const person = people?.find((person) => person.id === unsId);
            if (!person) return null;
            return { id: person.id, role: person.role };
          })
          .filter(isTruthy),
      })
    );

    if (saveProject.rejected.match(result)) {
      toast.error("Não foi possível salvar os dados");
    } else {
      toast.success("Dado salvo com sucesso!");
      handleClose();
    }

    toast.dismiss(toastId);
  };

  const handleClose = () => {
    reset(defaultValues);
    handleResetAddPersonMode();
    props.onClose && props.onClose({} as SyntheticEvent, "backdropClick");
  };

  useEffect(() => {
    if (!project) {
      setPeople([]);
      return;
    }
    console.log("project: ", project);
    setPeople(project.persons ?? []);
    reset({
      description: project.description ?? "",
      finishDate: project.finishDate ?? null,
      isFinished: project.isFinished ?? 0,
      sponsor: project.sponsor ?? "",
      startDate: project.startDate ?? null,
    });
  }, [project]);

  const handleAddClick = () => {
    if (!isAddPersonMode) {
      setIsAddPersonMode(true);
      return;
    }

    if (!personToAdd) {
      toast("Informe uma pessoa para adicionar");
      return;
    }

    setUnsavedPeopleIds((state) => [...state, personToAdd.id]);
    setPeople((state) => [...(state ?? []), { ...personToAdd, role: "member" }]);
    setPersonToAdd(null);
    setIsAddPersonMode(false);
  };

  const handleResetAddPersonMode = () => {
    setIsAddPersonMode(false);
    setPersonToAdd(null);
  };

  return (
    <>
      <Dialog maxWidth="xl" fullWidth {...props} onClose={handleClose}>
        <DialogTitle className="text-primary">{project ? "Editar" : "Adicionar"} Projeto</DialogTitle>
        <DialogContent>
          <form
            id="projectsForm"
            onSubmit={handleSubmit(handleSavePessoa)}
            className="flex flex-col w-full justify-center gap-4 py-4"
          >
            <div className="flex gap-2 w-full justify-around">
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField
                    fullWidth
                    {...field}
                    label="Descrição"
                    error={!!errors.description}
                    helperText={errors.description?.message ?? ""}
                  />
                )}
              />

              <Controller
                control={control}
                name="sponsor"
                render={({ field }) => (
                  <TextField
                    fullWidth
                    {...field}
                    label="Patrocinador"
                    error={!!errors.sponsor}
                    helperText={errors.sponsor?.message ?? ""}
                  />
                )}
              />
            </div>
            <div className="flex gap-2 w-full items-center">
              <span className="text-gray-600">Prazo:</span>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    slotProps={{
                      textField: {
                        error: !!errors.startDate,
                        helperText: errors.startDate?.message ?? "",
                      },
                    }}
                  />
                )}
              />

              <small>até</small>
              <Controller
                control={control}
                name="finishDate"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    slotProps={{
                      textField: {
                        error: !!errors.finishDate,
                        helperText: errors.finishDate?.message ?? "",
                      },
                    }}
                  />
                )}
              />
            </div>
          </form>

          <div className="mt-10 mb-2 flex w-full gap-4 justify-between items-center">
            <h2 className="text-primary text-xl whitespace-nowrap">Pessoas do projeto</h2>

            <div className="pt-2 flex gap-2 w-full max-w-sm justify-end overflow-hidden">
              {isAddPersonMode ? (
                <Button startIcon={<FiX />} onClick={handleResetAddPersonMode}>
                  Cancelar
                </Button>
              ) : (
                // <Button startIcon={<FiTrash2 />} onClick={handleRemovePeople} disabled={!selectedPeopleIds.length}>
                //   Remover
                // </Button>
                <></>
              )}
              <Button
                onClick={handleAddClick}
                disabled={isAddPersonMode && !personToAdd}
                startIcon={isAddPersonMode ? <FiCheck /> : <FiPlus />}
                variant={isAddPersonMode ? "contained" : "text"}
              >
                Adicionar
              </Button>

              <Autocomplete
                value={personToAdd}
                onChange={(_e, newValue) => setPersonToAdd(newValue)}
                fullWidth
                className={`max-w-[10rem] ${isAddPersonMode ? "" : "mr-[-10rem]"} transition-all`}
                options={
                  peopleAutocompleteData?.filter(
                    (personOption) => !people?.find((person) => person.id === personOption.id)
                  ) ?? []
                }
                getOptionLabel={(option) => `${option.id} - ${option.name}`}
                renderInput={(params) => <TextField {...params} size="small" label="Pessoa" />}
              />
            </div>
          </div>
          <DataGrid
            rows={people ?? []}
            columns={[
              { field: "id", headerName: "ID", flex: 0.3 },
              { field: "name", headerName: "Nome", flex: 1 },
              {
                field: "role",
                headerName: "Cargo",
                flex: 1,
                renderCell: (p: GridRenderCellParams<IfPresent<Project["persons"]>[number]>) => {
                  return (
                    <Autocomplete
                      value={roleOptions.find((r) => r.role === p.value)}
                      onChange={(_e, newValue) =>
                        setPeople((peopleState) =>
                          peopleState?.map((person) =>
                            person.id === p.row.id ? { ...person, role: newValue.role } : person
                          )
                        )
                      }
                      disableClearable
                      isOptionEqualToValue={(option, value) => option.role === value.role}
                      options={roleOptions}
                      fullWidth
                      getOptionLabel={(option: RoleOption) => option.label ?? "Não identificado"}
                      renderInput={(params) => <TextField {...params} size="small" variant="filled" />}
                    />
                  );
                },
              },
            ]}
            // checkboxSelection
            onRowSelectionModelChange={(newSelectionModel) => setSelectedPeopleIds(newSelectionModel as number[])}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<FiX />} color="primary" variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button startIcon={<FiSave />} color="primary" variant="contained" type="submit" form="projectsForm">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
