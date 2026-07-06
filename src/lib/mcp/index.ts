import { defineMcp } from "@lovable.dev/mcp-js";
import platformOverviewTool from "./tools/platform-overview";
import listFeaturesTool from "./tools/list-features";
import listPublicPagesTool from "./tools/list-public-pages";

export default defineMcp({
  name: "fueni-mcp",
  title: "FUENI MCP",
  version: "0.1.0",
  instructions:
    "Tools for FUENI, a digital health platform for Francophone Africa. Use `platform_overview` for a summary, `list_features` for capabilities, and `list_public_pages` to discover public pages.",
  tools: [platformOverviewTool, listFeaturesTool, listPublicPagesTool],
});
