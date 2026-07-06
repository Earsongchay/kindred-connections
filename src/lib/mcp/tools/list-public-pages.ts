import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const PAGES = [
  { path: "/{locale}", title: "Home", description: "Public landing page." },
  {
    path: "/{locale}/inscription",
    title: "Patient signup",
    description: "Registration for patients.",
  },
  {
    path: "/{locale}/signup",
    title: "Professional signup",
    description: "Registration for healthcare professionals.",
  },
  { path: "/{locale}/login", title: "Login", description: "Sign in (patient or professional)." },
  {
    path: "/{locale}/contact",
    title: "Contact",
    description: "Contact the FUENI team.",
  },
  {
    path: "/{locale}/fonctionnalites",
    title: "Features",
    description: "Overview of platform features.",
  },
  { path: "/{locale}/pour-qui", title: "For whom", description: "Who the platform is for." },
  { path: "/{locale}/securite", title: "Security", description: "How FUENI protects data." },
];

export default defineTool({
  name: "list_public_pages",
  title: "List public pages",
  description:
    "List the public pages of the FUENI site, optionally resolved for a given locale (fr or en).",
  inputSchema: {
    locale: z
      .enum(["fr", "en"])
      .optional()
      .describe("Locale to resolve page paths for. Defaults to fr."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ locale }) => {
    const resolved = (locale ?? "fr") satisfies "fr" | "en";
    const pages = PAGES.map((p) => ({
      ...p,
      path: p.path.replace("{locale}", resolved),
    }));
    return {
      content: [
        {
          type: "text",
          text: pages.map((p) => `- ${p.title} (${p.path}): ${p.description}`).join("\n"),
        },
      ],
      structuredContent: { locale: resolved, pages },
    };
  },
});
