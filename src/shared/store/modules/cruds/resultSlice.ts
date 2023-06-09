import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Result } from "../../../@types/Result";
import { api } from "../../../services/api";
import { Project } from "../../../@types/Project";

export const findAllResults = createAsyncThunk("app/results/findAllResults", async () => {
    const response = await api.get("/results");
    return response.data;
});

export const deleteResultsById = createAsyncThunk("app/results/deleteResultsById", async (ids: Result["id"][]) => {
    // TODO: Deletar os resutlados
    console.log("deleteResultsById: ", ids);
});

export type BaseResultToSave = Omit<Result, "id" | "project"> & { id?: Result["id"]; projectId: Project["id"] };
export const saveResult = createAsyncThunk("app/result/saveResult", async (payload: BaseResultToSave, { dispatch }) => {
    if (payload.id) {
        // TODO: PUT de result quando for feito
        return [];
    }
    const response = await api.post<Result>("/results", {
        description: payload.description,
        projectId: payload.projectId,
        members: payload.persons?.map((person) => person.id) ?? [],
    });
    dispatch(findAllResults());
    return response.data;
});

export const resultSlice = createSlice({
    name: "app/results",
    initialState: {
        results: [] as Result[],
    },
    reducers: {
        // actionQualquer(state, action: PayloadAction) {},
    },
    extraReducers(builder) {
        builder.addCase(findAllResults.fulfilled, (state, action) => {
            state.results = action.payload;
        });
    },
});

// export const { actionQualquer } = reTbTabelaSlice.actions;
export default resultSlice.reducer;
