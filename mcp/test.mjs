// Self-check: connect to index.js as an MCP client, verify proxy + custom tool + hot reload.
import assert from 'node:assert';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ToolListChangedNotificationSchema } from '@modelcontextprotocol/sdk/types.js';

let onNotify;
const notified = new Promise((r) => (onNotify = r));
const client = new Client({ name: 'proxy-test', version: '0.0.0' });
client.setNotificationHandler(ToolListChangedNotificationSchema, onNotify);
await client.connect(
  new StdioClientTransport({ command: process.execPath, args: ['index.js'], stderr: 'ignore' })
);

// 1. merged tool list: playwright upstream + custom hello
const { tools } = await client.listTools();
const names = tools.map((t) => t.name);
assert(names.includes('hello'), 'custom tool hello missing');
assert(names.some((n) => n.startsWith('browser_')), 'playwright tools missing');
console.log(`tools: ${names.length} (incl. ${names.filter((n) => n.startsWith('browser_')).length} browser_*, hello)`);

// 2. call custom tool
const res = await client.callTool({ name: 'hello', arguments: { message: 'proxy' } });
assert(res.content[0].text === 'hello proxy', 'hello tool returned wrong output');
console.log('hello ->', res.content[0].text);

// 3. hot reload: add a tool file, expect list_changed notification without reconnect
const changed = notified;
await new Promise((r) => setTimeout(r, 200)); // fs.watch settle
const fs = await import('node:fs');
fs.writeFileSync("tools/_hot.js", `export default {
  name: 'hot_added',
  description: 'added at runtime',
  inputSchema: { type: 'object' },
  handler: async () => ({ content: [{ type: 'text', text: 'hot!' }] }),
};
`);
await Promise.race([changed, new Promise((_, rej) => setTimeout(() => rej(new Error('no list_changed within 5s')), 5000))]);
const { tools: after } = await client.listTools();
assert(after.some((t) => t.name === 'hot_added'), 'hot-added tool not in list');
fs.rmSync('tools/_hot.js');
console.log('hot reload: ok (tool added + list_changed fired, same connection)');

await client.close();
console.log('ALL CHECKS PASSED');
