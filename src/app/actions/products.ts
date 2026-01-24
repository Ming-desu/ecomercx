"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";

export async function addProduct(formData: FormData) {
	const name = formData.get("name") as string;
	const price = formData.get("price") as string;
	const stock = formData.get("stock") as string;
	const category = formData.get("category") as string;

	try {
		await db.insert(products).values({
			name,
			price, // Numeric in Drizzle is usually a string to preserve decimals
			stock: parseInt(stock),
			category,
			status: "active",
		});

		revalidatePath("/dashboard"); // Clears cache so new product shows up
		return { success: true };
	} catch (error) {
		console.error("Failed to add product:", error);
		return { success: false };
	}
}

export async function deleteProduct(id: string) {
	// Convert the string ID from the client to a Number for the DB
	await db.delete(products).where(eq(products.id, Number(id)));
	revalidatePath("/inventory");
}

export async function updateProduct(id: string, formData: FormData) {
	const name = formData.get("name") as string;
	const price = formData.get("price") as string;
	const stock = parseInt(formData.get("stock") as string);

	await db
		.update(products)
		.set({ name, price, stock })
		// Convert the string ID to a Number here too
		.where(eq(products.id, Number(id)));

	revalidatePath("/inventory");
}
