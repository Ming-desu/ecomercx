import { requirePermission } from "@/server/auth/require-permission";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requirePermission({ require: "admin:access" });

	return children;
}
