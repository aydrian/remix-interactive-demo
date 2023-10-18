import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import QRCode from "qrcode";

import { EmojiDrop } from "~/routes/resources+/emoji-drop.tsx";

export async function loader({ request }: LoaderFunctionArgs) {
  const qrcode = await QRCode.toDataURL(
    `${
      process.env.NODE_ENV === "development"
        ? "https://localhost:3000"
        : `https://${process.env.FLY_APP_NAME}.fly.dev`
    }/drop`
  );
  return json({ qrcode });
}

export default function Index() {
  const { qrcode } = useLoaderData<typeof loader>();
  return (
    <>
      <EmojiDrop className="absolute -z-10 min-h-full w-full" qrcode={qrcode} />
      <div className="p-2">
        <p className="leading-tight">Scan QR Code to start dropping emojis</p>
      </div>
    </>
  );
}
