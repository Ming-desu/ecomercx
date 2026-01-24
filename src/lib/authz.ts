import type { Session } from "next-auth";
import type { PermissionName } from "@/server/rbac/permissions";

export type AuthzResult =
	| { ok: true }
	| { ok: false; status: 401 | 403; reason: "UNAUTHENTICATED" | "FORBIDDEN" };

export function checkPermissions(opts: {
	session: Session | null | undefined;
	require: PermissionName | readonly PermissionName[];
	mode?: "all" | "any";
}): AuthzResult {
	const { session, require, mode = "all" } = opts;

	if (!session?.user) {
		return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
	}

	const perms = session.user.permissions ?? [];
	const requiredList = Array.isArray(require) ? require : [require];

	const hasAccess =
		mode === "all"
			? requiredList.every((p) => perms.includes(p))
			: requiredList.some((p) => perms.includes(p));

	if (!hasAccess) {
		return { ok: false, status: 403, reason: "FORBIDDEN" };
	}

	return { ok: true };
}
