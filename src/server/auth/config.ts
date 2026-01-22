import { randomUUID } from "node:crypto";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import z from "zod";
import { serverEnv } from "@/env/serverEnv";
import { db } from "@/server/db";
import {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "@/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"];
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

const adapter = DrizzleAdapter(db, {
	usersTable: users,
	accountsTable: accounts,
	sessionsTable: sessions,
	verificationTokensTable: verificationTokens,
});

export const authConfig = {
	secret: serverEnv.AUTH_SECRET,
	providers: [
		CredentialsProvider({
			name: "Email + Password",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},

			authorize: async (credentials) => {
				const parsed = z
					.object({
						email: z.string().email(),
						password: z.string().min(1),
					})
					.safeParse(credentials);

				if (!parsed.success) {
					return null;
				}

				const { email, password } = parsed.data;

				const user = await db.query.users.findFirst({
					where: eq(users.email, email),
				});

				if (!user || !user.passwordHash) {
					return null;
				}

				const ok = await argon2.verify(user.passwordHash, password);

				if (!ok) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
				};
			},
		}),
	],
	adapter,
	callbacks: {
		jwt: ({ token, account }) => {
			if (account?.provider === "credentials") {
				token.credentials = true;
			}

			return token;
		},
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
			},
		}),
	},
	jwt: {
		encode: async (params) => {
			if (params.token?.credentials) {
				const sessionToken = randomUUID();

				if (!params.token.sub) {
					throw new Error("No user id found in token.");
				}

				const createdSession = await adapter.createSession?.({
					sessionToken,
					userId: params.token.sub,
					expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
				});

				if (!createdSession) {
					throw new Error("Failed to create session token.");
				}

				return sessionToken;
			}

			return defaultEncode(params);
		},
	},
	pages: {
		signIn: "/auth/login",
		signOut: "/auth/logout",
	},
} satisfies NextAuthConfig;
