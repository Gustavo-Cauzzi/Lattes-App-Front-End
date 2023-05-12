import { IconButton, darken, lighten, useTheme } from "@mui/material";
import { FiPower } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../shared/store/modules/auth/authSlice";
import { AppDispatch, RootState } from "../../shared/store/store";

interface GradientGeneratorConfig {
  lightCoefficient?: number;
  darkCoefficient?: number;
}

export const generateGradient = (
  color: string,
  { darkCoefficient, lightCoefficient } = {} as GradientGeneratorConfig
) =>
  `linear-gradient(109.6deg, ${lighten(color, lightCoefficient ?? 0.1)} 11.2%, ${darken(
    color,
    darkCoefficient ?? 0.2
  )} 91.1%)`;

export const Header = () => {
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();

  const name = useSelector<RootState, string | undefined>((state) => state.auth.user?.name);

  const handleLogout = () => {
    dispatch(logOut());
  };

  return (
    <div
      className="sticky w-full flex justify-between p-6 items-center shadow-xl text-white"
      style={{
        background: generateGradient(theme.palette.primary.main),
      }}
    >
      <strong className="text-2xl text-white">Lattes Ucs</strong>

      <div className="flex gap-2">
        {name ? (
          <>
            <div className="flex gap-2 items-center">
              {/* <FiUser size={25} /> */}
              <span>{name}</span>
            </div>
          </>
        ) : (
          <></>
        )}

        <IconButton onClick={handleLogout}>
          <FiPower size={25} color="#fff" />
        </IconButton>
      </div>
    </div>
  );
};
