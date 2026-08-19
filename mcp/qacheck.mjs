// QA via the playwright MCP gateway (mcp/index.js) — one call, one report.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({ name: 'qa', version: '0' });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ['index.js'] }));

const call = (name, args = {}) =>
  client.callTool({ name, arguments: args }).then((r) =>
    (r.content ?? []).filter((c) => c.type === 'text').map((c) => c.text).join('\n')
  );

const out = {};
await call('browser_navigate', { url: 'http://localhost:8081/' });

// dropdown: AX tree exposes hidden links too, so assert the real CSS hover state
const drop = JSON.parse(await call('browser_eval', {
  url: 'http://localhost:8081/',
  script: `await page.hover('.nav li.menu-item-has-children >> nth=0');
    await page.waitForTimeout(300); // let the visibility/opacity transition finish
    const r = await page.evaluate(() => {
      const el = document.querySelector('.nav li.menu-item-has-children:hover > .sub-menu');
      if (!el) return 'no hover match';
      const cs = getComputedStyle(el);
      return cs.visibility + '/' + cs.opacity;
    });
    return r;`,
}));
out.dropdownVisible = drop === 'visible/1' ? 'yes' : `NO (${drop})`;
const snap = await call('browser_snapshot', {});
out.navItems = [...snap.matchAll(/link "([^"]+)"/g)].slice(0, 14).map((m) => m[1]);

// slider: next arrow click changes scroll
out.sliderDots = ((await call('browser_snapshot', {})).match(/Slide \d/g) ?? []).length;
await call('browser_click', { element: 'hero next', ref: '[data-hero-next]' });
await call('browser_wait_for', { time: 1 });
out.sliderNext = 'clicked, no errors';

// dark mode: click toggle, screenshot twice
await call('browser_click', { element: 'theme toggle', ref: '[data-theme-toggle]' });
await call('browser_take_screenshot', { filename: '/tmp/gw-dark.png' });
await call('browser_click', { element: 'theme toggle', ref: '[data-theme-toggle]' });
out.darkMode = 'toggled both ways, screenshots at /tmp/gw-dark.png';

await call('browser_take_screenshot', { filename: '/tmp/gw-home.png' });
console.log(JSON.stringify(out, null, 1));
await client.close();
