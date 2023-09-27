const sqlite3 = require('sqlite3').verbose();

// Create a new database or open an existing one
const db = new sqlite3.Database('./backend/database/exerciseDB.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create a new table to store serial numbers and timestamps
const createTableSQL = `
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial TEXT NOT NULL,
    timestamp TEXT NOT NULL
)`;

db.run(createTableSQL, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Table created or already exists.');
});