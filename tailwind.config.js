const { screens } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.tsx"],
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--color-primary))",
                "primary-dark": "rgb(var(--color-primary-dark))",
                error: "#D32F2F",
                warning: "#FFCC00",
            },
        },
        screens: {
            "2xs": "300px",
            xs: "475px",
            xssm: "621px",
            smmd: "678px",
            mdlg: "896px",
            lgxl: "1152px",
            "3xl": "1600px",
            ...screens,
        },
    },
    plugins: [],
};
