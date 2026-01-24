"use client";

import { AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteProductDialog({ item }: { item: any }) {
	const [open, setOpen] = useState(false);

	async function handleDelete() {
		await deleteProduct(item.id.toString());
		setOpen(false); // ✅ Auto-close
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button
					className="rounded-full text-red-600 hover:bg-red-100"
					size="icon"
					variant="ghost"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-red-600">
						<AlertCircle className="h-5 w-5" /> Confirm Delete
					</DialogTitle>
					<DialogDescription>
						Delete <strong>{item.name}</strong>? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<form action={handleDelete} className="w-full">
						<Button className="w-full" type="submit" variant="destructive">
							Confirm Delete
						</Button>
					</form>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
