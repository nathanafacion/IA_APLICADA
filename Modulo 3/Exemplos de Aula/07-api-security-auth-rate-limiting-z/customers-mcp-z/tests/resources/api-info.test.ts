import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import { createTestClient, getServiceToken } from '../helpers.ts'
import { Client } from '@modelcontextprotocol/sdk/client'

describe('Customer Resources', async () => {
  let client: Client

  before(async () => {
    const serviceToken = await getServiceToken()
    client = await createTestClient(serviceToken)
  })

  after(async () => {
    await client.close()
  })

  it('should list the customers://api-info resource', async () => {
    const { resources } = await client.listResources()
    const info = resources.find(r => r.uri === 'customers://api-info')
    assert.ok(info, 'customers://api-info resource should be listed')
  })

  it('should read the customers://api-info resource', async () => {
    const result = await client.readResource({ uri: 'customers://api-info' })
    const content = result.contents[0]
    assert.ok(content, 'Resource should have content')
    assert.ok('text' in content && content.text.includes('/customers'), 'Resource should describe the API endpoints')
  })
})
