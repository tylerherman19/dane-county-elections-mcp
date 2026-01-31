#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = "https://api.danecounty.gov";

/**
 * Makes an API request to the Dane County Elections API
 */
async function makeApiRequest(endpoint: string): Promise<any> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "dane-county-elections-mcp/1.0.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch from Dane County Elections API: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Tool definitions for the Dane County Elections API
 */
const TOOLS: Tool[] = [
  {
    name: "list_elections",
    description: "Get a list of all available elections in Dane County",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_election",
    description: "Get detailed information about a specific election by its ID",
    inputSchema: {
      type: "object",
      properties: {
        electionid: {
          type: "string",
          description: "The unique identifier for the election",
        },
      },
      required: ["electionid"],
    },
  },
  {
    name: "get_last_published",
    description: "Get the last published timestamp for a specific election",
    inputSchema: {
      type: "object",
      properties: {
        electionid: {
          type: "string",
          description: "The unique identifier for the election",
        },
      },
      required: ["electionid"],
    },
  },
  {
    name: "get_races",
    description: "Get all races for a specific election",
    inputSchema: {
      type: "object",
      properties: {
        electionid: {
          type: "string",
          description: "The unique identifier for the election",
        },
      },
      required: ["electionid"],
    },
  },
  {
    name: "get_election_results",
    description: "Get results for all races in an election, or for a specific race if racenumber is provided",
    inputSchema: {
      type: "object",
      properties: {
        electionid: {
          type: "string",
          description: "The unique identifier for the election",
        },
        racenumber: {
          type: "string",
          description: "Optional: The race number to get specific race results",
        },
      },
      required: ["electionid"],
    },
  },
  {
    name: "get_precinct_results",
    description: "Get precinct-level results for a specific race in an election",
    inputSchema: {
      type: "object",
      properties: {
        electionid: {
          type: "string",
          description: "The unique identifier for the election",
        },
        racenumber: {
          type: "string",
          description: "The race number to get precinct results for",
        },
      },
      required: ["electionid", "racenumber"],
    },
  },
];

/**
 * Handle tool execution
 */
async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "list_elections":
      return await makeApiRequest("/api/v1/elections/list");

    case "get_election":
      if (!args.electionid) {
        throw new Error("electionid is required");
      }
      return await makeApiRequest(`/api/v1/elections/election/${args.electionid}`);

    case "get_last_published":
      if (!args.electionid) {
        throw new Error("electionid is required");
      }
      return await makeApiRequest(
        `/api/v1/elections/lastpublished/${args.electionid}`
      );

    case "get_races":
      if (!args.electionid) {
        throw new Error("electionid is required");
      }
      return await makeApiRequest(`/api/v1/elections/races/${args.electionid}`);

    case "get_election_results":
      if (!args.electionid) {
        throw new Error("electionid is required");
      }
      const resultsEndpoint = args.racenumber
        ? `/api/v1/elections/electionresults/${args.electionid}/${args.racenumber}`
        : `/api/v1/elections/electionresults/${args.electionid}`;
      return await makeApiRequest(resultsEndpoint);

    case "get_precinct_results":
      if (!args.electionid || !args.racenumber) {
        throw new Error("electionid and racenumber are required");
      }
      return await makeApiRequest(
        `/api/v1/elections/precinctresults/${args.electionid}/${args.racenumber}`
      );

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Main server implementation
 */
async function main() {
  const server = new Server(
    {
      name: "dane-county-elections-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS,
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;
      const result = await handleToolCall(name, args || {});

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server using stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Dane County Elections MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
