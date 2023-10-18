import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import confetti from "canvas-confetti";
import UAParser from "ua-parser-js";
import { z } from "zod";

import { Button } from "~/components/ui/button.tsx";
import { Input } from "~/components/ui/input.tsx";
import { Label } from "~/components/ui/label.tsx";
// import { useRootLoaderData } from "~/root.tsx";
import { prisma } from "~/utils/db.server.ts";
import { getSession } from "~/utils/session.server.ts";

const DropSchema = z.object({
  emoji: z
    .string({ required_error: "An emoji is required." })
    .emoji({ message: "We can only drop emoji." }),
  uaBrowserName: z.string().optional(),
  uaBrowserVersion: z.string().optional(),
  uaDeviceModel: z.string().optional(),
  uaDeviceType: z.string().optional(),
  uaDeviceVendor: z.string().optional(),
  uaOSName: z.string().optional(),
  uaOSVersion: z.string().optional()
});

export async function loader({ request }: LoaderFunctionArgs) {
  const userAgentString = request.headers.get("User-Agent");
  if (!userAgentString) {
    return json({ userAgent: null });
  }
  const parser = UAParser(userAgentString);

  return json({
    uaBrowserName: parser.browser.name,
    uaBrowserVersion: parser.browser.version,
    uaDeviceModel: parser.device.model,
    uaDeviceType: parser.device.type,
    uaDeviceVendor: parser.device.vendor,
    uaOSName: parser.os.name,
    uaOSVersion: parser.os.version
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();
  const submission = parse(formData, {
    schema: DropSchema
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

  await prisma.emojiDrop.create({
    data: {
      ...submission.value,
      dropper: {
        connectOrCreate: {
          create: {
            emoji: session.get("emoji"),
            id: session.get("userId"),
            pseudonym: session.get("pseudonym")
          },
          where: {
            id: session.get("userId")
          }
        }
      }
    }
  });
  return json({ status: "success", submission } as const);
}
export default function Drop() {
  // const rootLoaderData = useRootLoaderData();
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(DropSchema),
    defaultValue: { ...data, emoji: "🖖" },
    id: "drop",
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: DropSchema });
    },
    shouldRevalidate: "onBlur"
  });

  if (fetcher.data?.status === "success") {
    if (fetcher.data.submission.value?.emoji) {
      //@ts-ignore
      const emoji = confetti.shapeFromText({
        text: fetcher.data.submission.value?.emoji
      });

      confetti({ scalar: 2, shapes: [emoji] });
    } else {
      confetti();
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-3xl font-medium leading-tight">Drop an Emoji</h2>
      {/* <p>
        {rootLoaderData?.self.emoji} {rootLoaderData?.self.pseudonym}
      </p> */}
      {form.errors ? (
        <ul>
          {form.errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      ) : null}
      <fetcher.Form
        className="mx-auto w-fit flex-col"
        method="post"
        {...form.props}
      >
        <input {...conform.input(fields.uaBrowserName, { type: "hidden" })} />
        <input
          {...conform.input(fields.uaBrowserVersion, { type: "hidden" })}
        />
        <input {...conform.input(fields.uaDeviceModel, { type: "hidden" })} />
        <input {...conform.input(fields.uaDeviceType, { type: "hidden" })} />
        <input {...conform.input(fields.uaDeviceVendor, { type: "hidden" })} />
        <input {...conform.input(fields.uaOSName, { type: "hidden" })} />
        <input {...conform.input(fields.uaOSVersion, { type: "hidden" })} />
        <div className="text-center">
          <Input
            className="h-36 w-36 text-center text-8xl"
            {...conform.input(fields.emoji)}
          />
          <Label htmlFor={fields.emoji.id}>Enter an Emoji</Label>
        </div>
        <ul>
          {fields.emoji.errors?.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        <Button className="w-full bg-opacity-80">Drop it!</Button>
      </fetcher.Form>
    </div>
  );
}
