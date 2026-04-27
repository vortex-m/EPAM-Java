export type LoginRequest = {
	loginId: string;
	password: string;
};

export type RegisterRequest = {
	name: string;
	email: string;
	password: string;
	phone: string;
	address: string;
	role: "USER";
};

export type AuthUser = {
	id: string;
	role: "USER" | "AGENT" | "OFFICER" | "MANAGER" | "ADMIN";
	managerType?: string;
	department?: string;
	designation?: string;
	name?: string;
	email?: string;
	phone?: string;
	status?: string;
	isHome?: boolean;
};

export type AuthPayload = {
	token: string;
	refreshToken?: string | null;
	tokenType?: string;
	role: AuthUser["role"];
	userId: string;
	isHome?: boolean;
	message?: string;
	user?: AuthUser;
};

export type ApiResponse<T> = {
	success?: boolean;
	status?: number;
	message?: string;
	timestamp?: string;
	data: T;
};
