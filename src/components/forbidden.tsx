import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { version } from "package.json";
import React from "react";
import { HistoryBack } from "@/components/history-back";
import { Logout } from "@/components/logout";
import { Button } from "@/components/ui/button";

export function Forbidden() {
	const pathname = usePathname();

	const fromAdmin = pathname.startsWith("/admin");

	const referenceId = React.useMemo(
		() => Math.random().toString(36).substring(2, 9).toUpperCase(),
		[],
	);

	return (
		<div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 py-12 selection:bg-slate-900 selection:text-white">
			{/* Background Decorative "403" Overlay */}
			<div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden">
				<h1 className="fade-in zoom-in animate-in font-black text-[35vw] text-slate-100/50 leading-none tracking-tighter duration-1000">
					403
				</h1>
			</div>

			<div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
				{/* Status Badge */}
				<div className="slide-in-from-top-4 mb-8 animate-in duration-700">
					<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 font-semibold text-slate-900 text-xs shadow-sm ring-1 ring-slate-900/5 backdrop-blur-sm">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
							<span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
						</span>
						Security Access Restricted
					</div>
				</div>

				{/* Header Section */}
				<div className="fade-in slide-in-from-bottom-4 mb-10 animate-in space-y-4 text-center delay-150 duration-700">
					<h2 className="whitespace-nowrap font-black text-4xl text-slate-950 leading-tight tracking-tighter md:text-7xl lg:text-8xl">
						Access Denied
					</h2>
					{/* Increased width to ensure at least two lines of text */}
					<p className="mx-auto max-w-2xl px-4 text-base text-slate-500 leading-relaxed md:text-xl">
						You don't have the required administrative clearances to view this
						page. Please contact your system administrator or switch accounts.
					</p>
				</div>

				{/* Actions - Adjusted sizes to differentiate prominence */}
				<div className="fade-in slide-in-from-bottom-4 flex w-full animate-in flex-col items-center gap-8 delay-300 duration-700">
					<div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
						<Button asChild size="lg">
							<Link href={fromAdmin ? "/admin" : "/"}>
								<HomeIcon />
								Back to Home
							</Link>
						</Button>

						<HistoryBack asChild>
							<Button size="lg" variant="outline">
								Go Back
							</Button>
						</HistoryBack>
					</div>

					<Logout
						className="cursor-pointer font-semibold text-muted-foreground text-sm underline decoration-slate-200 underline-offset-8 transition-colors"
						redirectTo={fromAdmin ? "/admin/auth/login" : "/auth/login"}
					>
						Sign out of account
					</Logout>
				</div>

				{/* Technical Audit Section - Center Aligned */}
				<div className="fade-in mt-24 w-full max-w-md animate-in px-4 delay-500 duration-1000">
					<div className="flex flex-col items-center space-y-6">
						<div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent"></div>

						<div className="flex w-full flex-col items-center justify-center gap-y-4 text-center sm:flex-row sm:gap-x-16">
							<div className="space-y-1">
								<p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">
									Incident Reference
								</p>
								<p className="select-all font-bold font-mono text-slate-700 text-xs">
									{referenceId}
								</p>
							</div>
							<div className="space-y-1">
								<p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">
									Environment
								</p>
								<p className="font-semibold text-slate-700 text-xs uppercase">
									{process.env.NODE_ENV} v{version}
								</p>
							</div>
						</div>

						<p className="text-center font-medium text-[10px] text-slate-400 italic">
							All unauthorized access attempts are logged for security auditing.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
