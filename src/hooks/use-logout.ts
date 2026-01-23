import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCallback } from "react";

export type UseLogoutParams = {
	redirectTo: string;
	redirect?: boolean;
};

export function useLogout({ redirectTo, redirect }: UseLogoutParams) {
	const router = useRouter();

	const logout = useCallback(async () => {
		if (redirect) {
			signOut({ redirectTo, redirect });
			return;
		}

		const res = await signOut({ redirectTo, redirect });

		router.push(res.url ?? redirectTo);
		router.refresh();
	}, [redirectTo, redirect, router]);

	return logout;
}
