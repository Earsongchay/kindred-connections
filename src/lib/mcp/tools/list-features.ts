import { defineTool } from "@lovable.dev/mcp-js";

const FEATURES = [
  {
    id: "patient-space",
    title: "Patient space",
    description:
      "A personal space where patients manage their profile, contact details, and account settings.",
  },
  {
    id: "professional-signup",
    title: "Professional onboarding",
    description: "Healthcare professionals can register and access dedicated tools.",
  },
  {
    id: "security",
    title: "Account security",
    description:
      "Password management, data export, and account controls for patients.",
  },
  {
    id: "bilingual",
    title: "Bilingual experience",
    description: "Full French and English support across the platform.",
  },
];

export default defineTool({
  name: "list_features",
  title: "List features",
  description: "List the main features offered by the FUENI platform.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: FEATURES.map((f) => `- ${f.title}: ${f.description}`).join("\n"),
      },
    ],
    structuredContent: { features: FEATURES },
  }),
});
