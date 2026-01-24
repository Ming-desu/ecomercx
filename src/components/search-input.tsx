"use client";

import { Loader2, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

export function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
	const [text, setText] = useState(defaultValue);
	const [isPending, startTransition] = useTransition(); // 👈 This is the secret to smoothness
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// 1. Set a debounce timer
		const timer = setTimeout(() => {
			const params = new URLSearchParams(searchParams);
			if (text) {
				params.set("q", text);
			} else {
				params.delete("q");
			}

			// 2. Wrap the navigation in a transition
			// This tells React the URL update is a lower priority than the typing animation
			startTransition(() => {
				router.replace(`${pathname}?${params.toString()}`, { scroll: false });
			});
		}, 300);

		return () => clearTimeout(timer);
	}, [text, pathname, router, searchParams]);

	return (
		<div className="group relative w-full md:w-96">
			<div className="absolute top-1/2 left-3 -translate-y-1/2">
				{isPending ? (
					<Loader2 className="h-4 w-4 animate-spin text-blue-600" />
				) : (
					<Search className="h-4 w-4 text-muted-foreground group-focus-within:text-blue-600" />
				)}
			</div>
			<Input
				className="border-none bg-transparent pl-10 text-base focus-visible:ring-0"
				onChange={(e) => setText(e.target.value)}
				placeholder="Search items..."
				value={text}
			/>
		</div>
	);
}
