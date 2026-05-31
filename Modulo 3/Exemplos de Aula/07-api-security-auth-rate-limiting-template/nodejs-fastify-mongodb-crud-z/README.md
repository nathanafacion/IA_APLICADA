# CRUD Ops with Node.js, Fastify, and MongoDB using the Node.js Test Runner

![Build Status](https://github.com/ErickWendel/nodejs-fastify-mongodb-crud/workflows/Run%20tests/badge.svg)

## Description

This project demonstrates how to perform CRUD operations using Node.js with the Fastify framework and MongoDB. It includes unit tests that verify the functionality of the API endpoints and track code coverage.

## Getting Started

### Prerequisites
- Docker and Docker compose
- Node.js (version 20 or later)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ErickWendel/nodejs-fastify-mongodb-crud.git
   cd nodejs-fastify-mongodb-crud
   ```

2. Install the dependencies:
   ```bash
   npm ci
   ```
### Running Tests

To run the tests and see code coverage, use:
```bash
docker-compose up -d mongodb
npm test
```
This will execute the tests defined in the project and provide a coverage report.


### Running the Project

To initialize the MongoDB, run:
```bash
docker-compose up -d mongodb
```

To initialize the project, run:
```bash
npm start
```
The server will start, and you can access the API on `http://localhost:9999` (or your specified port).


### Authentication & Authorization (RBAC)

This API uses **JWT-based authentication**. All routes except `GET /v1/health` require a valid Bearer token.

Two roles are available:

| Role   | Username    | Password | Permissions                  |
|--------|-------------|----------|------------------------------|
| admin  | erickwendel | 123123   | read, create, update, delete |
| member | ananeri     | 1234     | read only                    |

#### Generate a Service Token (rate limited — 3 requests per minute)

The `/v1/auth/service-token` endpoint requires valid user credentials **plus** the `adminSuperSecret`. It returns the user's role and a unique UUID service token.

The `adminSuperSecret` is: `AM I THE BOSS?`

```bash
# As admin
curl -X POST http://localhost:9999/v1/auth/service-token \
  -H "Content-Type: application/json" \
  -d '{"username": "erickwendel", "password": "123123", "adminSuperSecret": "AM I THE BOSS?"}'

# As member
curl -X POST http://localhost:9999/v1/auth/service-token \
  -H "Content-Type: application/json" \
  -d '{"username": "ananeri", "password": "1234", "adminSuperSecret": "AM I THE BOSS?"}'
```

Response:
```json
{ "role": "admin", "serviceToken": "550e8400-e29b-41d4-a716-446655440000" }
```

Store the service token and use it as a Bearer token for API calls:
```bash
export SERVICE_TOKEN="<uuid-from-response>"
curl http://localhost:9999/v1/customers \
  -H "Authorization: Bearer $SERVICE_TOKEN"
```

> ⚠️ Service token requests are rate limited to **3 requests per minute** per token. Exceeding the limit returns `429 Too Many Requests`.

#### Login as admin

```bash
curl -X POST http://localhost:9999/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "erickwendel", "password": "123123"}'
```

#### Login as member

```bash
curl -X POST http://localhost:9999/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "ananeri", "password": "1234"}'
```

Both return:
```json
{ "token": "<jwt-token>" }
```

Store the token and pass it as a Bearer header on subsequent requests:
```bash
export TOKEN="<jwt-token>"
```

### API Endpoints

All protected routes require the `Authorization: Bearer <token>` header.

1. **Health check** — public, no token needed (GET)
   ```bash
   curl http://localhost:9999/v1/health
   ```

2. **Create a Customer** — admin only (POST)
   ```bash
   curl -X POST http://localhost:9999/v1/customers \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"name": "John Doe", "phone": "123456789"}'
   ```

3. **Retrieve All Customers** — admin & member (GET)
   ```bash
   curl http://localhost:9999/v1/customers \
     -H "Authorization: Bearer $TOKEN"
   ```

4. **Retrieve a Customer by ID** — admin & member (GET)
   ```bash
   curl http://localhost:9999/v1/customers/<customer_id> \
     -H "Authorization: Bearer $TOKEN"
   ```

5. **Update a Customer** — admin only (PUT)
   ```bash
   curl -X PUT http://localhost:9999/v1/customers/<customer_id> \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"name": "Jane Doe", "phone": "987654321"}'
   ```

6. **Delete a Customer** — admin only (DELETE)
   ```bash
   curl -X DELETE http://localhost:9999/v1/customers/<customer_id> \
     -H "Authorization: Bearer $TOKEN"
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Fastify](https://www.fastify.io/) - Fast and low-overhead web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - NoSQL database for storing data
- [Node.js Test Runner](https://nodejs.org/en/docs/guides/test-runner/) - Built-in test runner for Node.js
