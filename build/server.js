"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const promises_1 = __importDefault(require("node:fs/promises"));
// Begin: Create MCP Server
const server = new mcp_js_1.McpServer({
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
server.resource("users", "users://all", {
    description: "Get all users data from the database",
    title: "Users",
    mimeType: "application/json",
}, async (uri) => {
    const users = await import("./data/users.json", {
        with: { type: "json" },
    }).then(m => m.default);
    return {
        contents: [
            {
                uri: uri.href,
                text: JSON.stringify(users),
                mimeType: "application/json",
            },
        ],
    };
});
// End : Creaate a resource for MCP Server
// Begin : Create tool for MCP Server
server.tool("create-user", "Creates a new user in the database", {
    name: zod_1.z.string(),
    email: zod_1.z.string(),
    address: zod_1.z.string(),
    phone: zod_1.z.string(),
}, async (params) => {
    try {
        const id = await createUser(params);
        return {
            content: [{ type: "text", text: `User ${id} created successfully` }],
        };
    }
    catch (error) {
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
});
// End : Create tool for MCP Server
// Begin : createUser function definition
async function createUser(user) {
    let users = [];
    try {
        const data = await promises_1.default.readFile("./src/data/users.json", "utf-8");
        users = JSON.parse(data);
    }
    catch (err) {
        if (err.code !== "ENOENT")
            throw err;
    }
    const id = users.length + 1;
    users.push({ id, ...user });
    await promises_1.default.writeFile("./src/data/users.json", JSON.stringify(users, null, 2));
    return id;
}
// End: createUser function definition
// Begin : Connect the server to the Transport Layer
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
// End : Connect the server to the Transport Layer
main();
//# sourceMappingURL=server.js.map