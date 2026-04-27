"use client";

import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { authApi } from "@/api/endpoints/auth.api";
import { getRedirectPathFromAuth } from "@/lib/auth-routing";
import { logout as clearAuth, setCredentials } from "@/store/slices/auth.slice";
import type {
	ApiResponse,
	AuthPayload,
	AuthUser,
	LoginRequest,
	RegisterRequest,
} from "@/types/auth.types";

type AuthError = string | null;

function authDebugLog(label: string, payload: unknown) {
	if (process.env.NODE_ENV === "production") return;
	console.log(`[Auth Debug] ${label}`, payload);
}

function toOptionalString(value: unknown) {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

type AuthEnvelope = {
	data?: Record<string, unknown>;
} & Record<string, unknown>;

function resolveAuthPayload(data: unknown): AuthPayload {
	const root = (data ?? {}) as AuthEnvelope;
	const payload = (root.data ?? root) as Record<string, unknown>;
	const payloadUser = (payload.user ?? {}) as Record<string, unknown>;
	const authorities = Array.isArray(payload.authorities) ? payload.authorities : [];
	authDebugLog("Login response payload", payload);

	const token =
		payload?.token ??
		payload?.accessToken ??
		payload?.jwt ??
		payload?.authToken ??
		null;
	const refreshToken = toOptionalString(payload.refreshToken) ?? null;
	const tokenType = toOptionalString(payload.tokenType);

	const role =
		payload?.role ??
		payload?.userRole ??
		payload?.userType ??
		payloadUser.role ??
		(typeof authorities[0] === "string" ? authorities[0].replace("ROLE_", "") : null) ??
		null;

	const userId =
		payload?.userId ??
		payload?.employeeId ??
		payload?.code ??
		payload?.id ??
		payloadUser.id ??
		payloadUser.userId ??
		null;

	const department =
		payload?.department ??
		payload?.managerDepartment ??
		payloadUser.department ??
		payloadUser.managerDepartment ??
		null;

	// const managerType =
	// 	payload?.managerType ??
	// 	payload?.managerRole ??
	// 	payload?.managerCategory ??
	// 	payload?.user?.managerType ??
	// 	payload?.user?.managerRole ??
	// 	payload?.user?.managerCategory ??
	// 	null;

	const designation =
		payload?.designation ??
		payload?.officerDesignation ??
		payloadUser.designation ??
		payloadUser.officerDesignation ??
		null;

	const userName = payload.name ?? payload.fullName ?? payloadUser.name ?? payloadUser.fullName;
	const userEmail = payload.email ?? payloadUser.email;
	const userPhone = payload.phone ?? payloadUser.phone;
	const userStatus = payload.status ?? payloadUser.status;
	const isHome = payload.isHome ?? payloadUser.isHome;

	const user: AuthUser | undefined =
		role && userId
			? {
					id: String(payloadUser.id ?? userId),
					role: String(role).toUpperCase() as AuthUser["role"],
					// managerType: managerType ? String(managerType) : undefined,
					department: department ? String(department) : undefined,
					designation: designation ? String(designation) : undefined,
					name: toOptionalString(userName),
					email: toOptionalString(userEmail),
					phone: userPhone ? String(userPhone) : undefined,
					status: userStatus ? String(userStatus) : undefined,
					isHome: typeof isHome === "boolean" ? isHome : undefined,
			  }
			: undefined;

	authDebugLog("Resolved user fields", {
		role,
		userId,
		userName,
		userEmail,
		department,
		// managerType,
		designation,
		isHome,
	});

	if (!token || !role || !userId) {
		authDebugLog("Invalid auth payload", {
			tokenPresent: Boolean(token),
			rolePresent: Boolean(role),
			userIdPresent: Boolean(userId),
		});
		throw new Error("Invalid authentication response from server.");
	}

	const resolvedPayload = {
		token: String(token),
		refreshToken,
		tokenType,
		role: String(role).toUpperCase() as AuthUser["role"],
		userId: String(userId),
		isHome: typeof isHome === "boolean" ? isHome : undefined,
		message: payload.message ? String(payload.message) : undefined,
		user,
	};

	authDebugLog("Resolved auth payload", {
		role: resolvedPayload.role,
		userId: resolvedPayload.userId,
		isHome: resolvedPayload.isHome,
		tokenType: resolvedPayload.tokenType,
		user: resolvedPayload.user,
		tokenPreview: `${String(token).slice(0, 10)}...`,
	});

	return resolvedPayload;
}

function parseApiError(error: unknown): string {
	const fallback = "Something went wrong. Please try again.";

	if (typeof error !== "object" || error === null) return fallback;

	const err = error as {
		response?: { data?: { message?: string } };
		message?: string;
	};

	return err.response?.data?.message ?? err.message ?? fallback;
}

export function useAuth() {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<AuthError>(null);

	const login = useCallback(
		async (payload: LoginRequest) => {
			setLoading(true);
			setError(null);

			try {
				const response = await authApi.login(payload);
				authDebugLog("Raw login API response", response.data);
				const authData = resolveAuthPayload(response.data);
				dispatch(setCredentials(authData));
				authDebugLog("Dispatched auth state", {
					role: authData.role,
					userId: authData.userId,
					user: authData.user,
				});

				if (typeof document !== "undefined") {
					document.cookie = `token=${authData.token}; path=/; SameSite=Lax`;
					document.cookie = `role=${authData.role}; path=/; SameSite=Lax`;

					if (authData.role === "MANAGER") {
						window.localStorage.setItem("managerToken", authData.token);
						window.localStorage.setItem("managerId", authData.userId);
						if (authData.user?.name) {
							window.localStorage.setItem("managerName", authData.user.name);
						}
						if (authData.user?.department) {
							window.localStorage.setItem("managerDepartment", authData.user.department);
						}
						window.localStorage.setItem(
							"managerLandingPath",
							getRedirectPathFromAuth({ role: authData.role, user: authData.user }),
						);
					}
				}

				return authData;
			} catch (err) {
				const message = parseApiError(err);
				setError(message);
				throw new Error(message);
			} finally {
				setLoading(false);
			}
		},
		[dispatch]
	);

	const register = useCallback(async (payload: RegisterRequest) => {
		setLoading(true);
		setError(null);

		try {
			const response = await authApi.register(payload);
			const wrapped = response.data as ApiResponse<unknown>;
			return wrapped.data;
		} catch (err) {
			const message = parseApiError(err);
			setError(message);
			throw new Error(message);
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(() => {
		dispatch(clearAuth());

		if (typeof document !== "undefined") {
			document.cookie =
				"token=; path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
			document.cookie =
				"role=; path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
			window.localStorage.removeItem("managerToken");
			window.localStorage.removeItem("managerId");
			window.localStorage.removeItem("managerName");
			window.localStorage.removeItem("managerDepartment");
			window.localStorage.removeItem("managerLandingPath");
		}
	}, [dispatch]);

	return {
		loading,
		error,
		login,
		register,
		logout,
	};
}
