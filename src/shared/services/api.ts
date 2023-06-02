import axios, { AxiosError } from "axios";

export const api = axios.create({
    baseURL: "http://localhost:4000",
});

api.interceptors.response.use(
    (response) => {
        response.data = castDatesInObj(response.data);
        return response;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

const isObject = (value: any) => typeof value === "object" && value !== null && !Array.isArray(value);
const datePrefixes = ["dta", "dth"];
const castDatesInObj = (obj: unknown): unknown => {
    if (obj === null) return obj;

    if (obj instanceof Array) {
        return obj.map((v) => (isObject(v) ? castDatesInObj(v) : v));
    }

    if (isObject(obj)) {
        return Object.fromEntries(
            Object.entries(obj as Record<string, unknown>).map(([key, value]) => {
                if (value === null) {
                    return [key, value];
                }
                if (
                    typeof value === "string" &&
                    value.match(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/g)
                ) {
                    return [key, new Date(value as string)];
                }
                return [key, castDatesInObj(value)];
            })
        );
    }

    return obj;
};
