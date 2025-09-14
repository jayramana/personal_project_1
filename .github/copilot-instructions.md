# Copilot Instructions for AI Agents

## Project Overview

This project implements a Model Context Protocol (MCP) server using Node.js and TypeScript. The server exposes resources and tools for user management, with data persisted in JSON files. The architecture is modular, separating server logic, resource definitions, and data storage.

## Key Components

- `src/server.ts`: Main entry point. Sets up the MCP server, registers resources (e.g., `users://all`), and tools (e.g., `create-user`).
- `src/data/users.json`: Primary data store for user records. All user-related operations read/write to this file.
- `build/`: Compiled JavaScript output from TypeScript sources.

## Resource and Tool Patterns

- **Resources**: Registered via `server.resource`. Example: `users://all` returns all users from the JSON file.
- **Tools**: Registered via `server.tool`. Example: `create-user` adds a new user to the JSON file and returns the new user's ID.
- **Data Flow**: All user data is loaded from and saved to `src/data/users.json`. New users are appended with an auto-incremented `id`.

## Developer Workflows

- **Build**: Use `npm run build` to compile TypeScript (`tsconfig.json` configures output to `build/`).
- **Run**: Start the MCP server by running the compiled `build/server.js` with Node.js.
- **Debug**: Use `npm run build:inspect` for debugging with Node.js inspector.
- **Dependencies**: Managed via `package.json`. Notable: `@modelcontextprotocol/sdk`, `zod`, `node:fs/promises`.

## Project-Specific Conventions

- All user data is stored in a single JSON file (`src/data/users.json`).
- Resource URIs follow the pattern `users://all` for easy access.
- Tool and resource registration is colocated in `src/server.ts` for clarity.
- Error handling for file operations is implemented to allow for missing files (e.g., on first run).

## Integration Points

- **MCP Protocol**: The server uses `@modelcontextprotocol/sdk` for MCP compliance.
- **Transport**: Communication is via `StdioServerTransport`.
- **External Access**: Resources and tools are exposed for consumption by MCP-compatible clients.

## Example Patterns

- Registering a resource:
  ```typescript
  server.resource(
    "users",
    "users://all",
    { ... },
    async uri => { ... }
  )
  ```
- Registering a tool:
  ```typescript
  server.tool(
    "create-user",
    "Creates a new user in the database",
    { ... },
    async (params) => { ... }
  )
  ```

## Key Files

- `src/server.ts`: Main logic for server, resources, and tools
- `src/data/users.json`: User data store
- `package.json`, `tsconfig.json`: Project configuration

---

If any section is unclear or missing details, please provide feedback for further refinement.
