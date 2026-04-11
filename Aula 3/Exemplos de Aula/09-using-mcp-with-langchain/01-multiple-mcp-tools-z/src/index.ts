import { readFileSync } from 'fs';
import { createServer } from './server.ts';

const app = await createServer();

await app.listen({ port: 3000, host: '0.0.0.0' });
console.log(`Server is running on http://0.0.0.0:3000`);

const question = `
Crie 3 clientes de teste usando as tools de customer, depois guarde estes clientes em ./data/users.json, em seguida, liste os clientes cadastrados também pela tool de customers.`

app.inject({
  method: 'POST',
  url: '/chat',
  payload: {
    question,
  },
}).then(response => {
  console.log('Response from /chat:', response.statusCode)
  console.log(response.body);
  process.exit(0);
}).catch(error => {
  console.error('Error testing /chat endpoint:', error);
  process.exit(1);
});
