import { yupResolver } from "@hookform/resolvers/yup";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { DataGrid, GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import { format } from "date-fns";
import { SyntheticEvent, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiCheck, FiPlus, FiSave, FiX } from "react-icons/fi";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import { date, object, ref, string } from "yup";
import { Person } from "../../shared/@types/Person";
import { Project, Roles } from "../../shared/@types/Project";
import { Result } from "../../shared/@types/Result";
import { TabPanel } from "../../shared/components/MuiUtils/TabPanel";
import { api } from "../../shared/services/api";
import { saveProject } from "../../shared/store/modules/cruds/projectsSlice";
import { AppDispatch } from "../../shared/store/store";
import { IfPresent, isTruthy } from "../../shared/utils/Utils";
import { ProjectResultsTab } from "./ProjectResultsTab";
import { isRejectedWithValue } from "@reduxjs/toolkit";

interface DefaultValues {
  description: string;
  sponsor: string;
  isFinished: boolean;
  startDate: Date | null;
  finishDate: Date | null;
  title: string;
}

interface ProjectDialogFormProps extends DialogProps {
  project?: Project;
}
const defaultValues: DefaultValues = {
  description: "",
  isFinished: false,
  sponsor: "",
  finishDate: null,
  startDate: new Date(),
  title: "",
};
const schema = object({
  description: string().required("Informe uma descrição"),
  startDate: date().required("Informe um início").typeError("Data inválida"),
  finishDate: date().nullable().min(ref("startDate"), "Data final deve ser depois do início"),
});

type RoleOption = { id: number; role: Roles; label: string };
const roleOptions: RoleOption[] = [
  { id: 1, role: "member", label: "Membro" },
  { id: 2, role: "coordinator", label: "Coordenador" },
];

export const ProjectDialogForm: React.FC<ProjectDialogFormProps> = ({ project, ...props }) => {
  const dispatch: AppDispatch = useDispatch();
  const [isAddPersonMode, setIsAddPersonMode] = useState(false);
  const [currentOpenTab, setCurrentOpenTab] = useState(0);
  // People list
  const [people, setPeople] = useState<Project["persons"]>([]);
  const [personToAdd, setPersonToAdd] = useState<Person | null>(null);
  // Results list
  const [results, setResults] = useState<Result[]>([]);
  // Seleção pendente da implementação de deleção de registros no backend
  const [_selectedPeopleIds, setSelectedPeopleIds] = useState<Person["id"][]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 10, page: 0 });

  const [unsavedPeopleIds, setUnsavedPeopleIds] = useState<Person["id"][]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DefaultValues>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const wTitle = watch("title");

  const { data: peopleAutocompleteData } = useQuery("people", async () => {
    const { data } = await api.get<Person[]>("/persons");
    return data ?? [];
  });

  const handleSave = async (data: DefaultValues) => {
    const toastId = toast.loading("Salvando dados...");
    const result = await dispatch(
      saveProject({
        ...data,
        id: project?.id,
        startDate: data.startDate ?? undefined,
        finishDate: data.finishDate ?? undefined,
        title: data.title,
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
      if (isRejectedWithValue(result)) {
        toast.error(result.payload as string);
      } else {
        toast.error("Não foi possível salvar os dados");
      }
    } else {
      toast.success("Dado salvo com sucesso!");
      handleClose();
    }

    toast.dismiss(toastId);
  };

  const handleClose = () => {
    reset(defaultValues);
    handleResetAddPersonMode();
    setPeople([]);
    props.onClose && props.onClose({} as SyntheticEvent, "backdropClick");
  };

  useEffect(() => {
    if (!project) {
      setPeople([]);
      return;
    }
    setPeople(project.persons ?? []);
    setResults(project.results);
    reset({
      description: project.description ?? "",
      finishDate: project.finishDate ?? null,
      isFinished: project.isFinished ?? 0,
      sponsor: project.sponsor ?? "",
      startDate: project.startDate ?? null,
      title: project.title,
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

  const dateIntervalError = errors.startDate?.message ?? errors.finishDate?.message ?? "";

  return (
    <>
      <Dialog maxWidth="xl" fullWidth {...props} onClose={handleClose}>
        <DialogTitle className="text-primary">{project ? "Editar" : "Adicionar"} Projeto</DialogTitle>
        <DialogContent>
          <form
            id="projectsForm"
            onSubmit={handleSubmit(handleSave)}
            className="flex flex-col w-full justify-center gap-4 py-4"
          >
            <div className="flex flex-col gap-4 w-full justify-around">
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    className="max-w-sm"
                    label="Título*"
                    placeholder="Título do projeto"
                    error={!!errors.description}
                    helperText={errors.description?.message ?? ""}
                  />
                )}
              />
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    className="max-w-5xl"
                    size="small"
                    minRows={4}
                    maxRows={9}
                    label="Descrição"
                    placeholder="Descreva aqui detalhes do seu projeto..."
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
                    {...field}
                    fullWidth
                    className="max-w-xs"
                    label="Patrocinador"
                    placeholder="Financiador do projeto"
                    error={!!errors.sponsor}
                    helperText={errors.sponsor?.message ?? ""}
                  />
                )}
              />
            </div>
            <div className="flex gap-2 w-full items-center">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    slotProps={{
                      textField: {
                        error: !!errors.startDate,
                        placeholder: format(new Date(), "dd/MM/yyyy"),
                        label: "Início*",
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
                        label: "Fim",
                        placeholder: format(new Date(), "dd/MM/yyyy"),
                      },
                    }}
                  />
                )}
              />

              {dateIntervalError && <small className="pl-6 text-error text-center">{dateIntervalError}</small>}
            </div>
          </form>

          <Paper>
            <Tabs
              value={currentOpenTab}
              onChange={(_e, newValue) => setCurrentOpenTab(newValue)}
              aria-label="basic tabs example"
            >
              <Tab label="Pessoas" />
              <Tab label="Resultados" />
            </Tabs>
            <TabPanel value={currentOpenTab} index={0}>
              <div className="flex w-full gap-4 justify-between items-center flex-col xs:flex-row">
                <h2 className="text-primary text-xl whitespace-nowrap">Pessoas do projeto</h2>

                <div className="pt-2 flex gap-2 w-fit max-w-sm justify-end overflow-hidden flex-col smmd:flex-row">
                  <div className="flex gap-2 justify-between items-center">
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
                  </div>

                  <Autocomplete
                    value={personToAdd}
                    onChange={(_e, newValue) => setPersonToAdd(newValue)}
                    fullWidth
                    className={`smmd:min-w-[10rem] ${
                      isAddPersonMode ? "" : "hidden smmd:block mr-[-10rem]"
                    } transition-all`}
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
            </TabPanel>
            <TabPanel value={currentOpenTab} index={1}>
              <ProjectResultsTab
                project={{
                  people: people ?? [],
                  results,
                  title: wTitle,
                }}
              />
            </TabPanel>
          </Paper>
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
