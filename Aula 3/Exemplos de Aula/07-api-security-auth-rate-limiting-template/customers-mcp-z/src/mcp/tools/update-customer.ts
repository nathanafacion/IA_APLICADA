import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CustomerService } from "../../application/customer-service.ts";
import { CustomerMutationSchema, CustomerUpdateSchema } from "../../domain/customer.ts";

export function registerUpdateCustomerTool(
    server: McpServer,
    service: CustomerService
): void {
    server.registerTool(
        "update_customer",
        {
            description:
                "Update an existing customer's name and/or phone number by their _id",
            inputSchema: CustomerUpdateSchema.shape,
            outputSchema: CustomerMutationSchema.shape,
        },
        async ({ _id, name, phone }) => {
            try {
                const result = await service.updateCustomer(_id, {
                    name,
                    phone,
                });
                return {
                    content: [{ type: "text", text: result.message ?? "" }],
                    structuredContent: result,
                };
            } catch (err) {
                const message = `Failed to update customer. Error: ${err instanceof Error ? err.message : String(err)}`;
                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { isError: true, message },
                };
            }
        }
    );
}
