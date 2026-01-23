import { auth } from "@/server/auth";
import { db } from "@/server/db";
import type { TRPCBaseContext } from "./trpc-core";

export const createTRPCContext = async (opts: {
	headers: Headers;
}): Promise<TRPCBaseContext> => {
	const session = await auth();

	return {
		db,
		session,
		...opts,
	};
};
