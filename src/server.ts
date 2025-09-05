import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";

// Begin: Create MCP Server
const server = new McpServer({
  name: "my-first-mcp-server",
  version: "0.1.0",
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
  },
});
// End: Create MCP Server

// Begin : Create a reesource for MCP Server
server.resource(
  "users",                 
  "users://all",           
  {
    description: "Get all users data from the database",
    title: "Users",
    mimeType: "application/json",
  },
  async (uri) => {
    // Read users.json from disk
    const data = await fs.readFile("./src/data/users.json", "utf-8");
    const users = JSON.parse(data);

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users, null, 2), // pretty JSON
          mimeType: "application/json",
        },
      ],
    };
  }
);

// End : Creaate a resource for MCP Server



// Begin : Create tool for MCP Server
server.tool(
  "create-user",
  "Creates a new user in the database",
  {
    name: z.string(),
    email: z.string(),
    address: z.string(),
    phone: z.string(),
  },
  async (params) => {
    try {
      const id = await createUser(params);
      return {
        content: [{ type: "text", text: `User ${id} created successfully` }],
      };
    } catch (error) {
      console.error(error);
      return {
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : String(error),
          },
        ],
      };
    }
  }
);
// End : Create tool for MCP Server

// Begin : createUser function definition
async function createUser(user: {
  name: string;
  email: string;
  address: string;
  phone: string;
}) {
  let users: any[] = [];

  try {
    const data = await fs.readFile("./src/data/users.json", "utf-8");
    users = JSON.parse(data);
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }

  const id = users.length + 1;

  users.push({ id, ...user });

  await fs.writeFile("./src/data/users.json", JSON.stringify(users, null, 2));
  return id;
}
// End: createUser function definition

// Begin : Connect the server to the Transport Layer
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
// End : Connect the server to the Transport Layer


main();
