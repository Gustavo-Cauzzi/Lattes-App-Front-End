import { IconButton, darken, lighten, useTheme } from "@mui/material";
import { FiBook, FiMenu, FiPower } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logOut } from "../../shared/store/modules/auth/authSlice";
import { AppDispatch, RootState } from "../../shared/store/store";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Logo } from "./Logo";

interface GradientGeneratorConfig {
  lightCoefficient?: number;
  darkCoefficient?: number;
  degrees?: number;
}

export const generateGradient = (
  color: string,
  { darkCoefficient, lightCoefficient, degrees } = {} as GradientGeneratorConfig
) =>
  `linear-gradient(${degrees ?? "109.6"}deg, ${lighten(color, lightCoefficient ?? 0.1)} 11.2%, ${darken(
    color,
    darkCoefficient ?? 0.2
  )} 91.1%)`;

export const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const name = useSelector<RootState, string | undefined>((state) => state.auth.user?.name);

  const handleLogout = () => {
    dispatch(logOut());
  };

  const handleOpenSidebar = () => {
    setIsMenuOpen(true);
  };

  return (
    <>
      <div
        className="z-[1000] fixed w-full flex justify-between p-6 pl-4 items-center shadow-xl text-white h-[5.62rem]"
        style={{
          background: generateGradient(theme.palette.primary.main),
        }}
      >
        <div className="flex gap-3 items-center">
          <IconButton onClick={handleOpenSidebar}>
            <FiMenu size={25} color="#fff" />
          </IconButton>
          <Logo onClick={() => navigate("/")} />
        </div>

        <div className="flex gap-2 items-center">
          {name && <span>{name}</span>}

          <IconButton onClick={handleLogout}>
            <FiPower size={25} color="#fff" />
          </IconButton>
        </div>
      </div>
      <div className="h-[5.62rem] header-overlay"></div>

      <Sidebar open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
