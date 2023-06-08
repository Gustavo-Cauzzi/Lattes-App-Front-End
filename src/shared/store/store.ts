import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./modules/auth/authSlice";
import personSlice from "./modules/cruds/personSlice";
import projectSlice from "./modules/cruds/projectsSlice";
import resultSlice from "./modules/cruds/resultSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        persons: personSlice,
        projects: projectSlice,
        results: resultSlice,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
