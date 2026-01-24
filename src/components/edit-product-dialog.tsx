"use client";

import { Edit3 } from "lucide-react";
import { useState } from "react";
import { updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditProductDialog({ item }: { item: any }) {
	const [open, setOpen] = useState(false);

	async function handleEdit(formData: FormData) {
		await updateProduct(item.id.toString(), formData);
		setOpen(false); // ✅ Auto-close
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button
					className="rounded-full text-blue-600 hover:bg-blue-100"
					size="icon"
					variant="ghost"
				>
					<Edit3 className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form action={handleEdit}>
					<DialogHeader>
						<DialogTitle>Edit {item.name}</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label>Name</Label>
							<Input defaultValue={item.name} name="name" required />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Price</Label>
								<Input
									defaultValue={item.price}
									name="price"
									required
									step="0.01"
									type="number"
								/>
							</div>
							<div className="grid gap-2">
								<Label>Stock</Label>
								<Input
									defaultValue={item.stock}
									name="stock"
									required
									type="number"
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button className="w-full bg-blue-600" type="submit">
							Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
