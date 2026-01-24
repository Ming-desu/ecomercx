"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { addProduct } from "@/app/actions/products";
import { ImageInput } from "@/components/image-input";
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

export function AddProductDialog() {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	async function handleAction(formData: FormData) {
		setIsPending(true);
		try {
			await addProduct(formData);
			setOpen(false); // ✅ This closes the dialog on success
		} catch (error) {
			console.error("Failed to add product:", error);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button
					className="bg-blue-600 px-4 font-bold text-white shadow-blue-200 shadow-lg hover:bg-blue-700"
					size="sm"
				>
					<Plus className="mr-1 h-4 w-4" />
					Add Item
				</Button>
			</DialogTrigger>

			<DialogContent>
				<form action={handleAction} className="space-y-4">
					<DialogHeader>
						<DialogTitle className="font-black text-2xl">
							New Product
						</DialogTitle>
					</DialogHeader>

					<ImageInput />

					<div className="grid gap-2">
						<Label>Name</Label>
						<Input disabled={isPending} name="name" required />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>Price</Label>
							<Input
								disabled={isPending}
								name="price"
								required
								step="0.01"
								type="number"
							/>
						</div>
						<div className="grid gap-2">
							<Label>Stock</Label>
							<Input disabled={isPending} name="stock" required type="number" />
						</div>
					</div>

					<div className="grid gap-2">
						<Label>Category</Label>
						<Input
							disabled={isPending}
							name="category"
							placeholder="Electronics, etc."
							required
						/>
					</div>

					<DialogFooter>
						<Button
							className="w-full bg-blue-600"
							disabled={isPending}
							type="submit"
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
