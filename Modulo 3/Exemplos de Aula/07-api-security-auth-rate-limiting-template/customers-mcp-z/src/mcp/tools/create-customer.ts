import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import type { CustomerService } from "../../application/customer-service.ts";
import { CustomerMutationSchema } from "../../domain/customer.ts";

export function registerCreateCustomerTool(
    server: McpServer,
    service: CustomerService
): void {
    server.registerTool(
        "create_customer",
        {
            description: "Create a new customer",
            inputSchema: {
                name: z.string().describe("Full name of the customer"),
                phone: z.string().describe("Phone number of the customer"),
            },
            outputSchema: CustomerMutationSchema.shape,
        },
        async ({ name, phone }) => {
            try {
                const result = await service.createCustomer({ name, phone });
                return {
                    content: [{ type: "text", text: result.message ?? "" }],
                    structuredContent: result,
                };
            } catch (err) {
                const message = `Failed to create customer. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        }
    );
}
