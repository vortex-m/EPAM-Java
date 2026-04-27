import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthPayload, AuthUser } from "@/types/auth.types";

const AUTH_STORAGE_KEY = "lms_auth";

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  role: AuthUser["role"] | null;
  userId: string | null;
  isHome: boolean | null;
  message: string | null;
  user: AuthUser | null;
};

const defaultState: AuthState = {
  token: null,
  refreshToken: null,
  tokenType: null,
  role: null,
  userId: null,
  isHome: null,
  message: null,
  user: null,
};

function readPersistedAuth(): AuthState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      token: parsed.token ?? null,
      refreshToken: parsed.refreshToken ?? null,
      tokenType: parsed.tokenType ?? null,
      role: parsed.role ?? null,
      userId: parsed.userId ?? null,
      isHome: typeof parsed.isHome === "boolean" ? parsed.isHome : null,
      message: parsed.message ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    return defaultState;
  }
}

function persistAuth(state: AuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

const authSlice = createSlice({
  name: "auth",
  // Lazy initializer — runs only on the client, avoiding SSR hydration mismatch
  initialState: (): AuthState => readPersistedAuth(),
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthPayload>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.tokenType = action.payload.tokenType ?? null;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      state.isHome =
        typeof action.payload.isHome === "boolean" ? action.payload.isHome : null;
      state.message = action.payload.message ?? null;
      state.user = action.payload.user ?? null;
      persistAuth(state);
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.tokenType = null;
      state.role = null;
      state.userId = null;
      state.isHome = null;
      state.message = null;
      state.user = null;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    },
    setIsHome: (state, action: PayloadAction<boolean>) => {
      state.isHome = action.payload;
      if (state.user) {
        state.user.isHome = action.payload;
      }
      persistAuth(state);
    },
  },
});

export const { setCredentials, logout, setIsHome } = authSlice.actions;
export default authSlice.reducer;