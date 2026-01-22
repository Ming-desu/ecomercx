import { NextResponse } from "next/server";
import { renderTrpcPanel } from "trpc-ui";
import { appRouter } from "@/server/api/root";

export async function GET() {
	if (process.env.NODE_ENV !== "development") {
		return new NextResponse("Not Found", { status: 400 });
	}

	const html = renderTrpcPanel(appRouter, {
		url: "/api/trpc",
		transformer: "superjson",
	});

	return new NextResponse(html, {
		status: 200,
		headers: {
			"content-type": "text/html; charset=utf8",
		},
	});
}
