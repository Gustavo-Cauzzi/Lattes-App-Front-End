import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DataGrid, GridExpandMoreIcon, GridValueGetterParams } from "@mui/x-data-grid";
import { SyntheticEvent, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Person } from "../../shared/@types/Person";
import { savePerson, findAllPersons } from "../../shared/store/modules/cruds/personSlice";
import { AppDispatch, RootState } from "../../shared/store/store";
import { FiPlus, FiPlusSquare } from "react-icons/fi";

export const Pessoas: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isPersonFormDialogOpen, setIsPersonFormDialogOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person>();

  const people = useSelector<RootState, Person[]>((state) => state.persons.persons);

  const [filters, setFilters] = useState({
    email: "",
    name: "",
    insituition: "",
  });

  useEffect(() => {
    const toastId = toast.loading("Buscando pessoas...");
    dispatch(findAllPersons())
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
              <span className="text-xl text-primary">Filtros</span>
            </AccordionSummary>
            <AccordionDetails>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 justify-between gap-4">
                <TextField
                  label="E-mail"
                  value={filters.email}
                  onChange={(e) => updateFilter("email", e.target.value.toLowerCase())}
                />
                <TextField
                  label="Nome"
                  value={filters.name}
                  onChange={(e) => updateFilter("name", e.target.value.toLowerCase())}
                />
                <TextField
                  label="institution"
                  value={filters.insituition}
                  onChange={(e) => updateFilter("insituition", e.target.value.toLowerCase())}
                />
              </div>
            </AccordionDetails>
          </Accordion>

          <DataGrid
            rows={people.filter(
              (row) =>
                row.email?.toLowerCase().includes(filters.email) &&
                row.name?.toLowerCase().includes(filters.name) &&
                row.institution?.toLowerCase().includes(filters.insituition)
            )}
            onRowClick={(p) => setPersonToEdit(p.row)}
            disableRowSelectionOnClick
            columns={[
              {
                field: "email",
                headerName: "E-mail",
                flex: 1,
              },
              {
                field: "name",
                headerName: "Nome",
                flex: 1,
              },
              {
                field: "institution",
                headerName: "Instituição",
                flex: 1,
                valueGetter: (p: GridValueGetterParams<Person, string>) => p.value ?? "Não informado",
              },
            ]}
          />

          <div className="flex justify-end mt-4">
            <Button startIcon={<FiPlus />} variant="contained" onClick={() => setIsPersonFormDialogOpen(true)}>
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      <PersonDialogForm
        open={isPersonFormDialogOpen || !!personToEdit}
        onClose={() => {
          setIsPersonFormDialogOpen(false);
          setPersonToEdit(undefined);
        }}
        person={personToEdit}
      />
    </>
  );
};

interface DefaultValues {
  email: string;
  name: string;
  institution: string;
}

interface PersonDialogFormProps extends DialogProps {
  person?: Person;
}
const defaultValues: DefaultValues = {
  email: "",
  name: "",
  institution: "",
};
const PersonDialogForm: React.FC<PersonDialogFormProps> = ({ person, ...props }) => {
  const dispatch: AppDispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DefaultValues>({
    defaultValues,
  });

  const handleSavePessoa = async (data: DefaultValues) => {
    const toastId = toast.loading("Carregando dados ");
    const result = await dispatch(savePerson({ ...data, id: person?.id }));

    if (savePerson.rejected.match(result)) {
      toast.error("Não foi possível salvar os dados");
    } else {
      toast.success("Dado salvo com sucesso!");
      handleClose();
    }

    toast.dismiss(toastId);
  };

  const handleClose = () => {
    reset(defaultValues);
    props.onClose && props.onClose({} as SyntheticEvent, "backdropClick");
  };

  useEffect(() => {
    if (!person) return;
    setValue("email", person.email);
    setValue("institution", person.institution ?? "");
    setValue("name", person.name ?? "");
  }, [person]);

  return (
    <>
      <Dialog maxWidth="md" fullWidth {...props} onClose={handleClose}>
        <DialogTitle className="text-primary">{person ? "Editar" : "Adicionar"} pessoa</DialogTitle>
        <DialogContent>
          <form
            id="pessoasForm"
            onSubmit={handleSubmit(handleSavePessoa)}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 w-full justify-center gap-4 py-4"
          >
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="E-mail"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message ?? ""}
                />
              )}
            />

            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField {...field} label="Nome" error={!!errors.name} helperText={errors.name?.message ?? ""} />
              )}
            />

            <Controller
              control={control}
              name="institution"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Instituição"
                  error={!!errors.institution}
                  helperText={errors.institution?.message ?? ""}
                />
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button color="primary" variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button color="primary" variant="contained" type="submit" form="pessoasForm">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
