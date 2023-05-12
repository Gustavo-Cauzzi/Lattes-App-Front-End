import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "../pages/Home";
import { Auth } from "./layers/Auth";
import { BaseLayout } from "./layouts/BaseLayout";
import { AppTheme } from "./layers/AppTheme";

export const AppRoutes = () => (
  <AppTheme>
    <BrowserRouter>
      <Auth>
        <Routes>
          <Route path="/" element={<BaseLayout />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </Auth>
    </BrowserRouter>
  </AppTheme>
);
