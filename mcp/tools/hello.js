export default {
  name: 'hello',
  description: 'Hot-reload proof: echoes a message. Edit this file and the tool updates without an MCP reconnect.',
  inputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'What to echo' },
    },
  },
  handler: async ({ message = 'world' }) => ({
    content: [{ type: 'text', text: `hello ${message}` }],
  }),
};
