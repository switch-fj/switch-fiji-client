'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Card, CardHeader, CardTitle, Form, FormField, InputField } from '@switch-fiji/ui';
import { loginSchema, TLogin } from '../validation';

export default function LoginView() {
  const form = useForm<TLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = (values: TLogin) => {
    console.log(values);
  };

  return (
    <Card className="w-full max-w-lg rounded-2xl border border-border/60 bg-white px-10 py-12 shadow-sm">
      <CardHeader>
        <CardTitle className="text-4xl font-semibold text-primary text-center">
          Welcome back
        </CardTitle>
        <p className="text-text-1 text-center text-sm font-normal">Login to your dashboard.</p>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset className="flex flex-col space-y-3 rounded-2xl bg-white px-8 py-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <InputField
                  label="Email address"
                  placeholder="Enter your email"
                  type="email"
                  required
                  className="bg-white text-sm border border-[#1d1d1d]/40 text-text-1 placeholder:text-text-1/40 placeholder:text-sm"
                  {...field}
                />
              )}
            />
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
            <div className="text-right">
              <Link href="/forgot-password" className="text-orange text-sm">
                Forgot your password?
              </Link>
            </div>
            <Button type="submit" variant="primary" className="mt-6">
              SIGN IN
            </Button>
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
