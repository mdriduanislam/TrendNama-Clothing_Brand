"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import useAuthStore from "@/stores/authStore";
import { LoginFormInputs, loginFormSchema } from "@/types";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bootstrap, login, isAuthenticated, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    const next = searchParams.get("next") || "/";
    router.replace(next);
  }, [isLoading, isAuthenticated, router, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setServerError(null);
    const result = await login(data);

    if (!result.ok) {
      setServerError(result.error || "Login failed.");
      return;
    }

    const next = searchParams.get("next") || "/";
    router.replace(next);
  };

  if (!isLoading && isAuthenticated) return null;

  return (
    <div className="max-w-md mx-auto mt-12 border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-gray-500 mt-1">
          Continue to your cart and checkout.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-400"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-400"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-gray-900 hover:bg-black disabled:opacity-70 text-white p-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        {serverError && <p className="text-xs text-red-500">{serverError}</p>}
      </form>

      <p className="text-xs text-gray-500 mt-4">
        You can register a new account, or use demo user@example.com /
        password123.
      </p>

      <Link
        href="/register"
        className="inline-block mt-4 text-sm text-gray-700 hover:text-black"
      >
        Create a new account
      </Link>

      <Link href="/" className="block mt-5 text-sm text-gray-700 hover:text-black">
        Back to home
      </Link>
    </div>
  );
};

export default LoginPage;
