import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import type { CustomerService } from "../../application/customer-service.ts";
import { CustomerMutationSchema, CustomerSchema } from "../../domain/customer.ts";

export function registerListCustomersTool(
    server: McpServer,
    service: CustomerService
): void {
    server.registerTool(
        "list_customers",
        {
            description: "List all customers",
            inputSchema: {},
            outputSchema: CustomerMutationSchema.shape,
        },
        async () => {
            try {
                const customers = await service.listCustomers();
                return {
                    content: [{ type: "text", text: JSON.stringify(customers, null, 2) }],
                    structuredContent: { customers },
                };
            } catch (err) {
                const message = `Failed to list customers. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        }
    );
}
