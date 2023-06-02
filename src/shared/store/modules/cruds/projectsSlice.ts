import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Project } from "../../../@types/Project";
import { api } from "../../../services/api";
import { RootState } from "../../store";

export const findAllProjects = createAsyncThunk("app/projects/findAllProjects", async () => {
    const response = await api.get("/projects");
    return response.data;
});

export const changeProjectStatus = createAsyncThunk(
    "app/project/changeProjectStatus",
    async (id: Project["id"], { getState, rejectWithValue }) => {
        const project = (getState() as RootState).projects.projects.find((project) => project.id === id);
        if (!project) return rejectWithValue("Não foi possível encontrar o projeto");
        return { ...project, isFinished: !project.isFinished };
    }
);

type SaveProjectParams = Omit<Partial<Project>, "persons"> & { persons: { id: number; role: string }[] };
export const saveProject = createAsyncThunk(
    "app/project/saveProject",
    async (payload: SaveProjectParams, { dispatch }) => {
        if (payload.id) {
            const response = await api.put<Project>(`/projects/${payload.id}`, {
                description: payload.description,
                sponsor: payload.sponsor,
                persons: payload.persons,
            });
            dispatch(findAllProjects());
            return response.data;
        }
        const response = await api.post<Project>("/projects", {
            id: payload.id,
            updated_at: new Date(),
            ...payload,
            ...(payload.id ? { created_at: new Date() } : {}),
        });
        return response.data;
    }
);

export const projectSlice = createSlice({
    name: "app/projects",
    initialState: {
        projects: [] as Project[],
    },
    reducers: {
        // actionQualquer(state, action: PayloadAction) {},
    },
    extraReducers(builder) {
        builder.addCase(findAllProjects.fulfilled, (state, action) => {
            state.projects = action.payload;
        });
        builder.addCase(changeProjectStatus.fulfilled, (state, action) => {
            state.projects = state.projects.map((project) =>
                project.id === action.meta.arg ? action.payload : project
            );
        });
        builder.addCase(saveProject.fulfilled, (state, action) => {
            if (action.meta.arg.id) {
                state.projects = state.projects.map((p) => (p.id === action.meta.arg.id ? action.payload : p));
            } else {
                state.projects.push(action.payload);
            }
        });
    },
});

// export const { actionQualquer } = reTbTabelaSlice.actions;
export default projectSlice.reducer;
