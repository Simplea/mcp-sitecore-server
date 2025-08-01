import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { Config } from "@/config.js";
import { z } from "zod";
import { safeMcpResponse } from "@/helper.js";
import { runGenericPowershellCommand } from "../../simple/generic.js";
import { PowershellCommandBuilder } from "../../command-builder.js";
import { getSwitchParameterValue } from "../../utils.js";

export function getRenderingParameterByPathPowershellTool(server: McpServer, config: Config) {
    server.tool(
        "presentation-get-rendering-parameter-by-path",
        "Gets rendering parameter for the item specified by path.",
        {
            itemPath: z.string().describe("The path of the item holding the rendering."),
            renderingUniqueId: z.string().describe("The unique ID of the rendering holding the rendering parameter."),
            name: z.string().describe("The name of the rendering parameter to get.").optional(),
            finalLayout: z
                .boolean()
                .describe("Specifies layout holding the rendering parameter. If 'true', the final layout is used, otherwise - shared layout.")
                .optional(),
            language: z.string().describe("The item language varsion.").optional(),
        },
        async (params) => {
            const commandBuilder = new PowershellCommandBuilder();

            const getRenderingParameters: Record<string, any> = {};
            getRenderingParameters["Path"] = params.itemPath;
            getRenderingParameters["UniqueId"] = params.renderingUniqueId;
            getRenderingParameters["FinalLayout"] = getSwitchParameterValue(params.finalLayout);
            getRenderingParameters["Language"] = params.language;

            const getRenderingParameterParameters: Record<string, any> = {};
            getRenderingParameterParameters["Name"] = params.name;

            const command = `
                $rendering = Get-Rendering ${commandBuilder.buildParametersString(getRenderingParameters)};
                Get-RenderingParameter -Instance $rendering ${commandBuilder.buildParametersString(getRenderingParameterParameters)};
            `;

            return safeMcpResponse(runGenericPowershellCommand(config, command, {}));
        }
    );
}
