import { createFileRoute } from "@tanstack/react-router";

function LayoutBComponent() {
  return <div>I&apos;m B!</div>;
}

export const Route = createFileRoute("/_pathlessLayout/_nested-layout/route-b")(
  {
    component: LayoutBComponent,
  },
);
