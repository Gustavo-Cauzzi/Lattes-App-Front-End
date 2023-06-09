import { Provider as ReduxProvider } from "react-redux";
import { AppRoutes } from "./routes";
import { ptBR } from "date-fns/locale";
import { store } from "./shared/store/store";
import { Toaster } from "react-hot-toast";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppTheme } from "./routes/layers/AppTheme";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
          <AppTheme>
            <Toaster />

            <AppRoutes />
          </AppTheme>
        </LocalizationProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
};
