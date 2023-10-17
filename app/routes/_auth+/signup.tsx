import { type DataFunctionArgs } from "@remix-run/node";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "~/components/ui/card.tsx";
import { SignUpForm } from "~/routes/auth+/form+/signup.tsx";
import {
  DEFAULT_SUCCESS_REDIRECT,
  authenticator
} from "~/utils/auth.server.ts";

export const loader = async ({ request }: DataFunctionArgs) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: DEFAULT_SUCCESS_REDIRECT
  });
};

export default function SignUp() {
  return (
    <Card className="w-3/4">
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
