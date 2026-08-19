#!/usr/bin/env node
// MCP middleware: proxies Claude <-> @playwright/mcp, merges hot-reloadable
// custom tools from tools/*.js. Never restarts itself (that would drop the
// MCP session); file changes reload tools in place + notify list_changed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  PingRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// playwright's tool schemas omit `type`, which the SDK's strict zod rejects —
// bypass validation on the child boundary, validate nothing twice.
const loose = z.any();
const childListTools = async () =>
  (await child.request({ method: 'tools/list' }, z.object({ tools: z.array(loose) }))).tools;
const childCallTool = (params) => child.request({ method: 'tools/call', params }, loose);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = path.join(__dirname, 'tools');
const log = (...a) => console.error('[proxy]', ...a);

// --- child: official Playwright MCP (browser stays alive across tool reloads)
const child = new Client({ name: 'playwright-proxy', version: '0.1.0' });
await child.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: [path.join(__dirname, 'node_modules', '@playwright', 'mcp', 'cli.js'), '--no-sandbox'],
    stderr: 'inherit',
    env: {
      ...process.env,
      // reuse the host's playwright browsers instead of downloading again
      PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || `${process.env.HOME}/.cache/ms-playwright`,
    },
  })
);

// --- hot-reloadable custom tools (tools/*.js, export default {name,description,inputSchema,handler})
let customTools = new Map();
async function loadCustomTools() {
  const next = new Map();
  for (const f of fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith('.js'))) {
    try {
      const tool = (await import(`${path.join(TOOLS_DIR, f)}?t=${Date.now()}`)).default;
      next.set(tool.name, tool);
    } catch (e) {
      log(`tools/${f} failed: ${e.message}`);
    }
  }
  customTools = next;
  log(`loaded custom tools: ${[...next.keys()].join(', ') || '(none)'}`);
}
await loadCustomTools();

let reloadTimer;
fs.watch(TOOLS_DIR, { persistent: false }, () => {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(async () => {
    await loadCustomTools();
    try {
      await server.server.notification({ method: 'notifications/tools/list_changed' });
      log('notified tools/list_changed');
    } catch (e) {
      log(`notify failed: ${e.message}`);
    }
  }, 100);
});

// --- proxy
const server = new McpServer(
  { name: 'playwright-mcp-proxy', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.server.setRequestHandler(PingRequestSchema, async () => ({}));

server.server.setRequestHandler(ListToolsRequestSchema, async () => {
  const upstreamTools = await childListTools();
  return {
    tools: [
      ...upstreamTools.map((t) => ({
        ...t,
        // some playwright tools use non-object schemas; MCP requires type:"object"
        inputSchema: t.inputSchema?.type === 'object' ? t.inputSchema : { type: 'object', properties: {} },
      })),
      ...[...customTools.values()].map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    ],
  };
});

server.server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = customTools.get(req.params.name);
  if (tool) return tool.handler(req.params.arguments ?? {});
  return childCallTool(req.params);
});

await server.connect(new StdioServerTransport());
log('ready (proxying @playwright/mcp + hot tools)');
