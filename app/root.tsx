import { faker } from "@faker-js/faker";
import { cssBundleHref } from "@remix-run/css-bundle";
import {
  type LinksFunction,
  type LoaderFunctionArgs,
  json
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData
} from "@remix-run/react";
import crypto from "node:crypto";
import randomAnimalName from "random-animal-name";
import { useEffect } from "react";
import { ToastContainer, toast as notify } from "react-toastify";
import toastStyles from "react-toastify/dist/ReactToastify.css";
import { getToast } from "remix-toast";

import iconHref from "~/components/icons/sprite.svg";
import styles from "~/tailwind.css";

import { Icon } from "./components/icon.tsx";
import { commitSession, getSession } from "./utils/session.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  // Extracts the toast from the request
  const { headers, toast } = await getToast(request);
  const session = await getSession(request.headers.get("Cookie"));
  let id = session.get("userId");
  if (!id) {
    id = crypto.randomUUID();
    session.set("userId", id);
    session.set("pseudonym", randomAnimalName());
    session.set("emoji", faker.internet.emoji({ types: ["smiley"] }) ?? "👻");
  }
  return json(
    {
      self: {
        emoji: session.get("emoji") ?? "👻",
        pseudonym: session.get("pseudonym") || "Anonymous",
        userId: id
      },
      toast
    },
    {
      headers: {
        ...headers,
        "Set-Cookie": await commitSession(session)
      }
    }
  );
}

export function useRootLoaderData() {
  return useRouteLoaderData<typeof loader>("root");
}

export const links: LinksFunction = () => [
  {
    href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🫳</text></svg>",
    rel: "icon"
  },
  { as: "image", href: iconHref, rel: "preload", type: "image/svg+xml" },
  { as: "style", href: "/fonts/poppins/font.css", rel: "preload" },
  { as: "style", href: styles, rel: "preload" },
  { href: "/fonts/poppins/font.css", rel: "stylesheet" },
  { href: styles, rel: "stylesheet" },
  { href: toastStyles, rel: "stylesheet" },
  ...(cssBundleHref ? [{ href: cssBundleHref, rel: "stylesheet" }] : [])
];

export default function App() {
  const { toast } = useLoaderData<typeof loader>();

  // Hook to show the toasts
  useEffect(() => {
    if (toast) {
      // notify on a toast message
      notify(toast.message, { type: toast.type });
    }
  }, [toast]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-sky-400 via-rose-400 to-lime-400">
        <header className="mx-2 mt-2 flex items-center justify-center rounded-md bg-black bg-opacity-80 p-4 text-white shadow-md md:justify-start">
          <h1 className="w-fit bg-gradient-to-br from-sky-400 via-rose-400 to-lime-400 bg-clip-text text-5xl font-semibold leading-tight text-transparent md:text-left md:text-6xl">
            Emoji Drop
          </h1>
          <div className="ml-2 w-fit text-5xl font-semibold leading-tight md:text-left md:text-6xl">
            🫳
          </div>
        </header>
        <main className="relative mx-2 h-full grow bg-transparent">
          <Outlet />
        </main>
        <footer className="mx-2 mb-2 flex justify-between rounded-md bg-black bg-opacity-80 p-4 text-white shadow-md">
          <div>
            <a
              href="https://twitter.com/itsaydrian"
              rel="noreferrer"
              target="_blank"
            >
              @itsaydrian
            </a>
          </div>
          <div>
            <a
              href="https://github.com/aydrian/remix-interactive-demo"
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-6 w-6 text-white" name="github" />
            </a>
          </div>
        </footer>
        <ToastContainer position="bottom-center" theme="colored" />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
