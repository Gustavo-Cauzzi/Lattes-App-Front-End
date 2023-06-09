import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
  Tooltip,
} from "@mui/material";
import { Result } from "../../shared/@types/Result";
import { Controller, useForm } from "react-hook-form";
import { mixed, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SyntheticEvent, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Person } from "../../shared/@types/Person";
import { FiCheck, FiPlus, FiSave, FiX } from "react-icons/fi";
import { useQuery } from "react-query";
import { api } from "../../shared/services/api";
import { toast } from "react-hot-toast";
import { Project } from "../../shared/@types/Project";
import { useDispatch } from "react-redux";
import { BaseResultToSave, saveResult } from "../../shared/store/modules/cruds/resultSlice";
import { AppDispatch } from "../../shared/store/store";
import { confirmationToast } from "../../shared/utils/Utils";

type ProjectOption = Pick<Project, "id" | "title"> & { persons: Person[] };
interface ResultDialogFormProps extends DialogProps {
  result?: Result;
  fixedProject?: ProjectOption;
  onSave?: (result: BaseResultToSave) => Promise<void | boolean>;
}

const schema = object({
  description: string().required("Informação uma descrição"),
  project: mixed().required("Informe o projeto"),
});

interface DefaultValues {
  description: string;
  project: null | ProjectOption;
}

const defaultValues: DefaultValues = {
  description: "",
  project: null,
};

