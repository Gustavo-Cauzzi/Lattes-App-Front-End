import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Result } from "../../shared/@types/Result";
import { Controller, useForm } from "react-hook-form";
import { object, string } from "yup";
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
import { saveResult } from "../../shared/store/modules/cruds/resultSlice";

interface ResultDialogFormProps extends DialogProps {
  result?: Result;
}

const schema = object({
  description: string().required("Informação obrigatória"),
});

interface DefaultValues {
  description: string;
  project: null | Project;
}

const defaultValues: DefaultValues = {
  description: "",
  project: null,
};

export const ResultDialogForm: React.FC<ResultDialogFormProps> = ({ open, onClose, result }) => {
  const dispatch = useDispatch();
  const [people, setPeople] = useState<Person[]>([]);
  const [personToAdd, setPersonToAdd] = useState<Person | null>(null);
  const [isAddPersonMode, setIsAddPersonMode] = useState(false);
  const { data: peopleAutocompleteData } = useQuery("people", async () => {
    const { data } = await api.get<Person[]>("/persons");
    return data ?? [];
  });
  const { data: projectsAutocompleteData } = useQuery("project", async () => {
    const { data } = await api.get<Project[]>("/projects");
    return data;
  });
  const { reset, control, handleSubmit } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!result) {
      reset(defaultValues);
      return;
    }

    reset({
      description: result.description,
      project: result.project,
    });
  }, [result]);

  const handleClose = () => {
    reset(defaultValues);
    onClose && onClose({} as SyntheticEvent, "escapeKeyDown");
  };

  const handleSaveResult = async (data: DefaultValues) => {
    if (!data.project) {
      toast("Informe todos os dados necessários");
      return;
    }
    const toastId = toast.loading("Carregando dados ");
    const dispatchResult = await dispatch(
      saveResult({ persons: [] as Person[], description: data.description, id: result.id, project: data.project })
    );

    if (saveResult.rejected.match(dispatchResult)) {
      toast.error("Não foi possível salvar o registro");
    } else {
      toast.success("Registro salvo com sucesso!");
    }

    toast.dismiss(toastId);
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

  return (
    <Dialog open={open} maxWidth="md" fullWidth onClose={handleClose}>
      <DialogTitle className="text-primary">{result ? "Editar" : "Adicionar"} resultado</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleSaveResult)} id="resultsForm">
          <div className="flex flex-col gap-10">
            <div className="flex justify-between pt-3">
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField {...field} label="Descrição" placeholder="Projeto sobre técnologia" />
                )}
              />

              <Controller
                control={control}
                name="project"
                render={({ field }) => (
                  <Autocomplete
                    options={projectsAutocompleteData ?? []}
                    value={field.value}
                    fullWidth
                    className="max-w-xs"
                    onChange={(_e, newValue) => field.onChange(newValue)}
                    renderInput={(params) => <TextField {...params} label="Projeto" />}
                    getOptionLabel={(project) => project.description ?? "Não identificado"}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
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
      <DialogActions>
        <Button startIcon={<FiX />} color="primary" variant="outlined" onClick={handleClose}>
          Cancelar
        </Button>
        <Button startIcon={<FiSave />} color="primary" variant="contained" type="submit" form="resultsForm">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
