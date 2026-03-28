import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/redirect")({
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router expects redirect() to be thrown
    throw redirect({
      to: "/posts",
    });
  },
});
