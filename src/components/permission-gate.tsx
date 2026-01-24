"use client";

import { useSession } from "next-auth/react";
import { checkPermissions } from "@/lib/authz";
import type { PermissionName } from "@/server/rbac/permissions";
import { Forbidden } from "./forbidden";

export function PermissionGate({
	require,
	mode = "all",
	unauthenticatedFallback = null,
	forbiddenFallback = <Forbidden />,
	loadingFallback = null,
	children,
}: {
	require: PermissionName | readonly PermissionName[];
	mode?: "all" | "any";
	loadingFallback?: React.ReactNode;
	unauthenticatedFallback?: React.ReactNode;
	forbiddenFallback?: React.ReactNode;
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();

	if (status === "loading") return <>{loadingFallback}</>;

	const result = checkPermissions({ session, require, mode });

	if (!result.ok) {
		if (result.status === 401) return <>{unauthenticatedFallback}</>;
		return <>{forbiddenFallback}</>;
	}

	return <>{children}</>;
}
