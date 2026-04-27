import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type LoansUiState = {
	selectedLoanApplicationId: string | null;
	selectedLoanId: string | null;
	selectedEmiScheduleId: string | null;
};

const initialState: LoansUiState = {
	selectedLoanApplicationId: null,
	selectedLoanId: null,
	selectedEmiScheduleId: null,
};

const loansSlice = createSlice({
	name: "loans",
	initialState,
	reducers: {
		setSelectedLoanApplicationId: (state, action: PayloadAction<string | null>) => {
			state.selectedLoanApplicationId = action.payload;
		},
		setSelectedLoanId: (state, action: PayloadAction<string | null>) => {
			state.selectedLoanId = action.payload;
		},
		setSelectedEmiScheduleId: (state, action: PayloadAction<string | null>) => {
			state.selectedEmiScheduleId = action.payload;
		},
		clearLoanSelection: (state) => {
			state.selectedLoanApplicationId = null;
			state.selectedLoanId = null;
			state.selectedEmiScheduleId = null;
		},
	},
});

export const {
	setSelectedLoanApplicationId,
	setSelectedLoanId,
	setSelectedEmiScheduleId,
	clearLoanSelection,
} = loansSlice.actions;

export default loansSlice.reducer;
