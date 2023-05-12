import { Provider as ReduxProvider } from "react-redux";
import { AppRoutes } from "./routes";
import { store } from "./shared/store/store";
import { Toaster } from "react-hot-toast";

export const App = () => {
  return (
    <ReduxProvider store={store}>
      <Toaster />
      <AppRoutes />
    </ReduxProvider>
  );
};
