import { describe, beforeEach, before, after, it } from 'node:test'
import { deepStrictEqual, ok } from 'node:assert'
import { runSeed } from '../config/seed.js'
import { users } from '../config/users.js'
import { REQUESTS_PER_MINUTE } from '../src/config.js'

describe('API Workflow', () => {
    let _testServer
    let _testServerAddress
    let _adminToken
    let _memberToken

    function authHeaders(token) {
        return { Authorization: `Bearer ${token ?? _adminToken}` }
    }

    function createCustomer(customer, token) {
        return _testServer.inject({
            method: 'POST',
            url: `${_testServerAddress}/v1/customers`,
            headers: authHeaders(token),
            payload: customer,
        })
    }

    function getCustomers(token) {
        return _testServer.inject({
            method: 'GET',
            url: `${_testServerAddress}/v1/customers`,
            headers: authHeaders(token),
        })
    }

    function getCustomerById(id, token) {
        return _testServer.inject({
            method: 'GET',
            url: `${_testServerAddress}/v1/customers/${id}`,
            headers: authHeaders(token),
        })
    }

    function updateCustomer(id, customer, token) {
        return _testServer.inject({
            method: 'PUT',
            url: `${_testServerAddress}/v1/customers/${id}`,
            headers: authHeaders(token),
            payload: customer,
        })
    }

    function deleteCustomer(id, token) {
        return _testServer.inject({
            method: 'DELETE',
            url: `${_testServerAddress}/v1/customers/${id}`,
            headers: authHeaders(token),
        })
    }

    async function validateUsersListOrderedByName(usersSent) {
        const res = await getCustomers()
        const statusCode = res.statusCode
        const result = await res.json()

        const sort = items => items
            .map(({ _id, ...remaining }) => remaining)
            .sort((a, b) => a.name.localeCompare(b.name))

        const expectSortedByName = sort(usersSent)

        deepStrictEqual(statusCode, 200)
        deepStrictEqual(sort(result), expectSortedByName)
    }

    before(async () => {
        const { server } = await import('../src/index.js')
        _testServer = server

        _testServerAddress = await server.listen();

        const [adminRes, memberRes] = await Promise.all([
            _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/login`,
                payload: { username: 'erickwendel', password: '123123' },
            }),
            _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/login`,
                payload: { username: 'ananeri', password: '1234' },
            }),
        ])
        _adminToken = (await adminRes.json()).token
        _memberToken = (await memberRes.json()).token
    })

    beforeEach(async () => {
        return runSeed()
    })

    after(async () => _testServer.close())


    describe.skip('POST /v1/auth/service-token', () => {
        const ADMIN_SUPER_SECRET = 'AM I THE BOSS?'

        it('should return role and a UUID serviceToken for valid admin credentials', async () => {
            const res = await _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/service-token`,
                payload: { username: 'erickwendel', password: '123123', adminSuperSecret: ADMIN_SUPER_SECRET },
            })
            deepStrictEqual(res.statusCode, 200)
            const result = await res.json()
            deepStrictEqual(result.role, 'admin')
            ok(result.serviceToken)
            ok(/^[0-9a-f-]{36}$/.test(result.serviceToken), 'serviceToken should be a UUID')
        })

        it('should return role and a UUID serviceToken for valid member credentials', async () => {
            const res = await _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/service-token`,
                payload: { username: 'ananeri', password: '1234', adminSuperSecret: ADMIN_SUPER_SECRET },
            })
            deepStrictEqual(res.statusCode, 200)
            const result = await res.json()
            deepStrictEqual(result.role, 'member')
            ok(/^[0-9a-f-]{36}$/.test(result.serviceToken), 'serviceToken should be a UUID')
        })

        it('should return 401 for wrong adminSuperSecret', async () => {
            const res = await _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/service-token`,
                payload: { username: 'erickwendel', password: '123123', adminSuperSecret: 'wrong-secret' },
            })
            deepStrictEqual(res.statusCode, 401)
            deepStrictEqual((await res.json()).message, 'Invalid adminSuperSecret')
        })

        it('should return 401 for wrong user credentials', async () => {
            const res = await _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/service-token`,
                payload: { username: 'nobody', password: 'wrong', adminSuperSecret: ADMIN_SUPER_SECRET },
            })
            deepStrictEqual(res.statusCode, 401)
            deepStrictEqual((await res.json()).message, 'Invalid credentials')
        })
    })

    describe.skip('Service token - API access & rate limiting', () => {
        const ADMIN_SUPER_SECRET = 'AM I THE BOSS?'

        it(`should allow API access and rate limit after ${REQUESTS_PER_MINUTE} requests with the service token`, async () => {
            const tokenRes = await _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/service-token`,
                payload: { username: 'erickwendel', password: '123123', adminSuperSecret: ADMIN_SUPER_SECRET },
            })
            const { serviceToken } = await tokenRes.json()
            const serviceAuthHeaders = { Authorization: `Bearer ${serviceToken}` }
            const opts = { method: 'GET', url: `${_testServerAddress}/v1/customers`, headers: serviceAuthHeaders }

            for (let i = 1; i <= REQUESTS_PER_MINUTE; i++) {
                const res = await _testServer.inject(opts)
                deepStrictEqual(res.statusCode, 200, `Request ${i} should be allowed`)
            }

            // request REQUESTS_PER_MINUTE + 1: rate limited
            const r4 = await _testServer.inject(opts)
            deepStrictEqual(r4.statusCode, 429)
        })
    })

    describe.skip('POST /v1/auth/login', () => {
        it('should return a token for valid credentials (admin)', async () => {
            const res = await _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/login`,
                payload: { username: 'erickwendel', password: '123123' },
            })
            deepStrictEqual(res.statusCode, 200)
            const result = await res.json()
            ok(result.token)
        })

        it('should return a token for valid credentials (member)', async () => {
            const res = await _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/login`,
                payload: { username: 'ananeri', password: '1234' },
            })
            deepStrictEqual(res.statusCode, 200)
            const result = await res.json()
            ok(result.token)
        })

        it('should return 401 for invalid credentials', async () => {
            const res = await _testServer.inject({
                method: 'POST',
                url: `${_testServerAddress}/v1/auth/login`,
                payload: { username: 'wrong', password: 'wrong' },
            })
            deepStrictEqual(res.statusCode, 401)
        })

        it('should return 401 for protected route without token', async () => {
            const res = await _testServer.inject({
                method: 'GET',
                url: `${_testServerAddress}/v1/customers`,
            })
            deepStrictEqual(res.statusCode, 401)
        })
    })

    describe.skip('RBAC - member role', () => {
        it('member can list customers (GET /v1/customers)', async () => {
            const res = await getCustomers(_memberToken)
            deepStrictEqual(res.statusCode, 200)
        })

        it('member can get customer by id (GET /v1/customers/:id)', async () => {
            const created = await createCustomer({ name: 'RBAC Test', phone: '000' })
            const { id } = await created.json()
            const res = await getCustomerById(id, _memberToken)
            deepStrictEqual(res.statusCode, 200)
        })

        it('member cannot create customer (POST /v1/customers)', async () => {
            const res = await createCustomer({ name: 'Forbidden', phone: '000' }, _memberToken)
            deepStrictEqual(res.statusCode, 403)
            deepStrictEqual((await res.json()).message, 'Forbidden: insufficient permissions')
        })

        it('member cannot update customer (PUT /v1/customers/:id)', async () => {
            const created = await createCustomer({ name: 'RBAC Test', phone: '000' })
            const { id } = await created.json()
            const res = await updateCustomer(id, { name: 'Changed', phone: '111' }, _memberToken)
            deepStrictEqual(res.statusCode, 403)
            deepStrictEqual((await res.json()).message, 'Forbidden: insufficient permissions')
        })

        it('member cannot delete customer (DELETE /v1/customers/:id)', async () => {
            const created = await createCustomer({ name: 'RBAC Test', phone: '000' })
            const { id } = await created.json()
            const res = await deleteCustomer(id, _memberToken)
            deepStrictEqual(res.statusCode, 403)
            deepStrictEqual((await res.json()).message, 'Forbidden: insufficient permissions')
        })
    })

    describe('GET /v1/health', () => {
        it('should return health without auth', async () => {
            const res = await _testServer.inject({
                method: 'GET',
                url: `${_testServerAddress}/v1/health`,
            })
            deepStrictEqual(res.statusCode, 200)
            deepStrictEqual(await res.json(), { app: 'customers', version: 'v1.0.1' })
        })
    })

    describe('POST /v1/customers', () => {
        it('should create customer', async () => {
            const input = {
                name: 'Xuxa da Silva',
                phone: '123456789',
            }

            const expected = { message: `user ${input.name} created!` }


            const res = await createCustomer(input)
            deepStrictEqual(res.statusCode, 201)
            const result = await res.json()
            ok(result.id)
            delete result.id
            deepStrictEqual(result, expected)

            await validateUsersListOrderedByName([...users, input])
        })
    })

    describe(`GET /v1/customers`, () => {
        it('should retrieve only initial users', async () => {
            return validateUsersListOrderedByName(users)
        })

        it('given 5 different customers it should have valid list', async () => {
            const customers = [
                { name: 'Erick Wendel', phone: '123456789' },
                { name: 'Ana Neri', phone: '123456789' },
                { name: 'Shrek de Souza', phone: '123456789' },
                { name: 'Nemo de Oliveira', phone: '123456789' },
                { name: 'Buzz da Rocha', phone: '123456789' },
            ]
            await Promise.all(
                customers.map(customer => createCustomer(customer))
            )

            await validateUsersListOrderedByName(users.concat(customers))
        })
    })

    describe(`GET /v1/customers/:id`, () => {
        it('should retrieve a customer by ID', async () => {
            const customerResponse = await createCustomer({
                name: 'Test User',
                phone: '123456789',
            })

            const { id } = await customerResponse.json() // Extracting the ID from the response

            const res = await getCustomerById(id)
            deepStrictEqual(res.statusCode, 200)
            deepStrictEqual(await res.json(), { id, name: 'Test User', phone: '123456789' })
        })

        it('should return 404 for non-existent customer', async () => {
            const res = await getCustomerById('66fbfd09785d518f5c747366')
            deepStrictEqual(res.statusCode, 404)
        })
    })

    describe(`PUT /v1/customers/:id`, () => {
        it('should update a customer', async () => {
            const customerResponse = await createCustomer({
                name: 'Update User',
                phone: '123456789',
            })

            const { id } = await customerResponse.json() // Extracting the ID from the response

            const updatedData = { name: 'Updated Name', phone: '987654321' }
            const res = await updateCustomer(id, updatedData)
            deepStrictEqual(res.statusCode, 200)
            deepStrictEqual(await res.json(), { message: `User ${id} updated!`, id })

            const updatedUser = await getCustomerById(id)
            deepStrictEqual(updatedUser.statusCode, 200)
            deepStrictEqual(await updatedUser.json(), { id, ...updatedData })
        })

        it('should return 400 for invalid id', async () => {
            const id = '123'
            const res = await updateCustomer(id, { name: 'New Name', phone: '123' })
            deepStrictEqual(res.statusCode, 400)
            const result = await res.json()
            deepStrictEqual(result, { message: 'the id is invalid!', id })
        })
    })

    describe(`DELETE /v1/customers/:id`, () => {
        it('should delete a customer', async () => {
            const customerResponse = await createCustomer({
                name: 'Delete User',
                phone: '123456789',
            })

            const { id } = await customerResponse.json() // Extracting the ID from the response

            const res = await deleteCustomer(id)
            deepStrictEqual(res.statusCode, 200)
            deepStrictEqual(await res.json(), { message: `User ${id} deleted!`, id })

            const deletedUser = await getCustomerById(id)
            deepStrictEqual(deletedUser.statusCode, 404)
        })

        it('should return 400 for id invalid', async () => {
            const id = '123'
            const res = await deleteCustomer(id)
            deepStrictEqual(res.statusCode, 400)
            deepStrictEqual(await res.json(), { message: 'the id is invalid!', id })
        })
    })
})
