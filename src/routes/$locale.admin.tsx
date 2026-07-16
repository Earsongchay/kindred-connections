// Admin layout — pass-through wrapper. Each admin page renders its own AdminShell
// so the sidebar can highlight the active section correctly.
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin — FUENI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => <Outlet />,
});
