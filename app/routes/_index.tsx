import type { LoaderFunctionArgs } from "@remix-run/node";

import { requireUserId } from "~/utils/auth.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  return await requireUserId(request);
}

export default function Index() {
  return (
    <div>
      <h1>Rochella Stack</h1>
    </div>
  );
}
