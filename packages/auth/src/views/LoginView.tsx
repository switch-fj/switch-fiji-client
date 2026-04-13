"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  InputField,
} from "@workspace/ui";
import {
  loginEmailSchema,
  loginOtpSchema,
  loginSchema,
  type TLoginBase,
} from "../validation";

type AuthType = "otp" | "pwd";

type TokenResponse = {
  data: {
    access_token: string;
    is_email_verified: boolean;
    auth_type: AuthType;
  };
  message: string;
};

type LoginViewProps = {
  login: (values: {
    email: string;
    password?: string | null;
  }) => Promise<TokenResponse>;
  verifyLogin: (values: {
    email: string;
    otp: string;
  }) => Promise<TokenResponse>;
  onAuthStart?: () => void;
  onAuthSuccess?: (response: TokenResponse) => void;
  onAuthError?: (message: string) => void;
  isSubmitting?: boolean;
};

export default function LoginView({
  login,
  verifyLogin,
  onAuthStart,
  onAuthSuccess,
  onAuthError,
  isSubmitting,
}: LoginViewProps) {
  const [step, setStep] = useState<"email" | "password" | "otp">("email");

  const resolverSchema = useMemo(() => {
    if (step === "email") {
      return loginEmailSchema;
    }
    if (step === "password") {
      return loginSchema;
    }
    return loginOtpSchema;
  }, [step]);

  const form = useForm<TLoginBase>({
    resolver: zodResolver(resolverSchema) as never,
    defaultValues: {
      email: "",
      password: "",
      otp: "",
    },
  });

  const handleSubmit = async (values: {
    email: string;
    password?: string;
    otp?: string;
  }) => {
    try {
      onAuthStart?.();
      if (step === "email") {
        const response = await login({ email: values.email });
        if (response.data.auth_type === "pwd") {
          setStep("password");
          return;
        }
        setStep("otp");
        return;
      }

      if (step === "password") {
        const response = await login({
          email: values.email,
          password: values.password,
        });
        onAuthSuccess?.(response);
        return;
      }

      const response = await verifyLogin({
        email: values.email,
        otp: values.otp ?? "",
      });
      onAuthSuccess?.(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      onAuthError?.(message);
    }
  };

  return (
    <Card className="w-full max-w-lg rounded-2xl border border-border/60 bg-white px-10 py-12 shadow-sm">
      <CardHeader>
        <CardTitle className="text-4xl font-semibold text-primary text-center">
          Welcome back
        </CardTitle>
        <p className="text-text-1 text-center text-sm font-normal">
          Login to your dashboard.
        </p>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <fieldset className="flex flex-col space-y-2 rounded-2xl bg-white px-8 py-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <InputField
                  label="Email address"
                  placeholder="Enter your email"
                  type="email"
                  required
                  disabled={step !== "email"}
                  className="bg-white text-sm border border-[#1d1d1d]/40 text-text-1 placeholder:text-text-1/40 placeholder:text-sm"
                  {...field}
                />
              )}
            />
            {step === "password" && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <InputField
                    label="Password"
                    placeholder="Enter password"
                    type="password"
                    required
                    className="bg-white text-sm border border-[#1d1d1d]/40 text-text-1 placeholder:text-text-1/40 placeholder:text-sm"
                    {...field}
                  />
                )}
              />
            )}
            {step === "otp" && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <InputField
                    label="OTP"
                    placeholder="Enter OTP"
                    type="text"
                    required
                    className="bg-white text-sm border border-[#1d1d1d]/40 text-text-1 placeholder:text-text-1/40 placeholder:text-sm"
                    {...field}
                  />
                )}
              />
            )}
            <div className="text-right">
              <Link href="/forgot-password" className="text-orange text-sm">
                Forgot your password?
              </Link>
            </div>
            <Button
              type="submit"
              variant="primary"
              className="mt-6"
              disabled={isSubmitting}
            >
              {step === "email" && "CONTINUE"}
              {step === "password" && "SIGN IN"}
              {step === "otp" && "VERIFY"}
            </Button>
            {step !== "email" && (
              <button
                type="button"
                className="text-xs text-text-1 underline"
                onClick={() => setStep("email")}
              >
                Use a different email
              </button>
            )}
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
