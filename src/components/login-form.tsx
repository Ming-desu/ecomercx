"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LoginSchema, type LoginSchemaType } from "@/validators/auth";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();

	const form = useForm<LoginSchemaType>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: LoginSchemaType) => {
		const res = await signIn("credentials", {
			...values,
			redirect: false,
			redirectTo: "/",
		});

		if (res?.error) {
			form.setError("password", {
				type: "manual",
				message: "Invalid email or password.",
			});

			form.setFocus("password");

			return;
		}

		router.push(res?.url ?? "/");
		router.refresh();
	};

	const isSubmitting = form.formState.isSubmitting;

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>
						Login with your Apple or Google account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup>
							<Controller
								control={form.control}
								name="email"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											{...field}
											aria-invalid={fieldState.invalid}
											id={field.name}
											placeholder="m@example.com"
											type="email"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								control={form.control}
								name="password"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<div className="flex items-center">
											<FieldLabel htmlFor={field.name}>Password</FieldLabel>
											<Link
												className="ml-auto text-sm underline-offset-4 hover:underline"
												href="#"
											>
												Forgot your password?
											</Link>
										</div>
										<Input
											{...field}
											aria-invalid={fieldState.invalid}
											id={field.name}
											placeholder="••••••••••••"
											type="password"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Field>
								<Button disabled={isSubmitting} type="submit">
									Login
								</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account? <Link href="#">Sign up</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{" "}
				<Link href="#">Terms of Service</Link> and{" "}
				<Link href="#">Privacy Policy</Link>.
			</FieldDescription>
		</div>
	);
}
