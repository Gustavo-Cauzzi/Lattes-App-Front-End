import { IconButton, darken, lighten, useTheme } from "@mui/material";
import { FiBook, FiPower } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logOut } from "../../shared/store/modules/auth/authSlice";
import { AppDispatch, RootState } from "../../shared/store/store";

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

  const name = useSelector<RootState, string | undefined>((state) => state.auth.user?.name);

  const handleLogout = () => {
    dispatch(logOut());
  };

  return (
    <>
      <div
        className="z-[1000] fixed w-full flex justify-between p-6 items-center shadow-xl text-white h-[5.62rem]"
        style={{
          background: generateGradient(theme.palette.primary.main),
        }}
      >
        <strong className="flex gap-2 items-center text-2xl text-white cursor-pointer" onClick={() => navigate("/")}>
          <FiBook size={29} /> Lattes Ucs
        </strong>

        <div className="flex gap-2 items-center">
          {name && <span>{name}</span>}

          <IconButton onClick={handleLogout}>
            <FiPower size={25} color="#fff" />
          </IconButton>
        </div>
      </div>
      <div className="h-[5.62rem] header-overlay"></div>
    </>
  );
};
