#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

const TARGET_SERVER_URL = "https://api.nextrole.co.za/firstroleprod-mcp/mcp";

interface McpRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

interface McpResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: any;
}

class NextRoleMcpProxy {
  private server: Server;
  private sessionId: string | null = null;

  constructor() {
    this.server = new Server(
      {
        name: "nextrole-mcp-proxy",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_pricing",
            description:
              "Get the available career-level tiers and their product IDs. Different products are designed for different career phases, so the customer should pick the tier that best matches where they are in their career. You must call this before placing an order to get the correct productId.",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "get_credits",
            description:
              "Check how many credits a customer has remaining. Each order to tailor a CV and cover letter costs 1 credit.",
            inputSchema: {
              type: "object",
              properties: {
                phoneNumber: {
                  type: "string",
                  description:
                    "Customer phone number including country code (e.g. +27831234567)",
                },
              },
              required: ["phoneNumber"],
            },
          },
          {
            name: "place_order",
            description:
              "Place an order for a tailored CV and cover letter. The order typically takes about 15 minutes to complete. The customer will receive an SMS confirming their order and another SMS when their documents are ready to download. Costs 1 credit per order.",
            inputSchema: {
              type: "object",
              properties: {
                customerPhone: {
                  type: "string",
                  description:
                    "Customer phone number including country code, must start with '+' (e.g. +27831234567). SMS notifications will be sent to this number.",
                },
                customerFirstName: {
                  type: "string",
                  description: "Customer's first name",
                },
                customerLastName: {
                  type: "string",
                  description: "Customer's last name",
                },
                cvMarkdown: {
                  type: "string",
                  description:
                    "The customer's current CV in markdown format. This is used as the basis for tailoring their documents.",
                },
                productId: {
                  type: "integer",
                  description:
                    "The product ID that matches the customer's career level. Call get_pricing first to see available career-level tiers and their product IDs.",
                },
                jobDescription: {
                  type: "string",
                  description:
                    "The full job description the customer is applying for. The CV and cover letter will be tailored to match this role.",
                },
              },
              required: [
                "customerPhone",
                "customerFirstName",
                "customerLastName",
                "cvMarkdown",
                "productId",
                "jobDescription",
              ],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.forwardToTargetServer(name, args || {});

        // Parse JSON strings in content text fields so clients get structured data
        if (result?.content) {
          for (const item of result.content) {
            if (item.type === "text") {
              try {
                item.text = JSON.stringify(JSON.parse(item.text), null, 2);
              } catch {}
            }
          }
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: "Failed to process request",
                  details: errorMessage,
                  tool: name,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private parseSseResponse(body: string): McpResponse {
    for (const line of body.split("\n")) {
      if (line.startsWith("data: ")) {
        return JSON.parse(line.slice(6)) as McpResponse;
      }
    }
    return JSON.parse(body) as McpResponse;
  }

  private async ensureSession(): Promise<void> {
    if (this.sessionId) return;

    const initRequest: McpRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "nextrole-mcp-proxy", version: "1.0.0" },
      },
    };

    const response = await fetch(TARGET_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(initRequest),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize session: HTTP ${response.status}`);
    }

    this.sessionId = response.headers.get("mcp-session-id");
  }

  private async forwardToTargetServer(
    toolName: string,
    args: any,
  ): Promise<any> {
    await this.ensureSession();

    const mcpRequest: McpRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (this.sessionId) {
      headers["Mcp-Session-Id"] = this.sessionId;
    }

    const response = await fetch(TARGET_SERVER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(mcpRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}: ${await response.text()}`);
    }

    const body = await response.text();
    const mcpResponse = this.parseSseResponse(body);

    if (mcpResponse.error) {
      throw new Error(`MCP Error: ${JSON.stringify(mcpResponse.error)}`);
    }

    return mcpResponse.result;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("NextRole MCP Proxy Server running on stdio");
  }
}

const server = new NextRoleMcpProxy();
server.run().catch(console.error);
