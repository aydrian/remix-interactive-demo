import React, { useId } from "react";

import { Button } from "~/components/ui/button.tsx";
import { Input, type InputProps } from "~/components/ui/input.tsx";
import { Label } from "~/components/ui/label.tsx";
import { Textarea } from "~/components/ui/textarea.tsx";
import { cn } from "~/utils/misc.ts";

export type ListOfErrors = Array<null | string | undefined> | null | undefined;

export function ErrorList({
  errors,
  id
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul className="flex flex-col gap-1" id={id}>
      {errorsToRender.map((e) => (
        <li className="text-[10px] text-red-600" key={e}>
          {e}
        </li>
      ))}
    </ul>
  );
}

export function Field({
  className,
  errors,
  inputProps,
  labelProps
}: {
  className?: string;
  errors?: ListOfErrors;
  inputProps: Omit<InputProps, "className">;
  labelProps: Omit<(typeof Label)["propTypes"], "className">;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} {...labelProps} />
      <Input
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...inputProps}
      />
      <div className="px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function TextareaField({
  className,
  errors,
  labelProps,
  textareaProps
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: React.InputHTMLAttributes<HTMLTextAreaElement>;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} {...labelProps} />
      <Textarea
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...textareaProps}
      />
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function SubmitButton({
  state = "idle",
  submittingText = "Submitting...",
  ...props
}: React.ComponentPropsWithRef<"button"> & {
  state?: "idle" | "loading" | "submitting";
  submittingText?: string;
}) {
  return (
    <Button
      {...props}
      className={props.className}
      disabled={props.disabled || state !== "idle"}
    >
      <span>{state !== "idle" ? submittingText : props.children}</span>
    </Button>
  );
}
