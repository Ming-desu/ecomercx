import { asc, desc } from "drizzle-orm";
import * as motion from "framer-motion/client";
import { ArrowUpDown, DollarSign, ImageIcon, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AddProductDialog } from "@/components/add-product-dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { CategoryFilter } from "@/components/category-filter";
import { DeleteProductDialog } from "@/components/delete-product-dialog";
import { EditProductDialog } from "@/components/edit-product-dialog";
import { SearchInput } from "@/components/search-input";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { getImageUrl } from "@/lib/b2";
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

	const getSortColumn = (field?: string) => {
		switch (field) {
			case "price":
				return products.price;
			case "stock":
				return products.stock;
			case "salesCount":
				return products.salesCount;
			case "name":
			default:
				return products.name;
		}
	};

	const sortOrderFn = order === "asc" ? asc : desc;
	const orderByColumn = getSortColumn(sort);

	const rawInventory = await db.query.products.findMany({
		where: (table, { and, ilike, eq }) => {
			const conditions = [];
			if (category && category !== "all")
				conditions.push(eq(table.category, category));
			if (q) conditions.push(ilike(table.name, `%${q}%`));
			return and(...conditions);
		},
		orderBy: [sortOrderFn(orderByColumn)],
	});

	// --- FIX: Map over inventory to get Signed URLs for images ---
	const inventory = await Promise.all(
		rawInventory.map(async (item) => {
			const signedUrl = await getImageUrl(item.image);
			return {
				...item,
				displayUrl: signedUrl, // Now a real string, not a Promise
			};
		}),
	);

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
		...(uniqueCategories.map((c) => c.category).filter(Boolean) as string[]),
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
									<BreadcrumbLink href="/dashboard">E-commerce</BreadcrumbLink>
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
										<TrendingUp className="h-3 w-3" /> +{growthRate}%
										<span className="font-medium text-emerald-400/80">
											{" "}
											vs last month
										</span>
									</p>
								</CardContent>
							</Card>
						</motion.div>
					</div>

					{/* Toolbar */}
					<div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-white p-2 shadow-sm md:flex-row dark:bg-zinc-900">
						<SearchInput defaultValue={q} />

						<div className="flex items-center gap-3 pr-2">
							<CategoryFilter
								categories={categories}
								currentCategory={category}
							/>

							{/* ✅ Use the new Client Component here */}
							<AddProductDialog />
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
										{inventory.map((item, idx) => (
											<motion.tr
												animate={{ opacity: 1, x: 0 }}
												className="group transition-all duration-200 hover:bg-blue-50/30"
												initial={{ opacity: 0, x: -5 }}
												key={item.id}
												transition={{ delay: idx * 0.05 }}
											>
												<td className="p-6">
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 overflow-hidden rounded-lg border bg-slate-100">
															{item.displayUrl ? (
																<img
																	alt={item.name}
																	className="h-full w-full object-cover"
																	src={item.displayUrl}
																/>
															) : (
																<div className="flex h-full w-full items-center justify-center text-slate-300">
																	<ImageIcon className="h-5 w-5" />
																</div>
															)}
														</div>
														<span className="font-bold text-slate-900">
															{item.name}
														</span>
													</div>
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
														{/* ✅ CLEAN COMPONENTS WITH AUTO-CLOSE LOGIC */}
														<EditProductDialog item={item} />
														<DeleteProductDialog item={item} />
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
