import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "platform_overview",
  title: "Platform overview",
  description:
    "Return a high-level overview of the FUENI digital health platform, its mission, and the audiences it serves.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "FUENI — a digital health platform for Francophone Africa.",
          "",
          "Mission: make healthcare access simpler and more connected for",
          "patients and healthcare professionals across Francophone Africa.",
          "",
          "Audiences:",
          "- Patients: manage their profile, security, and health space.",
          "- Healthcare professionals: sign up and access professional tools.",
          "",
          "Languages: French (default) and English.",
        ].join("\n"),
      },
    ],
    structuredContent: {
      name: "FUENI",
      region: "Francophone Africa",
      audiences: ["patient", "professional"],
      languages: ["fr", "en"],
    },
  }),
});
