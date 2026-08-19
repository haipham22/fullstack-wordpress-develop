// Call any gateway tool from the shell:
//   node call.mjs browser_navigate '{"url":"http://localhost:8081/"}'
//   node call.mjs eval http://localhost:8081/ 'return await page.evaluate(() => 1+1)'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const [tool, argsJson, script] = process.argv.slice(2);
if (!tool) {
  console.error('usage: node call.mjs <tool> [json-args]   |   node call.mjs eval <url> <script>');
  process.exit(1);
}

const c = new Client({ name: 'cli', version: '0' });
await c.connect(new StdioClientTransport({ command: process.execPath, args: ['index.js'] }));

const args = tool === 'eval' && script
  ? { url: argsJson, script }
  : (argsJson ? JSON.parse(argsJson) : {});
const name = tool === 'eval' ? 'browser_eval' : tool;

try {
  const r = await c.callTool({ name, arguments: args });
  for (const x of r.content ?? []) {
    if (x.type === 'text') console.log(x.text);
    else console.log(`[${x.type}]`);
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
await c.close();
