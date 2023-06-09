import { Button } from "@mui/material";
import { ReactNode } from "react";
import { toast } from "react-hot-toast";

type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T;
export const isTruthy = <T,>(value: T): value is Truthy<T> => !!value;

export type IfPresent<T> = T extends undefined ? never : T; // Usar com sabedoria!

export const confirmationToast = (msg: ReactNode) => {
  return new Promise((resolve) => {
    toast(
      (t) => {
        const dismiss = (result: boolean) => {
          toast.dismiss(t.id);
          resolve(result);
        };
        return (
          <div className="flex flex-col gap-2">
            <span className="text-gray-600">{msg}</span>
            <div className="flex justify-end gap-2">
              <Button size="small" onClick={() => dismiss(false)}>
                Cancelar
              </Button>
              <Button size="small" onClick={() => dismiss(true)} variant="contained">
                Confirmar
              </Button>
            </div>
          </div>
        );
      },
      { duration: 10000 }
    );
  });
};
