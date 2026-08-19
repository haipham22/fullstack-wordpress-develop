# playwright-mcp-proxy

MCP middleware: proxies Claude Code to `@playwright/mcp` and merges custom tools from `tools/*.js`.

- Run: `node index.js` (deps: `pnpm install`)
- Add a tool: drop a `tools/*.js` exporting `{name, description, inputSchema, handler}` — hot reloads, no reconnect.
- Register in Claude Code: `claude mcp add playwright -s user -- node <this dir>/index.js`
- Self-check: `node test.mjs`
