import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  emoji: string;
  pseudonym: string;
  userId: string;
};

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    httpOnly: true, // for security reasons, make this cookie http only
    name: "__remix_intractive_demo_session", // use any name you want here
    path: "/", // remember to add this so the cookie will work in all routes
    sameSite: "lax", // this helps with CSRF
    secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production" // enable this in prod only
  }
});

// you can also export the methods individually for your own usage
export const { commitSession, destroySession, getSession } = sessionStorage;
