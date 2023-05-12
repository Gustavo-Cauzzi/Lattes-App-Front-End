import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    ".MuiOutlinedInput-root": {
                        borderRadius: 15,
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "capitalize",
                },
            },
        },
    },
});
