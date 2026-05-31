import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import type { CustomerService } from "../../application/customer-service.ts";
import { CustomerMutationSchema } from "../../domain/customer.ts";

export function registerDeleteCustomerTool(
    server: McpServer,
    service: CustomerService
): void {
    server.registerTool(
        "delete_customer",
        {
            description: "Delete a customer by their _id",
            inputSchema: {
                _id: z
                    .string()
                    .describe("MongoDB ObjectId of the customer to delete"),
            },
            outputSchema: CustomerMutationSchema.shape,
        },
        async ({ _id }) => {
            try {
                const result = await service.deleteCustomer(_id);
                return {
                    content: [{ type: "text", text: result.message ?? "" }],
                    structuredContent: result,
                };
            } catch (err) {
                const message = `Failed to delete customer. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        }
    );
}
