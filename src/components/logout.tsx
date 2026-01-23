"use client";

import { Slot } from "@radix-ui/react-slot";
import { type UseLogoutParams, useLogout } from "@/hooks/use-logout";

export function Logout({
	asChild = false,
	redirect = false,
	redirectTo = "/auth/login",
	...props
}: Omit<React.ComponentProps<"button">, "onClick"> &
	UseLogoutParams & {
		asChild?: boolean;
	}) {
	const logout = useLogout({ redirectTo, redirect });
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			onClick={async (e) => {
				e.currentTarget.disabled = true;
				await logout();
			}}
			{...props}
		/>
	);
}
