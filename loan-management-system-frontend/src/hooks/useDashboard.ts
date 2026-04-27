import { useQuery } from "@tanstack/react-query";

import { userApi } from "@/api/endpoints/user.api";
import type { ApiEnvelope, UserDashboardData } from "@/types/api.types";

export function useUserDashboard() {
	return useQuery({
		queryKey: ["user", "dashboard"],
		queryFn: async () => {
			const response = await userApi.getDashboard();
			const payload = response.data as ApiEnvelope<UserDashboardData>;
			return payload.data;
		},
	});
}
