import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Person } from "../../../@types/Person";
import { api } from "../../../services/api";

export const findAllPersons = createAsyncThunk("app/persons/findAllPersons", async () => {
    const response = await api.get("/persons");
    return response.data;
});

interface AddPersonParams {
    email: string;
    name: string;
    institution: string;
    id?: number;
}

export const savePerson = createAsyncThunk("app/person/savePerson", async (payload: AddPersonParams) => {
    if (payload.id) {
        const response = await api.put<Person>(`/persons/${payload.id}`, payload);
        return response.data;
    }
    const response = await api.post<Person>("/persons", payload);
    return response.data;
});

export const personSlice = createSlice({
    name: "app/persons",
    initialState: {
        persons: [] as Person[],
    },
    reducers: {
        // actionQualquer(state, action: PayloadAction) {},
    },
    extraReducers(builder) {
        builder.addCase(findAllPersons.fulfilled, (state, action) => {
            state.persons = action.payload;
        });
        builder.addCase(savePerson.fulfilled, (state, action) => {
            if (action.meta.arg.id) {
                state.persons = state.persons.map((p) => (p.id === action.meta.arg.id ? action.payload : p));
            } else {
                state.persons.push(action.payload);
            }
        });
        // builder.addMatcher(isAnyOf(,), (state, action) => {});
    },
});

// export const { actionQualquer } = reTbTabelaSlice.actions;
export default personSlice.reducer;
