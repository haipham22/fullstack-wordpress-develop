// README screenshots: node docs-shots.mjs <outdir>
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';

const outDir = process.argv[2] ?? '/tmp';
const c = new Client({ name: 'shots', version: '0' });
await c.connect(new StdioClientTransport({ command: process.execPath, args: ['index.js'] }));

const shot = async (name, url, theme) => {
  const r = await c.callTool({
    name: 'browser_eval',
    arguments: {
      url,
      script: `await page.setViewportSize({ width: 1280, height: 800 });
        ${theme ? `await page.evaluate(() => document.documentElement.setAttribute('data-theme', '${theme}'));` : ''}
        await page.waitForTimeout(800);
        return JSON.stringify((await page.screenshot()).toString('base64'));`,
    },
  });
  const b64 = JSON.parse(r.content.find((x) => x.type === 'text').text);
  fs.writeFileSync(`${outDir}/${name}.png`, Buffer.from(b64, 'base64'));
  console.log(`${name}.png`);
};

await shot('home-light', 'http://localhost:8081/', null);
await shot('home-dark', 'http://localhost:8081/', 'dark');
await shot('single', 'http://localhost:8081/theme-block-category/', null);
await c.close();
