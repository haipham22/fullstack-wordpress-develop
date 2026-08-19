// Screenshot several pages: node sweep.mjs out1=/path out2=/path ...
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';

const targets = process.argv.slice(2); // "name=URL" pairs
const c = new Client({ name: 'sweep', version: '0' });
await c.connect(new StdioClientTransport({ command: process.execPath, args: ['index.js'] }));

for (const t of targets) {
  const [name, url] = t.split('=');
  const out = await c.callTool({
    name: 'browser_eval',
    arguments: { url, script: 'return JSON.stringify((await page.screenshot()).toString("base64"));' },
  });
  const b64 = JSON.parse(out.content.find((x) => x.type === 'text').text);
  fs.writeFileSync(`/tmp/sweep-${name}.png`, Buffer.from(b64, 'base64'));
  console.log(`saved /tmp/sweep-${name}.png`);
}
await c.close();
