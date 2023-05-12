import { PropsWithChildren } from "react";
import { darken, ThemeProvider, StyledEngineProvider, useTheme } from "@mui/material";
import { theme } from "../../Theme";

const getHexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  const r = result && parseInt(result[1], 16);
  const g = result && parseInt(result[2], 16);
  const b = result && parseInt(result[3], 16);

  return [r, g, b];
};

const getRgbVariablesFromString = (rgb: string) =>
  [...rgb.matchAll(/\d+/g)].map((regexResult) => Number(regexResult[0]));

export const AppTheme: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <TailwindColorChanger />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
};

const TailwindColorChanger = () => {
  const theme = useTheme();
  const mainColor = theme.palette.primary.main;
  const [r, g, b] = getHexToRgb(mainColor);
  const [rd, gd, bd] = getRgbVariablesFromString(darken(mainColor, 0.3));

  return <style>:root {`{--color-primary: ${r}, ${g}, ${b}; --color-primary-dark: ${rd}, ${gd}, ${bd};}`}</style>;
};
