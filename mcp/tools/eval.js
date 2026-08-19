// Run a Node-side script against a fresh headless page via playwright-core.
// `page` is in scope; return value is JSON-stringified.
// ponytail: fresh browser per call (no shared session); channel:chrome because the
// pinned playwright-core's chromium-1181 isn't in ms-playwright cache — switch to
// bundled chromium after a `npx playwright install chromium`.
import { chromium } from 'playwright-core';

export default {
  name: 'browser_eval',
  description: 'Run Node script with a fresh headless playwright `page` (goto url first). Script = async function body; return JSON.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Page to open first' },
      script: { type: 'string', description: 'Async function body; `page` is in scope (hover, evaluate, ...)' },
    },
    required: ['url', 'script'],
  },
  handler: async ({ url, script }) => {
    const browser = await chromium.launch({ channel: 'chrome', args: ['--no-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      const result = await new Function('page', `return (async () => { ${script} })()`)(page);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } finally {
      await browser.close();
    }
  },
};
