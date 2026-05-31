const Database = require('better-sqlite3');
const db = new Database('data/rss.db');
const rows = db.prepare("SELECT * FROM chat_history WHERE role = 'assistant'").all();
rows.forEach(r => {
  console.log('--- MSG ID', r.id, '---');
  console.log(r.content);
  console.log('Has json block:', /```json/.test(r.content));
  console.log();
});
db.close();
