import { RedirectType, redirect } from "next/navigation";
import { checkPermissions } from "@/lib/authz";
import { auth } from "@/server/auth"; // your NextAuth helper
import type { PermissionName } from "@/server/rbac/permissions";

export async function requirePermission(opts: {
	require: PermissionName | readonly PermissionName[];
	mode?: "all" | "any";
	redirectTo?: string; // where to send 403
}) {
	const session = await auth();

	const result = checkPermissions({
		session,
		require: opts.require,
		mode: opts.mode,
	});

	if (!result.ok) {
		if (result.status === 401) {
			redirect("/auth/login", RedirectType.replace);
		}

		redirect(opts.redirectTo ?? "/403", RedirectType.push);
	}

	return session;
}
