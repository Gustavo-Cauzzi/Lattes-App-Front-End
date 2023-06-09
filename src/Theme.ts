import { createTheme } from "@mui/material";
import { MUI_DATAGRID_PT_BR } from "./shared/locale/MuiDatagrid";
import type {} from "@mui/x-data-grid/themeAugmentation";

const hoverOpacity = 0.04;
const mainColor = "#1976d2";

export const theme = createTheme({
    palette: {
        primary: {
            main: mainColor,
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
            defaultProps: {
                variant: "outlined",
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "capitalize",
                    borderRadius: 10,
                },
            },
        },
        MuiTooltip: {
            defaultProps: {
                placement: "top",
                arrow: true,
            },
        },
        MuiAccordion: {
            styleOverrides: {
                gutters: {
                    borderRadius: 20,
                    borderTopLeftRadius: "20px !important",
                    borderTopRightRadius: "20px !important",
                },
            },
        },
        MuiAutocomplete: {
            defaultProps: {
                noOptionsText: "Sem opções",
            },
        },
        MuiDataGrid: {
            defaultProps: {
                pageSizeOptions: [10, 25, 50, 100],
                autoHeight: true,
                disableRowSelectionOnClick: true,
                localeText: MUI_DATAGRID_PT_BR,
                initialState: {
                    columns: {
                        columnVisibilityModel: {
                            id: false,
                        },
                    },
                },
            },
            styleOverrides: {
                root: {
                    border: 0,
                    "& .MuiCheckbox-root": {
                        padding: "3px 9px",
                    },
                    "& .MuiDataGrid-row .MuiTextField-root": {
                        "& .MuiFilledInput-root": {
                            paddingTop: "8px",
                            paddingBottom: "8px",
                        },

                        "& *": {
                            background: "transparent",
                        },
                    },

                    "& .MuiDataGrid-renderingZone, .MuiDataGrid-virtualScrollerContent": {
                        "& .MuiDataGrid-row": {
                            border: 0,
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            "&:hover": {
                                backgroundColor: "#E0E0E0",
                            },
                        },
                        "& .MuiDataGrid-row:first-of-type": {
                            borderTopLeftRadius: "3px",
                            borderBottomLeftRadius: "3px",
                            overflow: "hidden",
                        },
                        "& .MuiDataGrid-row:nth-of-type(odd)": {
                            backgroundColor: `rgba(0, 0, 0, ${hoverOpacity})`,

                            "&:hover": {
                                backgroundColor: "#E0E0E0",
                            },

                            "&.Mui-selected": {
                                backgroundColor: `rgba(12, 6, 63, 0.1)`,

                                "&:hover": {
                                    backgroundColor: `rgba(12, 6, 63, 0.12);`,
                                },
                            },
                        },
                        "& .MuiDataGrid-row:last-of-type": {
                            borderTopRightRadius: "3px",
                            borderBottomRightRadius: "3px",
                            overflow: "hidden",
                        },
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: `2px solid ${mainColor}`,
                        borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    },
                },
            },
        },
    },
});
