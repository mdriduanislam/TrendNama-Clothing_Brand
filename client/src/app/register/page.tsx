"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import useAuthStore from "@/stores/authStore";
import { RegisterFormInputs, registerFormSchema } from "@/types";

const RegisterPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bootstrap, isAuthenticated, isLoading } = useAuthStore();
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
  }, [isAuthenticated, isLoading, router, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setServerError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      setServerError(result.error || "Could not register account.");
      return;
    }

    await bootstrap();
    const next = searchParams.get("next") || "/";
    router.replace(next);
  };

  if (!isLoading && isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-12 border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Register to add items to cart and continue checkout.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-400"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-400"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-400"
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-400"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-gray-900 hover:bg-black disabled:opacity-70 text-white p-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        {serverError && <p className="text-xs text-red-500">{serverError}</p>}
      </form>

      <Link href="/login" className="inline-block mt-4 text-sm text-gray-700 hover:text-black">
        Already have an account? Sign in
      </Link>

      <Link href="/" className="block mt-5 text-sm text-gray-700 hover:text-black">
        Back to home
      </Link>
    </div>
  );
};

const RegisterPage = () => {
  return (
    <Suspense fallback={<div className="mt-12 text-center">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
};

export default RegisterPage;
