import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import { CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js"

// Begin: Create MCP Server
const server = new McpServer({
  name: "my-first-mcp-server",
  version: "0.1.0",
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
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
  async uri => {
    const users = await import("./data/users.json", {
      with: { type: "json" },
    }).then(m => m.default)

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users),
          mimeType: "application/json",
        },
      ],
    }
  }
)
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

server.tool(
  "create-random-user",
  "Create a random user with fake data",
  {
    title: "Create Random User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => {
    const res = await server.server.request(
      {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Generate fake user data. The user should have a realistic name, email, address, and phone number. Return this data as a JSON object with no other text or formatter so it can be used with JSON.parse.",
              },
            },
          ],
          maxTokens: 1024,
        },
      },
      CreateMessageResultSchema
    )

    if (res.content.type !== "text") {
      return {
        content: [{ type: "text", text: "Failed to generate user data" }],
      }
    }

    try {
      const fakeUser = JSON.parse(
        res.content.text
          .trim()
          .replace(/^```json/, "")
          .replace(/```$/, "")
          .trim()
      )

      const id = await createUser(fakeUser)
      return {
        content: [{ type: "text", text: `User ${id} created successfully` }],
      }
    } catch {
      return {
        content: [{ type: "text", text: "Failed to generate user data" }],
      }
    }
  }
)

server.resource(
  "user-details",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  {
    description: "Get a user's details from teh database",
    title: "User Details",
    mimeType: "application/json",
  },
  async (uri, { userId }) => {
    const users = await import("./data/users.json", {
      with: { type: "json" },
    }).then(m => m.default)
    const user = users.find(u => u.id === parseInt(userId as string))

    return {
      contents: [
        {
          uri: uri.href,
          text: user
            ? JSON.stringify(user)
            : JSON.stringify({ error: "User not found" }),
          mimeType: "application/json",
        },
      ],
    }
  }
)

server.prompt(
  "generate-fake-user",
  "Generate a fake user based on a given name",
  {
    name: z.string(),
  },
  ({ name }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a fake user with the name ${name}. The user should have a realistic email, address, and phone number.`,
          },
        },
      ],
    }
  }
)
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
  console.log("CWD:", process.cwd());
console.log("Looking for:", "./src/data/users.json");

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
// End : Connect the server to the Transport Layer

main();
