import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Project } from "../../../@types/Project";
import { api } from "../../../services/api";
import { RootState } from "../../store";
import { BaseResultToSave, saveResult } from "./resultSlice";

export const findAllProjects = createAsyncThunk("app/projects/findAllProjects", async () => {
    const response = await api.get("/projects");
    return response.data;
});

export const deleteProjectsById = createAsyncThunk("app/projects/deleteProjectsById", async (ids: Project["id"][]) => {
    // TODO: Delete projects
    console.log("delete project by id, ids: ", ids);
});

export const changeProjectStatus = createAsyncThunk("app/project/changeProjectStatus", async (project: Project) => {
    await api.put<Project>(`/projects/${project.id}`, {
        isFinished: !project.isFinished,
    });
    return { ...project, isFinished: !project.isFinished };
});

type SaveProjectParams = Omit<Partial<Project>, "persons"> & { persons: { id: number; role: string }[] };
export const saveProject = createAsyncThunk(
    "app/project/saveProject",
    async (payload: SaveProjectParams, { dispatch, getState, rejectWithValue }) => {
        let project = null;
        if (payload.id) {
            const response = await api.put<Project>(`/projects/${payload.id}`, {
                description: payload.description,
                sponsor: payload.sponsor,
                persons: payload.persons,
            });
            project = response.data;
        } else {
            const responseProject = await api.post<Project>("/projects", payload);
            project = responseProject.data;
        }

        const projectId = project.id;

        if (payload.persons.length) {
            await api.put(`/projects/persons/${projectId}`, {
                persons: payload.persons,
            });
        }

        const pendingResultsToSave = (getState() as RootState).projects.pendingResultsToSave;
        if (pendingResultsToSave.length) {
            const responses = await Promise.all(
                pendingResultsToSave.map((resultToSave) =>
                    dispatch(saveResult({ ...resultToSave, projectId: projectId }))
                )
            );
            const rejectedResponse = responses.find((thunkResult) => saveResult.rejected.match(thunkResult));
            if (rejectedResponse) return rejectWithValue("Não foi possível salvar um dos resultados");
        }
        dispatch(findAllProjects());
        return project;
    }
);

export const projectSlice = createSlice({
    name: "app/projects",
    initialState: {
        projects: [] as Project[],
        pendingResultsToSave: [] as BaseResultToSave[], // Resultados adicionados a um projeto que possívelmente ainda não foi salvo
    },
    reducers: {
        addResultToSave(state, action: PayloadAction<BaseResultToSave>) {
            state.pendingResultsToSave.push(action.payload);
        },
        resetResulstToSave(state) {
            state.pendingResultsToSave = [];
        },
    },
    extraReducers(builder) {
        builder.addCase(findAllProjects.fulfilled, (state, action) => {
            state.projects = action.payload;
        });
        builder.addCase(changeProjectStatus.fulfilled, (state, action) => {
            state.projects = state.projects.map((project) =>
                project.id === action.meta.arg.id ? action.payload : project
            );
        });
        builder.addCase(saveProject.fulfilled, (state) => {
            if (state.pendingResultsToSave.length) state.pendingResultsToSave = [];
        });
    },
});

export const { addResultToSave, resetResulstToSave } = projectSlice.actions;
export default projectSlice.reducer;
