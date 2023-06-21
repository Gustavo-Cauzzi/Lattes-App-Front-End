import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "../pages/Home";
import { Pessoas } from "../pages/People";
import { Projetos } from "../pages/Projects";
import { Results } from "../pages/Results";
import { Auth } from "./layers/Auth";
import { BaseLayout } from "./layouts/BaseLayout";
import { NotFoundRoute } from "./layouts/NotFoundRoute";

export const AppRoutes = () => (
  <BrowserRouter>
    <Auth>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/person" element={<Pessoas />} />
          <Route path="/projects" element={<Projetos />} />
          <Route path="/results" element={<Results />} />
          <Route path="/*" element={<NotFoundRoute />} />
        </Route>
      </Routes>
    </Auth>
  </BrowserRouter>
);
