import z from "zod";

export const LoginSchema = z.object({
	email: z.string().email("Email is required."),
	password: z.string().min(1, "Password is required."),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
