import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

import { verifyLogin } from "~/routes/auth+/form+/_index.tsx";
import { sessionStorage } from "~/utils/session.server.ts";

export const DEFAULT_FAILURE_REDIRECT = "/";
export const DEFAULT_SUCCESS_REDIRECT = "/home";

export const authenticator = new Authenticator<string>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get("username");
    const password = form.get("password");

    invariant(typeof username === "string", "email must be a string");
    invariant(typeof password === "string", "password must be a string");

    const userId = await verifyLogin(username, password);
    if (!userId) {
      throw new AuthorizationError("Email/Password combination is incorrect");
    }
    return userId;
  }),
  FormStrategy.name
);

export const requireUserId = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const searchParams = new URLSearchParams([
    ["redirectTo", redirectTo],
    ["loginMessage", "Please login to continue"]
  ]);
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: `${DEFAULT_FAILURE_REDIRECT}?${searchParams}`
  });
  return userId;
};