export const ResultDialogForm: React.FC<ResultDialogFormProps> = ({ open, onClose, result, fixedProject, onSave }) => {
  const dispatch: AppDispatch = useDispatch();
  const [people, setPeople] = useState<Person[]>([]);
  const [personToAdd, setPersonToAdd] = useState<Person | null>(null);
  const [isAddPersonMode, setIsAddPersonMode] = useState(false);
  const [isProjectPeopleLoading, setIsProjectPeopleLoading] = useState(false);
  const { data: projectsAutocompleteData } = useQuery("project", async () => {
    const { data } = await api.get<Project[]>("/projects");
    return data;
  });
  const {
    reset,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const wProject = watch("project");

  useEffect(() => {
    if (!result) {
      reset(defaultValues);
      return;
    }

    const getData = async () => {
      setPeople(result.persons);
      reset({
        description: result.description,
        project: result.project,
      });
      setIsProjectPeopleLoading(true);
      const { data: projectData } = await api.get<Project>(`/projects/${result.project.id}`);
      setValue("project", {
        id: projectData.id,
        persons: projectData.persons ?? [],
        title: projectData.title,
      });
      setIsProjectPeopleLoading(false);
    };

    getData();
  }, [result]);

  useEffect(() => {
    console.log("fixedProject: ", fixedProject);
    if (fixedProject) setValue("project", fixedProject);
  }, [fixedProject]);

  const handleClose = () => {
    onClose && onClose({} as SyntheticEvent, "escapeKeyDown");
    setIsAddPersonMode(false);
    setPersonToAdd(null);
    reset(defaultValues);
  };

  const handleSaveResult = async (data: DefaultValues) => {
    if (!data.project) {
      toast("Informe todos os dados necessários");
      return;
    }
    if (
      !people.length &&
      !(await confirmationToast("Tem certeza que quer salvar o resultado sem nenhuma pessoa atrelada a ele?"))
    ) {
      return;
    }

    const resultToSave = { persons: people, description: data.description, id: result?.id, projectId: data.project.id };
    if (onSave) {
      const valid = await onSave(resultToSave);
      if (valid === undefined || valid) {
        handleClose();
      }
    } else {
      const toastId = toast.loading("Carregando dados ");
      const dispatchResult = await dispatch(saveResult(resultToSave));

      if (saveResult.rejected.match(dispatchResult)) {
        toast.error("Não foi possível salvar o registro");
      } else {
        toast.success("Registro salvo com sucesso!");
        handleClose();
      }

      toast.dismiss(toastId);
    }
  };

  const handleResetAddPersonMode = () => {
    setIsAddPersonMode(false);
    setPersonToAdd(null);
  };

  const handleAddClick = () => {
    if (!isAddPersonMode) {
      setIsAddPersonMode(true);
      return;
    }

    if (!personToAdd) {
      toast("Informe uma pessoa para adicionar");
      return;
    }

    // setUnsavedPeopleIds((state) => [...state, personToAdd.id]);
    setPeople((state) => [...(state ?? []), { ...personToAdd, role: "member" }]);
    setPersonToAdd(null);
    setIsAddPersonMode(false);
  };

  const withFixedProject = <T extends any>(arr: T[]) => (fixedProject ? [fixedProject, ...arr] : arr);

  return (
    <Dialog open={open} maxWidth="md" fullWidth onClose={handleClose}>
      <DialogTitle className="text-primary">{result ? "Editar" : "Adicionar"} resultado</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleSaveResult)} id="resultsForm">
          <div className="flex flex-col gap-10">
            <div className="flex justify-between pt-3 flex-col gap-4 xssm:flex-row">
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição"
                    placeholder="Software do projeto"
                    error={!!errors.description}
                    helperText={errors.description?.message ?? ""}
                  />
                )}
              />

              <Controller
                control={control}
                name="project"
                render={({ field }) => (
                  <Autocomplete
                    disabled={!!fixedProject}
                    options={withFixedProject(projectsAutocompleteData ?? [])}
                    value={field.value}
                    fullWidth
                    className="xssm:max-w-xs"
                    onChange={(_e, newValue) => {
                      if (personToAdd) setPersonToAdd(null);
                      if (!newValue && isAddPersonMode) setIsAddPersonMode(false);
                      field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Projeto"
                        fullWidth
                        error={!!errors.project}
                        helperText={errors.project?.message ?? ""}
                      />
                    )}
                    getOptionLabel={(project) => project.title ?? "Não identificado"}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="mt-10 mb-2 flex w-full gap-4 justify-between items-center flex-col xs:flex-row">
                <h2 className="text-primary text-xl whitespace-nowrap">Pessoas do projeto</h2>

                <div className="pt-2 w-fit flex gap-2 max-w-sm justify-end overflow-hidden flex-col smmd:flex-row">
                  <div className="flex gap-2 justify-between items-center">
                    {isAddPersonMode && (
                      <Button startIcon={<FiX />} onClick={handleResetAddPersonMode}>
                        Cancelar
                      </Button>
                    )}
                    <Tooltip
                      title={!wProject ? "Selecione um projeto para adicionar pessoas" : ""}
                      arrow
                      placement="top"
                    >
                      <div>
                        <Button
                          onClick={handleAddClick}
                          disabled={!wProject || (isAddPersonMode && !personToAdd) || isProjectPeopleLoading}
                          startIcon={isAddPersonMode ? <FiCheck /> : <FiPlus />}
                          variant={isAddPersonMode ? "contained" : "text"}
                        >
                          {isProjectPeopleLoading ? <CircularProgress size="small" /> : "Adicionar"}
                        </Button>
                      </div>
                    </Tooltip>
                  </div>

                  <Autocomplete
                    value={personToAdd}
                    onChange={(_e, newValue) => setPersonToAdd(newValue)}
                    fullWidth
                    className={`smmd:min-w-[10rem] ${
                      isAddPersonMode ? "" : "hidden xssm:block mr-[-10rem]"
                    } transition-all`}
                    options={
                      wProject?.persons?.filter(
                        (personOption) => !people?.find((person) => person.id === personOption.id)
                      ) ?? []
                    }
                    noOptionsText={
                      wProject?.persons?.length ? "Nenhum resultado" : "Nenhuma pessoa cadastrada no projeto"
                    }
                    getOptionLabel={(option) => `${option.id} - ${option.name}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Pessoa"
                        inputProps={{ tabIndex: isAddPersonMode ? 0 : -1, ...params.inputProps }}
                      />
                    )}
                  />
                </div>
              </div>
              <DataGrid
                rows={people}
                columns={[
                  { field: "id", headerName: "ID", flex: 0.3 },
                  { field: "name", headerName: "Nome", flex: 1 },
                ]}
              />
            </div>
          </div>
        </form>
      </DialogContent>
      <DialogActions className="gap-3">
        <Button startIcon={<FiX />} color="primary" variant="outlined" onClick={handleClose}>
          Cancelar
        </Button>
        <Tooltip title={!!result ? "🚧 Modificação de resultado não implementada" : ""}>
          <div>
            <Button
              startIcon={<FiSave />}
              color="primary"
              variant="contained"
              type="submit"
              form="resultsForm"
              disabled={!!result}
            >
              Salvar
            </Button>
          </div>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};
