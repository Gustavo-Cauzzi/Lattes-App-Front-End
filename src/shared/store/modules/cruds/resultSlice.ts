import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Result } from "../../../@types/Result";
import { api } from "../../../services/api";
import { RootState } from "../../store";
import { Project } from "../../../@types/Project";

export const findAllResults = createAsyncThunk("app/results/findAllResults", async () => {
    const response = await api.get("/results");
    return response.data;
});

// export const changeResultStatus = createAsyncThunk(
//     "app/result/changeResultStatus",
//     async (id: Result["id"], { getState, rejectWithValue }) => {
//         const result = (getState() as RootState).results.results.find((result) => result.id === id);
//         if (!result) return rejectWithValue("Não foi possível encontrar o projeto");
//         return { ...result,  };
//     }
// );

type SaveResultParams = Omit<Partial<Result>, "persons"> & { persons: { id: number; role: string }[] };
export const saveResult = createAsyncThunk("app/result/saveResult", async (payload: SaveResultParams, { dispatch }) => {
    if (payload.id) {
        // TODO: PUT de result
        // const response = await api.put<Result>(`/results/${payload.id}`, {
        //     description: payload.description,
        //     projectId: payload.project?.id,
        //     // A
        // });
        // dispatch(findAllResults());
        return [];
    }
    const response = await api.post<Result>("/results", {
        updated_at: new Date(),
        ...payload,
    });
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
