import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const API_URL = process.env.CUSTOMERS_API_URL ?? 'http://localhost:9999/v1'

export async function getServiceToken(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/service-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'erickwendel',
      password: '123123',
      adminSuperSecret: 'AM I THE BOSS?',
    }),
  })
  if (!res.ok) throw new Error(`Failed to get service token: ${res.status}`)
  const { serviceToken } = await res.json() as { serviceToken: string }
  return serviceToken
}

export async function createTestClient (serviceToken: string) {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['--experimental-strip-types', 'src/index.ts'],
    env: { ...process.env, SERVICE_TOKEN: serviceToken },
  })

  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  })

  await client.connect(transport)
  return client
}
