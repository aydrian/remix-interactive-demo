import type { LoaderFunctionArgs } from "@remix-run/node";

import {
  DEFAULT_FAILURE_REDIRECT,
  authenticator
} from "~/utils/auth.server.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.logout(request, { redirectTo: DEFAULT_FAILURE_REDIRECT });
};
