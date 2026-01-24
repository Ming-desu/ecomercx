"use client";

import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CategoryFilter({
	categories,
	currentCategory,
}: {
	categories: string[];
	currentCategory?: string;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const setCategory = (cat: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (cat === "all") {
			params.delete("category");
		} else {
			params.set("category", cat);
		}
		router.push(`?${params.toString()}`);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="capitalize" size="sm" variant="outline">
					<Filter className="mr-2 h-4 w-4" />
					{currentCategory || "All Categories"}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{categories.map((cat) => (
					<DropdownMenuItem
						className="capitalize"
						key={cat}
						onClick={() => setCategory(cat)}
					>
						{cat}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
