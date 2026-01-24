"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadImageToB2 } from "@/lib/b2";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";

/* =========================
   ADD PRODUCT
   ========================= */
export async function addProduct(formData: FormData): Promise<void> {
	const imageFile = formData.get("image") as File | null;

	let imageKey: string | null = null;

	if (imageFile && imageFile.size > 0) {
		imageKey = await uploadImageToB2(imageFile);
	}

	await db.insert(products).values({
		name: formData.get("name") as string,
		price: formData.get("price") as string,
		stock: Number(formData.get("stock")) || 0,
		category: formData.get("category") as string,
		image: imageKey,
		status: "active",
	});

	revalidatePath("/inventory");
}

/* =========================
   DELETE PRODUCT
   ========================= */
export async function deleteProduct(id: string): Promise<void> {
	await db.delete(products).where(eq(products.id, id));
	revalidatePath("/inventory");
}

/* =========================
   UPDATE PRODUCT
   ========================= */
export async function updateProduct(
	id: string,
	formData: FormData,
): Promise<void> {
	const name = formData.get("name") as string;
	const price = formData.get("price") as string;
	const stock = Number(formData.get("stock")) || 0;

	await db
		.update(products)
		.set({
			name,
			price,
			stock,
			updatedAt: new Date(),
		})
		.where(eq(products.id, id));

	revalidatePath("/inventory");
}
