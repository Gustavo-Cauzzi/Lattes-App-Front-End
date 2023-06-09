import { generateGradient } from "../../routes/layouts/Header";
import { Button, useTheme } from "@mui/material";
import { DocSvg } from "./DocSvg";
import { TextField } from "@mui/material";
import { AppDispatch } from "../../shared/store/store";
import { useDispatch } from "react-redux";
import { logIn } from "../../shared/store/modules/auth/authSlice";
import { v4 } from "uuid";
import { SyntheticEvent, useState } from "react";
import { toast } from "react-hot-toast";

export const FakeLogin: React.FC = () => {
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();
  const [name, setName] = useState("");

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Entrando...");
    await dispatch(logIn({ id: v4(), name }));
    toast.dismiss(toastId);
  };

  return (
    <main
      className="w-screen h-screen text-white flex justify-between items-center p-16 px-20 xl:px-36 overflow-hidden flex-col lg:flex-row gap-5"
      style={{
        background: generateGradient(theme.palette.primary.main, {
          darkCoefficient: 0.3,
          lightCoefficient: 0.2,
        }),
      }}
    >
      <DocSvg className="max-w-lg flex" />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl flex p-8 gap-5 flex-col items-center min-w-[300px]"
      >
        <span className="text-4xl text-primary">
          <strong>Lattes</strong>Ucs
        </span>

        <TextField
          label="Nome"
          helperText="Informe o seu nome para continuar"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button variant="contained" type="submit" className="text-xl">
          Entrar
        </Button>
      </form>
    </main>
  );
};
