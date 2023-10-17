import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type DataFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { z } from "zod";

import { ErrorList, Field, SubmitButton } from "~/components/form.tsx";
import {
  DEFAULT_SUCCESS_REDIRECT,
  authenticator
} from "~/utils/auth.server.ts";
import { redirectToCookie } from "~/utils/cookies.server.ts";
import { prisma } from "~/utils/db.server.ts";

export async function verifyLogin(username: string, password: string) {
  const userWithPassword = await prisma.user.findUnique({
    select: { id: true, passwordHash: true },
    where: { username }
  });

  if (!userWithPassword || !userWithPassword.passwordHash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!isValid) {
    return null;
  }

  return userWithPassword.id;
}

const LoginFormSchema = z.object({
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
  username: z.string({ required_error: "Username is required" })
});

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: LoginFormSchema
  });
  if (!submission.value || submission.intent !== "submit") {
    return json(
      {
        status: "error",
        submission
      } as const,
      { status: 400 }
    );
  }
  const redirectTo =
    (await redirectToCookie.parse(request.headers.get("Cookie"))) ??
    DEFAULT_SUCCESS_REDIRECT;

  try {
    await authenticator.authenticate(FormStrategy.name, request, {
      context: { formData },
      successRedirect: redirectTo,
      throwOnError: true
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return json(
        {
          status: "error",
          submission: {
            ...submission,
            error: {
              "": [error.message]
            }
          }
        } as const,
        { status: 400 }
      );
    }
    throw error;
  }

  return json({ status: "success", submission } as const);
};

export function FormLoginForm({ formError }: { formError?: null | string }) {
  const loginFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(LoginFormSchema),
    id: "form-login-form",
    lastSubmission: loginFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <loginFetcher.Form
      action="/auth/form"
      method="post"
      {...form.props}
      className="mb-8 flex flex-col sm:mb-4"
    >
      <Field
        errors={fields.username.errors}
        inputProps={{ ...conform.input(fields.username) }}
        labelProps={{ children: "Username", htmlFor: fields.username.id }}
      />
      <Field
        errors={fields.password.errors}
        inputProps={{ ...conform.input(fields.password), type: "password" }}
        labelProps={{ children: "Password", htmlFor: fields.password.id }}
      />
      <ErrorList errors={formError ? [formError] : []} />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2"
        state={loginFetcher.state}
        type="submit"
      >
        Login
      </SubmitButton>
    </loginFetcher.Form>
  );
}
