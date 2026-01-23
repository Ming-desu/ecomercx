"use client";

import { Slot } from "@radix-ui/react-slot";

export function HistoryBack({
	asChild = false,
	...props
}: Omit<React.ComponentProps<"button">, "onClick"> & {
	asChild?: boolean;
}) {
	const Comp = asChild ? Slot : "button";

	return <Comp onClick={() => window.history.back()} {...props} />;
}
