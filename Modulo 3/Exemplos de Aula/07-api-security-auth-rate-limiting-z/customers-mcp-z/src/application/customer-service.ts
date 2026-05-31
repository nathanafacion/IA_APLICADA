import type { Customer, CustomerQuery, CustomerMutation } from "../domain/customer.ts";
import { CustomerHttpClient } from "../infrastructure/customer-http-client.ts";

export class CustomerService {
    private readonly client: CustomerHttpClient;

    constructor(baseUrl: string, serviceToken: string) {
        this.client = new CustomerHttpClient(baseUrl, serviceToken);
    }

    async listCustomers(): Promise<Customer[]> {
        return this.client.listCustomers()
    }

    async createCustomer(customer: Omit<Customer, '_id'>) {
        return this.client.createCustomer(customer)
    }

    async findCustomer(query: CustomerQuery): Promise<Customer | null> {
        if(query._id) return this.client.getCustomerById(query._id)

        const customers = await this.client.listCustomers()
        return (
            customers.find(customer => {
                const entries = Object.entries(query) as [keyof Customer, string][]

                return entries.every(([key, value]) => {
                    const customerValue = customer[key]
                    return customerValue?.includes(value)
                })
            })
        ) ?? null
    }

    async updateCustomer(
        id: string,
        data: Partial<Omit<Customer, '_id'>>
    ): Promise<CustomerMutation> {
        return this.client.updateCustomer(id, data);
    }

    async deleteCustomer(id: string): Promise<CustomerMutation> {
        return this.client.deleteCustomer(id);
    }
}
