import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import type { CustomerService } from "../../application/customer-service.ts";
import { CustomerMutationSchema, CustomerQuerySchema, CustomerSchema } from "../../domain/customer.ts";

export function registerGetCustomerTool(
    server: McpServer,
    service: CustomerService
): void {
    server.registerTool(
        "get_customer",
        {
            description: "Find a customer by _id, name, or phone number",
            inputSchema: CustomerQuerySchema,
            outputSchema: CustomerMutationSchema.shape,
        },
        async (query) => {
            try {
                const customer = await service.findCustomer(query);
                return {
                    content: [{ type: "text", text: JSON.stringify(customer, null, 2) }],
                    structuredContent: { customer },
                };
            } catch (err) {
                const message = `Failed to find customer. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        }
    );
}
