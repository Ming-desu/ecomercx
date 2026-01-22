import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { createTRPCFactory } from "./trpc-core";

export const createTRPCContext = async (opts: { headers: Headers }) => {
	const session = await auth();

	return {
		db,
		session,
		...opts,
	};
};

const trpc = createTRPCFactory();

export const {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
	createCallerFactory,
	t,
} = trpc;
