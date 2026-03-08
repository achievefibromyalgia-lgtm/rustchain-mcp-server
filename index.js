#!/usr/bin/env node

/**
 * RustChain MCP Server
 * 
 * Query RustChain blockchain from Claude Code
 * Reward: 75-100 RTC
 * 
 * @author: AI Assistant
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import https from "https";
import http from "http";

const NODES = [
  "https://50.28.86.131",  // Primary
  "https://50.28.86.132",  // Backup 1
  "https://50.28.86.133",  // Backup 2
];

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    
    const req = protocol.get(url, { rejectUnauthorized: false }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on("error", reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

// Try each node until one works
async function queryNode(endpoint) {
  for (const node of NODES) {
    try {
      const url = `${node}${endpoint}`;
      return await makeRequest(url);
    } catch (e) {
      console.error(`Node ${node} failed:`, e.message);
      continue;
    }
  }
  throw new Error("All nodes failed");
}

// Tool implementations
const tools = {
  rustchain_balance: {
    name: "rustchain_balance",
    description: "Check RTC balance for any wallet address",
    inputSchema: {
      type: "object",
      properties: {
        miner_id: {
          type: "string",
          description: "The wallet/miner ID to check balance for",
        },
      },
      required: ["miner_id"],
    },
    handler: async ({ miner_id }) => {
      const result = await queryNode(`/wallet/balance?miner_id=${miner_id}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  
  rustchain_miners: {
    name: "rustchain_miners",
    description: "List active miners and their architectures",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const result = await queryNode("/api/miners");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  
  rustchain_epoch: {
    name: "rustchain_epoch",
    description: "Get current epoch info (slot, height, rewards)",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const result = await queryNode("/epoch");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  
  rustchain_health: {
    name: "rustchain_health",
    description: "Check node health across all attestation nodes",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const result = await queryNode("/health");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  
  rustchain_bounties: {
    name: "rustchain_bounties",
    description: "List open bounties with rewards",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      // This would typically fetch from GitHub API
      return {
        content: [
          {
            type: "text",
            text: "Visit https://github.com/Scottcjn/rustchain-bounties for open bounties",
          },
        ],
      };
    },
  },
};

// Create MCP Server
const server = new Server(
  {
    name: "rustchain-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(tools).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = tools[name];
  
  if (!tool) {
    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${name}`,
        },
      ],
      };
  }
  
  try {
    return await tool.handler(args);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("RustChain MCP Server running on stdio");
}

main().catch(console.error);
