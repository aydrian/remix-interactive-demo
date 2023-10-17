import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { ErrorList, Field, SubmitButton } from "~/components/form.tsx";
import { prisma } from "~/utils/db.server.ts";

import { verifyLogin } from "./_index.tsx";

export async function changePassword(
  username: string,
  password: string,
  newPassword: string
) {
  const userId = await verifyLogin(username, password);
  if (!userId) {
    throw new Error("Password incorrect.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.user.update({
      data: { passwordHash },
      select: { id: true },
      where: { id: userId }
    });
  } catch (err) {
    console.error(`Error changing password for ${username}: `, err);
    throw new Error("Unable to change password. Please try again.");
  }
}

const ChangePwdSchema = z
  .object({
    confirmPassword: z.string({
      required_error: "Please confirm your new password"
    }),
    newPassword: z
      .string({ required_error: "New Password is required" })
      .min(6, "Password must be at least 6 characters long"),
    password: z.string({ required_error: "Current Password is required" }),
    userId: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: ChangePwdSchema
  });
  if (!submission.value) {
    return json(
      {
        status: "error",
        submission
      } as const,
      { status: 400 }
    );
  }
  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }

  const { newPassword, password, userId } = submission.value;

  try {
    await changePassword(userId, password, newPassword);
  } catch (error) {
    if (error instanceof Error) {
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

  return json({
    status: "success",
    submission: { ...submission, payload: null }
  } as const);
}

export function ChangePwdForm({ userId }: { userId: string }) {
  const changePwdFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(ChangePwdSchema),
    defaultValue: { userId },
    id: "form-change-pwd-form",
    lastSubmission: changePwdFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: ChangePwdSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <changePwdFetcher.Form
      action="/auth/form/changePwd"
      method="POST"
      {...form.props}
      className="mb-8 flex flex-col sm:mb-4"
    >
      {changePwdFetcher.data?.status === "success" ? (
        <div className="mb-2 text-sm text-green-700">
          Password sucessfully changed
        </div>
      ) : null}
      <input {...conform.input(fields.userId, { type: "hidden" })} />
      <Field
        errors={fields.password.errors}
        inputProps={{ ...conform.input(fields.password, { type: "password" }) }}
        labelProps={{ children: "Password", htmlFor: fields.password.id }}
      />
      <Field
        errors={fields.newPassword.errors}
        inputProps={{
          ...conform.input(fields.newPassword, { type: "password" })
        }}
        labelProps={{
          children: "New Password",
          htmlFor: fields.newPassword.id
        }}
      />
      <Field
        errors={fields.confirmPassword.errors}
        inputProps={{
          ...conform.input(fields.confirmPassword, { type: "password" })
        }}
        labelProps={{
          children: "Confirm Password",
          htmlFor: fields.confirmPassword.id
        }}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2"
        state={changePwdFetcher.state}
        type="submit"
      >
        Submit
      </SubmitButton>
    </changePwdFetcher.Form>
  );
}
