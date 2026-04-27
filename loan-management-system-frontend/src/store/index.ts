import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/auth.slice";
import loansReducer from "@/store/slices/loans.slice";
import { setupInterceptors } from "@/api/interceptors";

const foundationReducer = (state = {}) => state;

export const store = configureStore({
	reducer: {
		auth: authReducer,
		loans: loansReducer,
		foundation: foundationReducer,
	},
});

setupInterceptors(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
