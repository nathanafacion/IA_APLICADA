
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { getCustomersTool } from '../tools/customersTool.ts';
import { getFSTool } from '../tools/fsTool.ts';

export const getMCPTools = async () => {
  const client = new MultiServerMCPClient({
    mcpServers: {
      ...getCustomersTool(),
      ...getFSTool(),
    },
    onMessage: (log, source) => {
      console.log(`[${source.server}] ${log.data}`);
    },
    onInitialized: (source) => {
      console.log(`✅ MCP server connected: ${source.server}`);
    },
    onConnectionError: (source, error) => {
      console.error(`❌ MCP server failed to connect: ${source.serverName}`, error);
      process.exit(1);
    },
  })

  const mcpTools = await client.getTools();

  return [
    ...mcpTools,
  ];
};
