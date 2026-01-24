import { and, asc, desc, eq, ilike } from "drizzle-orm";
import * as motion from "framer-motion/client";
import {
	AlertCircle,
	ArrowUpDown,
	DollarSign,
	Edit3,
	Plus,
	Search,
	Trash2,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
	addProduct,
	deleteProduct,
	updateProduct,
} from "@/app/actions/products";
import { AppSidebar } from "@/components/app-sidebar";
import { CategoryFilter } from "@/components/category-filter";
import { Badge } from "@/components/ui/badge";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{
		category?: string;
		q?: string;
		sort?: string;
		order?: string;
	}>;
}) {
	const { category, q, sort, order } = await searchParams;

	const sortField = sort || "createdAt";
	const sortOrder = order === "asc" ? asc : desc;

	const inventory = await db.query.products.findMany({
		where: (products, { and, ilike, eq }) => {
			const conditions = [];
			if (category && category !== "all")
				conditions.push(eq(products.category, category));
			if (q) conditions.push(ilike(products.name, `%${q}%`));
			return and(...conditions);
		},
		orderBy: [sortOrder((products as any)[sortField])],
	});

	const totalRevenue = inventory.reduce(
		(acc, item) => acc + Number(item.price) * (item.salesCount || 0),
		0,
	);

	const growthRate = 100;

	const getSortUrl = (field: string) => {
		const newOrder = sort === field && order === "asc" ? "desc" : "asc";
		const params = new URLSearchParams({
			...(category && { category }),
			...(q && { q }),
			sort: field,
			order: newOrder,
		});
		return `?${params.toString()}`;
	};
	const uniqueCategories = await db
		.select({ category: products.category })
		.from(products)
		.groupBy(products.category);

	const categories = [
		"all",
		...uniqueCategories.map((c) => c.category).filter(Boolean),
	];

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="bg-slate-50/40 dark:bg-zinc-950">
				<header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/60 px-6 backdrop-blur-md">
					<div className="flex items-center gap-2">
						<SidebarTrigger />
						<Separator className="mx-2 h-4" orientation="vertical" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="/dashboard">E-comercx</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage className="font-bold text-blue-600">
										Inventory
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<main className="flex flex-1 flex-col gap-8 p-6">
					{/* KPI Stats */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 10 }}
						>
							<Card className="border-none shadow-sm ring-1 ring-slate-200">
								<CardHeader className="flex flex-row items-center justify-between pb-2 font-bold text-muted-foreground text-xs uppercase tracking-wider">
									Revenue <DollarSign className="h-4 w-4 text-blue-500" />
								</CardHeader>
								<CardContent>
									<div className="font-black text-3xl text-slate-900">
										${totalRevenue.toLocaleString()}
									</div>
									<p className="mt-2 flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-500 text-xs">
										<TrendingUp className="h-3 w-3" /> +{growthRate}%{" "}
										<span className="font-medium text-emerald-400/80">
											vs last month
										</span>
									</p>
								</CardContent>
							</Card>
						</motion.div>
					</div>

					{/* Toolbar */}
					<div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-white p-2 shadow-sm md:flex-row dark:bg-zinc-900">
						<div className="group relative w-full md:w-96">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-blue-600" />
							<form>
								<Input
									className="border-none bg-transparent pl-10 text-base focus-visible:ring-0"
									defaultValue={q}
									name="q"
									placeholder="Search items..."
								/>
							</form>
						</div>
						<div className="flex items-center gap-3 pr-2">
							<CategoryFilter
								categories={categories}
								currentCategory={category}
							/>
							<Dialog>
								<DialogTrigger asChild>
									<Button
										className="bg-blue-600 px-4 font-bold text-white shadow-blue-200 shadow-lg hover:bg-blue-700"
										size="sm"
									>
										<Plus className="mr-1 h-4 w-4" /> Add Item
									</Button>
								</DialogTrigger>
								<DialogContent>
									<form
										action={async (fd) => {
											"use server";
											await addProduct(fd);
										}}
									>
										<DialogHeader>
											<DialogTitle className="font-black text-2xl">
												New Product
											</DialogTitle>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label>Name</Label>
												<Input name="name" required />
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="grid gap-2">
													<Label>Price</Label>
													<Input
														name="price"
														required
														step="0.01"
														type="number"
													/>
												</div>
												<div className="grid gap-2">
													<Label>Stock</Label>
													<Input name="stock" required type="number" />
												</div>
											</div>
											<div className="grid gap-2">
												<Label>Category</Label>
												<Input
													name="category"
													placeholder="Electronics, etc."
													required
												/>
											</div>
										</div>
										<DialogFooter>
											<Button className="w-full bg-blue-600" type="submit">
												Create
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					{/* Table */}
					<Card className="overflow-hidden border-none bg-white shadow-slate-200/50 shadow-xl">
						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="border-b bg-slate-50/50">
										<tr>
											<th className="h-14 px-6 text-left font-bold text-slate-500">
												<Link
													className="flex items-center gap-2 hover:text-blue-600"
													href={getSortUrl("name")}
												>
													Item <ArrowUpDown className="h-3 w-3" />
												</Link>
											</th>
											<th className="h-14 px-6 text-left font-bold text-slate-500">
												Category
											</th>
											<th className="h-14 px-6 text-left font-bold text-slate-500">
												<Link
													className="flex items-center gap-2 hover:text-blue-600"
													href={getSortUrl("price")}
												>
													Price <ArrowUpDown className="h-3 w-3" />
												</Link>
											</th>
											<th className="h-14 px-6 text-left font-bold text-slate-500">
												Availability
											</th>
											<th className="h-14 px-6 text-left font-bold text-slate-500">
												Performance
											</th>
											<th className="h-14 px-6 text-right font-bold text-slate-500">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{inventory.map((item, index) => (
											<motion.tr
												animate={{ opacity: 1, x: 0 }}
												className="group transition-all duration-200 hover:bg-blue-50/30"
												initial={{ opacity: 0, x: -5 }}
												key={item.id}
												transition={{ delay: index * 0.05 }}
											>
												<td className="p-6 font-bold text-slate-900">
													{item.name}
												</td>
												<td className="p-6">
													<Badge className="capitalize" variant="secondary">
														{item.category}
													</Badge>
												</td>
												<td className="p-6 font-semibold text-slate-700">
													${Number(item.price).toLocaleString()}
												</td>
												<td className="p-6">
													<div className="flex items-center gap-2">
														<div
															className={`h-2 w-2 rounded-full ${item.stock === 0 ? "bg-red-500" : item.stock < 10 ? "bg-amber-500" : "bg-emerald-500"}`}
														/>
														<span className="font-medium">
															{item.stock} in stock
														</span>
													</div>
												</td>
												<td className="p-6">
													<div className="font-black text-base text-slate-900">
														$
														{(
															Number(item.price) * (item.salesCount || 0)
														).toLocaleString()}
													</div>
													<div className="font-bold text-[11px] text-blue-500 uppercase italic">
														{item.salesCount || 0} Sales
													</div>
												</td>
												<td className="p-6 text-right">
													<div className="flex justify-end gap-2">
														{/* EDIT */}
														<Dialog>
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
																<form
																	action={async (fd) => {
																		"use server";
																		await updateProduct(item.id.toString(), fd);
																	}}
																>
																	<DialogHeader>
																		<DialogTitle>Edit {item.name}</DialogTitle>
																	</DialogHeader>
																	<div className="grid gap-4 py-4">
																		<div className="grid gap-2">
																			<Label>Name</Label>
																			<Input
																				defaultValue={item.name}
																				name="name"
																			/>
																		</div>
																		<div className="grid grid-cols-2 gap-4">
																			<div className="grid gap-2">
																				<Label>Price</Label>
																				<Input
																					defaultValue={item.price}
																					name="price"
																					step="0.01"
																					type="number"
																				/>
																			</div>
																			<div className="grid gap-2">
																				<Label>Stock</Label>
																				<Input
																					defaultValue={item.stock}
																					name="stock"
																					type="number"
																				/>
																			</div>
																		</div>
																	</div>
																	<DialogFooter>
																		<Button
																			className="bg-blue-600"
																			type="submit"
																		>
																			Save Changes
																		</Button>
																	</DialogFooter>
																</form>
															</DialogContent>
														</Dialog>

														{/* DELETE */}
														<Dialog>
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
																		<AlertCircle className="h-5 w-5" /> Confirm
																		Delete
																	</DialogTitle>
																	<DialogDescription>
																		Delete <strong>{item.name}</strong>? This
																		action cannot be undone.
																	</DialogDescription>
																</DialogHeader>
																<DialogFooter>
																	<form
																		action={async () => {
																			"use server";
																			await deleteProduct(item.id.toString());
																		}}
																	>
																		<Button
																			className="w-full"
																			type="submit"
																			variant="destructive"
																		>
																			Confirm Delete
																		</Button>
																	</form>
																</DialogFooter>
															</DialogContent>
														</Dialog>
													</div>
												</td>
											</motion.tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
