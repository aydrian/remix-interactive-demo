import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json
} from "@remix-run/node";
import matter from "matter-js";
import { useEffect, useRef } from "react";
import { useEventSource } from "remix-utils/sse/react";
import { eventStream } from "remix-utils/sse/server";

import { prisma } from "~/utils/db.server.ts";
import { emitter } from "~/utils/emitter.server.ts";
import { cn } from "~/utils/misc.ts";
const { Bodies, Engine, Render, Runner, World } = matter;

interface ChangeFeedMessage<T> {
  length: number;
  payload: T[];
}

type Payload = {
  droppedBy: string;
  emoji: string;
  uaDeviceModel: string;
  uaDeviceVendor: string;
};

type NewEmojiDropEvent = {
  dropper: {
    emoji: string;
    id: string;
    pseudonym: string;
  };
  emoji: string;
  uaDeviceModel: string;
  uaDeviceVendor: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, function setup(send) {
    function handle(payload: Payload) {
      const { droppedBy, ...data } = payload;
      prisma.dropper
        .findUnique({
          select: { emoji: true, id: true, pseudonym: true },
          where: { id: payload.droppedBy }
        })
        .then((dropper) => {
          send({
            data: JSON.stringify({ ...data, dropper }),
            event: "new-emoji-drop"
          });
        });
    }

    emitter.on("new-message", handle);

    return function clear() {
      emitter.off("new-message", handle);
    };
  });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json(
      { message: "Method not allowed" },
      { headers: { Allow: "POST" }, status: 405 }
    );
  }

  const body = (await request.json()) as ChangeFeedMessage<Payload>;

  body.payload.forEach((payload) => {
    emitter.emit("new-message", payload);
  });

  return new Response("OK", { status: 200 });
}

const engine = Engine.create();
const runner = Runner.create();

function createEmoji(emoji: string) {
  const emote = Bodies.circle(
    Math.round(Math.random() * window.innerWidth),
    -30,
    15,
    {
      angle: Math.PI * (Math.random() * 2 - 1),
      friction: 0.001,
      frictionAir: 0.01,
      render: {
        sprite: {
          texture: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`,
          xScale: 0.5,
          yScale: 0.5
        }
      },
      restitution: 0.75
    }
  );

  setTimeout(
    () => {
      World.remove(engine.world, emote);
    },
    5 * 60 * 1000
  );

  World.add(engine.world, [emote]);
}

export function EmojiDrop({
  className,
  qrcode
}: {
  className?: string;
  qrcode?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newEmojiDropEventString = useEventSource("/resources/emoji-drop", {
    event: "new-emoji-drop"
  });
  const newEmojiDropEvent: NewEmojiDropEvent | null = newEmojiDropEventString
    ? JSON.parse(newEmojiDropEventString)
    : null;
  console.log({ newEmojiDropEvent });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const height = canvas.clientHeight;
    const width = canvas.clientWidth;
    console.log({ height, width });

    const render = Render.create({
      canvas,
      // element: "div",
      engine: engine,
      options: {
        background: "transparent",
        height,
        width,
        wireframes: false
      }
    });

    const boundaries = {
      isStatic: true,
      render: {
        fillStyle: "transparent",
        strokeStyle: "transparent"
      }
    };
    const ground = Bodies.rectangle(width / 2, height, width, 10, boundaries);
    const leftWall = Bodies.rectangle(0, height / 2, 10, height, boundaries);
    const rightWall = Bodies.rectangle(
      width,
      height / 2,
      10,
      height,
      boundaries
    );

    const bodies = [ground, leftWall, rightWall];

    if (qrcode) {
      const qrcodeBox = Bodies.rectangle(width / 2, height / 2, 144, 144, {
        isStatic: true,
        render: {
          sprite: { texture: qrcode, xScale: 1, yScale: 1 },
          strokeStyle: "black"
        }
      });
      bodies.push(qrcodeBox);
    }

    World.add(engine.world, bodies);

    Render.run(render);
    Runner.run(runner, engine);
  }, [canvasRef, qrcode]);

  if (newEmojiDropEvent) {
    createEmoji(newEmojiDropEvent.emoji);
  }

  return <canvas className={cn("w-full", className)} ref={canvasRef}></canvas>;
}
