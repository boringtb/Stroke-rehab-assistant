const sqlite3 = require('sqlite3').verbose();

// Create a new database or open an existing one
const db = new sqlite3.Database('./backend/database/exerciseDB.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create the 'users' table to store unique user IDs
const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY
)`;

db.run(createUsersTableSQL, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Users table created or already exists.');
});

// Modify the 'records' table to have a foreign key relationship with 'users'
const createRecordsTableSQL = `
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL REFERENCES users(userId),
    serial TEXT NOT NULL,
    summary TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

db.run(createRecordsTableSQL, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Records table created or already exists.');
});


module.exports = db;