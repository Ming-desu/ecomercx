import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { createCallerFactory, type TRPCBaseContext } from "../trpc-core";
import { postRouter } from "./post";

const ctx: TRPCBaseContext = {
	db,
	headers: new Headers(),
	session: null,
};

describe("postRouter", () => {
	describe("hello procedure", () => {
		it("should return a greeting with the input text", async () => {
			const caller = createCallerFactory(postRouter)(ctx);

			const result = await caller.hello({ text: "World" });

			expect(result).toEqual({ greeting: "Hello World" });
		});
	});
});
