import { initTRPC, TRPCError } from "@trpc/server";
import type { Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";
import type { db } from "../db";

/**
 * ✅ Pure base context type.
 * Nothing here imports auth/db/next runtime.
 */
export type TRPCBaseContext = {
	db: typeof db;
	session: Session | null;
	headers: Headers;
};

export function createTRPCFactory() {
	const t = initTRPC.context<TRPCBaseContext>().create({
		transformer: superjson,
		errorFormatter({ shape, error }) {
			return {
				...shape,
				data: {
					...shape.data,
					zodError:
						error.cause instanceof ZodError ? error.cause.flatten() : null,
				},
			};
		},
	});

	const timingMiddleware = t.middleware(async ({ next, path }) => {
		const start = Date.now();

		// keep this optional
		if (t._config.isDev) {
			const waitMs = Math.floor(Math.random() * 400) + 100;
			await new Promise((resolve) => setTimeout(resolve, waitMs));
		}

		const result = await next();
		const end = Date.now();
		console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

		return result;
	});

	const publicProcedure = t.procedure.use(timingMiddleware);

	const protectedProcedure = t.procedure
		.use(timingMiddleware)
		.use(({ ctx, next }) => {
			if (!ctx.session?.user) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			return next({
				ctx: {
					session: { ...ctx.session, user: ctx.session.user },
				},
			});
		});

	return {
		t,
		createTRPCRouter: t.router,
		createCallerFactory: t.createCallerFactory,
		publicProcedure,
		protectedProcedure,
	};
}
