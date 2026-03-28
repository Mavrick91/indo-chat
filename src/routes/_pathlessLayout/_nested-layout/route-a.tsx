import { createFileRoute } from "@tanstack/react-router";

function LayoutAComponent() {
  return <div>I&apos;m A!</div>;
}

export const Route = createFileRoute("/_pathlessLayout/_nested-layout/route-a")(
  {
    component: LayoutAComponent,
  },
);
