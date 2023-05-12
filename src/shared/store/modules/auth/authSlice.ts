import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "../../../@types/User";

const PREFIX = "app/auth";

export const getCurrentLoggedUser = createAsyncThunk<User | null, void>(`${PREFIX}/getCurrentLoggedUser`, () => {
    const userJson = localStorage.getItem("user");
    return userJson ? (JSON.parse(userJson) as User) : null;
});

export const logIn = createAsyncThunk(`${PREFIX}/logIn`, async (payload: User) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay fake
    localStorage.setItem("user", JSON.stringify(payload));
    return payload;
});

export const logOut = createAsyncThunk<void, void>(`${PREFIX}/logOut`, async () => {
    localStorage.removeItem("user");
});

interface InitialState {
    isAuthenticated: boolean;
    user?: User;
}

export const authSlice = createSlice({
    name: PREFIX,
    initialState: {
        isAuthenticated: false,
        user: undefined,
    } as InitialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(getCurrentLoggedUser.fulfilled, (state, action) => {
            state.isAuthenticated = !!action.payload;
            state.user = action.payload ?? undefined;
        });
        builder.addCase(logIn.fulfilled, (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload;
        });
        builder.addCase(logOut.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.user = undefined;
        });
    },
});

export default authSlice.reducer;
