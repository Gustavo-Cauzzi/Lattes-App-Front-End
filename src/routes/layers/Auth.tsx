import { PropsWithChildren, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { FakeLogin } from "../../pages/FakeLogin";
import { AppDispatch, RootState } from "../../shared/store/store";
import { getCurrentLoggedUser } from "../../shared/store/modules/auth/authSlice";
import { CircularProgress } from "@mui/material";

export const Auth: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch: AppDispatch = useDispatch();
  const isAuthenticated = useSelector<RootState, boolean>((state) => state.auth.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(getCurrentLoggedUser()).then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <CircularProgress size={70} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<FakeLogin />} />
      </Routes>
    );
  }
  return <>{children}</>;
};
