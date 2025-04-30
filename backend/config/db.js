const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Ganti dengan host MySQL kamu
  user: 'root', // Ganti dengan username MySQL kamu
  password: '', // Ganti dengan password MySQL kamu
  database: 'project_hmi', // Ganti dengan nama database kamu
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

module.exports = connection;
